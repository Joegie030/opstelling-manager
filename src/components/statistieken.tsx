import { Speler, Wedstrijd, Doelpunt, formaties, ALLE_THEMAS } from '../types';

interface Props {
  spelers: Speler[];
  wedstrijden: Wedstrijd[];
}

export default function Statistieken({ spelers, wedstrijden }: Props) {
  // Helper functie voor backward compatibility
  const getFormatie = (formatieNaam: string): string[] => {
    if (formatieNaam === '6x6') {
      return formaties['6x6-vliegtuig'];
    }
    return formaties[formatieNaam] || [];
  };

  // ============================================
  // PRIORITY 1: SPLIT SPEELMINUTEN
  // ============================================
  const berekenSpeelminutenDetail = () => {
    interface DetailStats {
      [key: number]: {
        naam: string;
        regeliarMinuten: number;
        wisselMinuten: number;
        bankMinuten: number;
        totaalMinuten: number;
        gemiddeldePerWedstrijd: number;
        wedstrijden: number;
      }
    }

    const stats: DetailStats = {};
    spelers.forEach(s => {
      stats[s.id] = { 
        naam: s.naam,
        regeliarMinuten: 0,
        wisselMinuten: 0,
        bankMinuten: 0,
        totaalMinuten: 0,
        gemiddeldePerWedstrijd: 0,
        wedstrijden: 0
      };
    });

    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(kwart => {
        const minutesPerKwart = kwart.minuten;
        const spelersThisKwart: Record<number, number> = {};

        // Reguliere opstelling
        Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
          if (sid && stats[Number(sid)]) {
            const wissel = kwart.wissels?.find(w => w.positie === pos);
            if (wissel && wissel.wisselSpelerId) {
              // Speler start, wordt gewisseld
              stats[Number(sid)].regeliarMinuten += 6.25;
              spelersThisKwart[Number(sid)] = 6.25;
            } else {
              // Speler speelt volledig kwart
              stats[Number(sid)].regeliarMinuten += minutesPerKwart;
              spelersThisKwart[Number(sid)] = minutesPerKwart;
            }
          }
        });

        // Wissels
        kwart.wissels?.forEach(w => {
          if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
            const minuten = (kwart.minuten - (spelersThisKwart[Number(w.wisselSpelerId)] || 0));
            stats[Number(w.wisselSpelerId)].wisselMinuten += minuten;
            spelersThisKwart[Number(w.wisselSpelerId)] = (spelersThisKwart[Number(w.wisselSpelerId)] || 0) + minuten;
          }
        });

        // Bank tijd
        spelers.forEach(s => {
          const gespeeld = spelersThisKwart[s.id] || 0;
          const bank = minutesPerKwart - gespeeld;
          if (bank > 0) {
            stats[s.id].bankMinuten += bank;
          }
        });
      });
    });

    // Bereken totaal en gemiddelde
    wedstrijden.forEach(wed => {
      const spelersInWed = new Set<number>();
      wed.kwarten.forEach(k => {
        Object.values(k.opstelling).forEach(sid => {
          if (sid) spelersInWed.add(Number(sid));
        });
        k.wissels?.forEach(w => {
          if (w.wisselSpelerId) spelersInWed.add(Number(w.wisselSpelerId));
        });
      });
      spelersInWed.forEach(sid => {
        if (stats[sid]) {
          stats[sid].wedstrijden += 1;
        }
      });
    });

    // Totaal en gemiddelde
    Object.values(stats).forEach(stat => {
      stat.totaalMinuten = stat.regeliarMinuten + stat.wisselMinuten;
      stat.gemiddeldePerWedstrijd = stat.wedstrijden > 0 ? Math.round(stat.totaalMinuten / stat.wedstrijden * 10) / 10 : 0;
    });

    return Object.values(stats);
  };

  // ============================================
  // PRIORITY 1: POSITIE VOORKEUR
  // ============================================
  const berekenPositieVoorkeur = () => {
    interface PositieVoorkeur {
      [key: number]: {
        naam: string;
        posities: Record<string, { count: number; percentage: number }>;
        voorkeurPositie: string;
        minderVoorkeurPositie: string;
      }
    }

    const stats: PositieVoorkeur = {};
    spelers.forEach(s => {
      stats[s.id] = {
        naam: s.naam,
        posities: {},
        voorkeurPositie: '',
        minderVoorkeurPositie: ''
      };
    });

    // Count posities
    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(k => {
        Object.entries(k.opstelling).forEach(([pos, sid]) => {
          if (sid && stats[Number(sid)]) {
            if (!stats[Number(sid)].posities[pos]) {
              stats[Number(sid)].posities[pos] = { count: 0, percentage: 0 };
            }
            stats[Number(sid)].posities[pos].count += 1;
          }
        });
        k.wissels?.forEach(w => {
          if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
            if (!stats[Number(w.wisselSpelerId)].posities[w.positie]) {
              stats[Number(w.wisselSpelerId)].posities[w.positie] = { count: 0, percentage: 0 };
            }
            stats[Number(w.wisselSpelerId)].posities[w.positie].count += 1;
          }
        });
      });
    });

    // Bereken percentage en voorkeur
    Object.values(stats).forEach(stat => {
      const totaal = Object.values(stat.posities).reduce((sum, p) => sum + p.count, 0);
      Object.entries(stat.posities).forEach(([pos, data]) => {
        data.percentage = totaal > 0 ? Math.round((data.count / totaal) * 100) : 0;
      });

      const sorted = Object.entries(stat.posities).sort((a, b) => b[1].count - a[1].count);
      stat.voorkeurPositie = sorted.length > 0 ? sorted[0][0] : '';
      stat.minderVoorkeurPositie = sorted.length > 1 ? sorted[sorted.length - 1][0] : '';
    });

    return Object.values(stats);
  };

  // ============================================
  // PRIORITY 2: THEMA SUCCESS %
  // ============================================
  const berekenThemaSucces = () => {
    interface ThemaSucces {
      id: string;
      label: string;
      emoji: string;
      goed: number;
      beter: number;
      totaal: number;
      percentage: number;
      trend: 'improving' | 'stable' | 'declining' | 'new';
    }

    const themaStats: Record<string, ThemaSucces> = {};

    // Initialize
    ALLE_THEMAS.forEach(thema => {
      themaStats[thema.id] = {
        id: thema.id,
        label: thema.label,
        emoji: thema.emoji,
        goed: 0,
        beter: 0,
        totaal: 0,
        percentage: 0,
        trend: 'new'
      };
    });

    // Count beoordelingen
    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(kwart => {
        if (kwart.themaBeoordelingen) {
          Object.entries(kwart.themaBeoordelingen).forEach(([themaId, beoordeling]) => {
            if (themaStats[themaId]) {
              if (beoordeling === 'goed') {
                themaStats[themaId].goed++;
              } else if (beoordeling === 'beter') {
                themaStats[themaId].beter++;
              }
              themaStats[themaId].totaal++;
            }
          });
        }
      });
    });

    // Bereken percentage
    Object.values(themaStats).forEach(stat => {
      if (stat.totaal > 0) {
        stat.percentage = Math.round((stat.goed / stat.totaal) * 100);
      }
    });

    // Bereken trend (simpel: vergelijk eerste helft vs tweede helft)
    Object.values(themaStats).forEach(stat => {
      if (stat.totaal < 2) {
        stat.trend = 'new';
      } else {
        const halfwayPoint = Math.floor(stat.totaal / 2);
        const firstHalf = wedstrijden.slice(0, Math.ceil(wedstrijden.length / 2));
        const secondHalf = wedstrijden.slice(Math.ceil(wedstrijden.length / 2));

        let firstHalfGoed = 0;
        let firstHalfTotal = 0;
        let secondHalfGoed = 0;
        let secondHalfTotal = 0;

        firstHalf.forEach(wed => {
          wed.kwarten.forEach(k => {
            if (k.themaBeoordelingen?.[stat.id]) {
              if (k.themaBeoordelingen[stat.id] === 'goed') firstHalfGoed++;
              firstHalfTotal++;
            }
          });
        });

        secondHalf.forEach(wed => {
          wed.kwarten.forEach(k => {
            if (k.themaBeoordelingen?.[stat.id]) {
              if (k.themaBeoordelingen[stat.id] === 'goed') secondHalfGoed++;
              secondHalfTotal++;
            }
          });
        });

        const firstHalfPercent = firstHalfTotal > 0 ? firstHalfGoed / firstHalfTotal : 0;
        const secondHalfPercent = secondHalfTotal > 0 ? secondHalfGoed / secondHalfTotal : 0;

        if (secondHalfPercent > firstHalfPercent + 0.1) {
          stat.trend = 'improving';
        } else if (secondHalfPercent < firstHalfPercent - 0.1) {
          stat.trend = 'declining';
        } else {
          stat.trend = 'stable';
        }
      }
    });

    return Object.values(themaStats);
  };

  // ============================================
  // PRIORITY 2: TRENDS
  // ============================================
  const berekenTrends = () => {
    interface Trend {
      doelpunten: { voor: number[]; tegen: number[] };
      doelsaldo: number[];
      winPercentage: number[];
    }

    const trends: Trend = {
      doelpunten: { voor: [], tegen: [] },
      doelsaldo: [],
      winPercentage: []
    };

    let cumulativeWonnen = 0;
    let cumulativeTotaal = 0;

    wedstrijden.forEach(wed => {
      let eigenDoelpunten = 0;
      let tegenstanderDoelpunten = 0;

      wed.kwarten.forEach(kwart => {
        if (kwart.doelpunten) {
          kwart.doelpunten.forEach(doelpunt => {
            if (doelpunt.type === 'eigen') eigenDoelpunten++;
            else tegenstanderDoelpunten++;
          });
        }
      });

      trends.doelpunten.voor.push(eigenDoelpunten);
      trends.doelpunten.tegen.push(tegenstanderDoelpunten);
      trends.doelsaldo.push(eigenDoelpunten - tegenstanderDoelpunten);

      if (eigenDoelpunten > tegenstanderDoelpunten) cumulativeWonnen++;
      if (eigenDoelpunten > 0 || tegenstanderDoelpunten > 0) cumulativeTotaal++;

      trends.winPercentage.push(cumulativeTotaal > 0 ? Math.round((cumulativeWonnen / cumulativeTotaal) * 100) : 0);
    });

    return trends;
  };

  // ============================================
  // PRIORITY 2: WAARSCHUWINGEN
  // ============================================
  const berekenWaarschuwingen = () => {
    interface Waarschuwing {
      type: 'low-playtime' | 'high-absence' | 'unbalanced' | 'inconsistent';
      speler?: string;
      bericht: string;
      urgentie: 'hoog' | 'medium' | 'laag';
    }

    const waarschuwingen: Waarschuwing[] = [];
    const speelminutenDetail = berekenSpeelminutenDetail();
    const totalWedstrijden = wedstrijden.length;

    // Waarschuwing 1: Lage speeltijd
    speelminutenDetail.forEach(stat => {
      if (stat.wedstrijden > 0) {
        const percentagePlayed = (stat.totaalMinuten / (stat.wedstrijden * 50)) * 100;
        if (percentagePlayed < 30 && stat.wedstrijden >= 3) {
          waarschuwingen.push({
            type: 'low-playtime',
            speler: stat.naam,
            bericht: `${stat.naam} speelt maar ${percentagePlayed.toFixed(0)}% van beschikbare tijd`,
            urgentie: percentagePlayed < 20 ? 'hoog' : 'medium'
          });
        }
      }
    });

    // Waarschuwing 2: Veel afwezigheid
    speelminutenDetail.forEach(stat => {
      if (stat.wedstrijden > 0) {
        const afwezig = totalWedstrijden - stat.wedstrijden;
        const afwezigPercentage = (afwezig / totalWedstrijden) * 100;
        if (afwezigPercentage > 40 && totalWedstrijden >= 3) {
          waarschuwingen.push({
            type: 'high-absence',
            speler: stat.naam,
            bericht: `${stat.naam} is ${afwezig}x afwezig (${afwezigPercentage.toFixed(0)}%)`,
            urgentie: afwezigPercentage > 60 ? 'hoog' : 'laag'
          });
        }
      }
    });

    // Waarschuwing 3: Onevenwichtige speeltijd
    const gemiddeldeTotaal = speelminutenDetail.reduce((sum, s) => sum + s.totaalMinuten, 0) / speelminutenDetail.length;
    speelminutenDetail.forEach(stat => {
      if (Math.abs(stat.totaalMinuten - gemiddeldeTotaal) > gemiddeldeTotaal * 0.5 && stat.wedstrijden > 0) {
        if (stat.totaalMinuten > gemiddeldeTotaal * 1.5) {
          waarschuwingen.push({
            type: 'unbalanced',
            speler: stat.naam,
            bericht: `${stat.naam} speelt veel meer dan gemiddelde`,
            urgentie: 'medium'
          });
        }
      }
    });

    return waarschuwingen;
  };

  const speelminutenDetail = berekenSpeelminutenDetail();
  const positieVoorkeur = berekenPositieVoorkeur();
  const themaSucces = berekenThemaSucces();
  const trends = berekenTrends();
  const waarschuwingen = berekenWaarschuwingen();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistieken</h2>

      {wedstrijden.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
      ) : (
        <>
          {/* ========== PRIORITY 2: WAARSCHUWINGEN ========== */}
          {waarschuwingen.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">🚨 Aandachtspunten</h3>
              {waarschuwingen.map((w, idx) => {
                const bgColor = w.urgentie === 'hoog' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300';
                const textColor = w.urgentie === 'hoog' ? 'text-red-800' : 'text-yellow-800';
                return (
                  <div key={idx} className={`border-2 rounded-lg p-4 ${bgColor}`}>
                    <p className={`font-semibold ${textColor}`}>{w.bericht}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========== PRIORITY 1: SPEELMINUTEN DETAIL ========== */}
          <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">⏱️ Speelminuten Detail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Speler</th>
                    <th className="text-right py-2 px-2">Regulier</th>
                    <th className="text-right py-2 px-2">Wissel</th>
                    <th className="text-right py-2 px-2">Bank</th>
                    <th className="text-right py-2 px-2">Totaal</th>
                    <th className="text-right py-2 px-2">Gem/Wed</th>
                  </tr>
                </thead>
                <tbody>
                  {speelminutenDetail.sort((a, b) => b.totaalMinuten - a.totaalMinuten).map(stat => (
                    <tr key={stat.naam} className="border-b hover:bg-blue-100">
                      <td className="py-2 px-2 font-medium">{stat.naam}</td>
                      <td className="text-right py-2 px-2">{stat.regeliarMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2">{stat.wisselMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2">{stat.bankMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2 font-bold">{stat.totaalMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2">{stat.gemiddeldePerWedstrijd.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========== PRIORITY 1: POSITIE VOORKEUR ========== */}
          <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🏆 Positie Voorkeur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {positieVoorkeur.sort((a, b) => a.naam.localeCompare(b.naam)).map(stat => {
                const totalPosities = Object.values(stat.posities).reduce((sum, p) => sum + p.count, 0);
                if (totalPosities === 0) return null;

                return (
                  <div key={stat.naam} className="border rounded-lg p-3 bg-white">
                    <h4 className="font-bold text-base mb-2">{stat.naam}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold">Voorkeur:</span>
                        <span className="text-green-600 font-bold">{stat.voorkeurPositie}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minst:</span>
                        <span className="text-orange-600">{stat.minderVoorkeurPositie}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 text-xs">
                        {Object.entries(stat.posities)
                          .sort((a, b) => b[1].count - a[1].count)
                          .map(([pos, data]) => (
                            <div key={pos} className="flex justify-between">
                              <span>{pos}:</span>
                              <span>{data.count}x ({data.percentage}%)</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========== PRIORITY 2: THEMA SUCCESS ========== */}
          <div className="border-2 border-purple-400 rounded-lg p-4 bg-purple-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🎯 Thema Success %</h3>
            {themaSucces.filter(t => t.totaal > 0).length === 0 ? (
              <p className="text-gray-600">Nog geen thema's geëvalueerd</p>
            ) : (
              <div className="space-y-3">
                {themaSucces
                  .filter(t => t.totaal > 0)
                  .sort((a, b) => b.percentage - a.percentage)
                  .map(tema => {
                    const trendEmoji = tema.trend === 'improving' ? '📈' : tema.trend === 'declining' ? '📉' : '➡️';
                    return (
                      <div key={tema.id} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{tema.emoji}</span>
                            <div>
                              <div className="font-semibold">{tema.label}</div>
                              <div className="text-xs text-gray-600">{tema.goed}/{tema.totaal} goed</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{tema.percentage}%</div>
                            <div className="text-sm">{trendEmoji} {tema.trend}</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${tema.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ========== PRIORITY 2: TRENDS ========== */}
          {wedstrijden.length >= 2 && (
            <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📈 Trends</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Doelpunten trend */}
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <h4 className="font-bold text-sm mb-2">Doelpunten</h4>
                  <div className="space-y-1 text-xs">
                    {trends.doelpunten.voor.map((voor, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>Wed {idx + 1}:</span>
                        <span className="font-semibold">
                          {voor} <span className="text-gray-500">- {trends.doelpunten.tegen[idx]}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doelsaldo trend */}
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <h4 className="font-bold text-sm mb-2">Doelsaldo</h4>
                  <div className="space-y-1 text-xs">
                    {trends.doelsaldo.map((saldo, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>Wed {idx + 1}:</span>
                        <span className={`font-semibold ${
                          saldo > 0 ? 'text-green-600' : saldo < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {saldo > 0 ? '+' : ''}{saldo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Winpercentage trend */}
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <h4 className="font-bold text-sm mb-2">Winpercentage</h4>
                  <div className="space-y-1 text-xs">
                    {trends.winPercentage.map((percentage, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>Na Wed {idx + 1}:</span>
                        <span className="font-semibold text-blue-600">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== ORIGINEEL: Team Prestaties ========== */}
          {/* (Behouden uit originele statistieken.tsx) */}
        </>
      )}
    </div>
  );
}
