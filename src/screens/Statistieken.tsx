import { Speler, Wedstrijd, Doelpunt, formaties, ALLE_THEMAS } from '../types';
import { berekenTeamPrestaties, berekenTopscorers, berekenSpeelminutenDetail } from '../utils/calculations';

interface Props {
  spelers: Speler[];
  wedstrijden: Wedstrijd[];
}

export default function Statistieken({ spelers, wedstrijden }: Props) {
  const getFormatie = (formatieNaam: string): string[] => {
    if (formatieNaam === '6x6') {
      return formaties['6x6-vliegtuig'];
    }
    return formaties[formatieNaam] || [];
  };

  // ============================================
  // ORIGINEEL: TEAM PRESTATIES & TOPSCORERS
  // ============================================
  const berekenTeamPrestaties = () => {
    let totaalEigenDoelpunten = 0;
    let totaalTegenstanderDoelpunten = 0;
    let gewonnen = 0;
    let gelijkspel = 0;
    let verloren = 0;
    
    wedstrijden.forEach(wed => {
      let eigenDoelpunten = 0;
      let tegenstanderDoelpunten = 0;
      
      wed.kwarten.forEach(kwart => {
        if (kwart.doelpunten) {
          kwart.doelpunten.forEach(doelpunt => {
            if (doelpunt.type === 'eigen') {
              eigenDoelpunten++;
              totaalEigenDoelpunten++;
            } else {
              tegenstanderDoelpunten++;
              totaalTegenstanderDoelpunten++;
            }
          });
        }
      });
      
      if (eigenDoelpunten > tegenstanderDoelpunten) {
        gewonnen++;
      } else if (eigenDoelpunten < tegenstanderDoelpunten) {
        verloren++;
      } else if (eigenDoelpunten > 0 || tegenstanderDoelpunten > 0) {
        gelijkspel++;
      }
    });
    
    const totaalWedstrijden = gewonnen + gelijkspel + verloren;
    const winstPercentage = totaalWedstrijden > 0 ? Math.round((gewonnen / totaalWedstrijden) * 100) : 0;
    const doelsaldo = totaalEigenDoelpunten - totaalTegenstanderDoelpunten;
    
    return {
      totaalEigenDoelpunten,
      totaalTegenstanderDoelpunten,
      doelsaldo,
      gewonnen,
      gelijkspel,
      verloren,
      totaalWedstrijden,
      winstPercentage
    };
  };

  const berekenTopscorers = () => {
    const scorers: Record<number, { naam: string; doelpunten: number }> = {};
    
    spelers.forEach(s => {
      scorers[s.id] = { naam: s.naam, doelpunten: 0 };
    });
    
    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(kwart => {
        if (kwart.doelpunten) {
          kwart.doelpunten.forEach(doelpunt => {
            if (doelpunt.type === 'eigen' && doelpunt.spelerId && scorers[doelpunt.spelerId]) {
              scorers[doelpunt.spelerId].doelpunten++;
            }
          });
        }
      });
    });
    
    return Object.values(scorers)
      .filter(s => s.doelpunten > 0)
      .sort((a, b) => b.doelpunten - a.doelpunten);
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

        Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
          if (sid && stats[Number(sid)]) {
            const wissel = kwart.wissels?.find(w => w.positie === pos);
            if (wissel && wissel.wisselSpelerId) {
              stats[Number(sid)].regeliarMinuten += 6.25;
              spelersThisKwart[Number(sid)] = 6.25;
            } else {
              stats[Number(sid)].regeliarMinuten += minutesPerKwart;
              spelersThisKwart[Number(sid)] = minutesPerKwart;
            }
          }
        });

        kwart.wissels?.forEach(w => {
          if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
            const minuten = (kwart.minuten - (spelersThisKwart[Number(w.wisselSpelerId)] || 0));
            stats[Number(w.wisselSpelerId)].wisselMinuten += minuten;
            spelersThisKwart[Number(w.wisselSpelerId)] = (spelersThisKwart[Number(w.wisselSpelerId)] || 0) + minuten;
          }
        });

        spelers.forEach(s => {
          const gespeeld = spelersThisKwart[s.id] || 0;
          const bank = minutesPerKwart - gespeeld;
          if (bank > 0) {
            stats[s.id].bankMinuten += bank;
          }
        });
      });
    });

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

    Object.values(stats).forEach(stat => {
      stat.totaalMinuten = stat.regeliarMinuten + stat.wisselMinuten;
      stat.gemiddeldePerWedstrijd = stat.wedstrijden > 0 ? Math.round(stat.totaalMinuten / stat.wedstrijden * 10) / 10 : 0;
    });

    return Object.values(stats);
  };

  // ============================================
  // PRIORITY 1: POSITIE SUCCESS RATE
  // ============================================
  const berekenPositieSuccessRate = () => {
    interface PositieSuccess {
      [key: number]: {
        naam: string;
        posities: Record<string, { 
          count: number; 
          wins: number; 
          successRate: number;
          percentage: number;
        }>;
        bestPositie: string;
        successRateBest: number;
      }
    }

    const stats: PositieSuccess = {};
    spelers.forEach(s => {
      stats[s.id] = {
        naam: s.naam,
        posities: {},
        bestPositie: '',
        successRateBest: 0
      };
    });

    wedstrijden.forEach((wed, wedIdx) => {
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
      const teamWon = eigenDoelpunten > tegenstanderDoelpunten;

      wed.kwarten.forEach(k => {
        Object.entries(k.opstelling).forEach(([pos, sid]) => {
          if (sid && stats[Number(sid)]) {
            if (!stats[Number(sid)].posities[pos]) {
              stats[Number(sid)].posities[pos] = { count: 0, wins: 0, successRate: 0, percentage: 0 };
            }
            stats[Number(sid)].posities[pos].count += 1;
            if (teamWon) {
              stats[Number(sid)].posities[pos].wins += 1;
            }
          }
        });
        k.wissels?.forEach(w => {
          if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
            if (!stats[Number(w.wisselSpelerId)].posities[w.positie]) {
              stats[Number(w.wisselSpelerId)].posities[w.positie] = { count: 0, wins: 0, successRate: 0, percentage: 0 };
            }
            stats[Number(w.wisselSpelerId)].posities[w.positie].count += 1;
            if (teamWon) {
              stats[Number(w.wisselSpelerId)].posities[w.positie].wins += 1;
            }
          }
        });
      });
    });

    Object.values(stats).forEach(stat => {
      const totaal = Object.values(stat.posities).reduce((sum, p) => sum + p.count, 0);
      let bestPositie = '';
      let bestSuccessRate = -1;

      Object.entries(stat.posities).forEach(([pos, data]) => {
        data.percentage = totaal > 0 ? Math.round((data.count / totaal) * 100) : 0;
        data.successRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
        
        if (data.successRate > bestSuccessRate && data.count >= 2) {
          bestSuccessRate = data.successRate;
          bestPositie = pos;
        }
      });

      stat.bestPositie = bestPositie;
      stat.successRateBest = bestSuccessRate >= 0 ? bestSuccessRate : 0;
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
    }

    const themaStats: Record<string, ThemaSucces> = {};

    ALLE_THEMAS.forEach(thema => {
      themaStats[thema.id] = {
        id: thema.id,
        label: thema.label,
        emoji: thema.emoji,
        goed: 0,
        beter: 0,
        totaal: 0,
        percentage: 0
      };
    });

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

    Object.values(themaStats).forEach(stat => {
      if (stat.totaal > 0) {
        stat.percentage = Math.round((stat.goed / stat.totaal) * 100);
      }
    });

    return Object.values(themaStats);
  };

  // ============================================
  // PRIORITY 2: NIEUWE TRENDS
  // ============================================
  
  const berekenDoelpuntenPerKwart = () => {
    interface KwartStats {
      kwartNummer: number;
      eigenDoelpunten: number;
      tegenstanderDoelpunten: number;
      gemiddeldEigen: number;
      gemiddeldTegenstander: number;
    }

    const kwartStats: KwartStats[] = [
      { kwartNummer: 1, eigenDoelpunten: 0, tegenstanderDoelpunten: 0, gemiddeldEigen: 0, gemiddeldTegenstander: 0 },
      { kwartNummer: 2, eigenDoelpunten: 0, tegenstanderDoelpunten: 0, gemiddeldEigen: 0, gemiddeldTegenstander: 0 },
      { kwartNummer: 3, eigenDoelpunten: 0, tegenstanderDoelpunten: 0, gemiddeldEigen: 0, gemiddeldTegenstander: 0 },
      { kwartNummer: 4, eigenDoelpunten: 0, tegenstanderDoelpunten: 0, gemiddeldEigen: 0, gemiddeldTegenstander: 0 }
    ];

    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(kwart => {
        if (kwart.doelpunten) {
          kwart.doelpunten.forEach(doelpunt => {
            if (doelpunt.type === 'eigen') {
              kwartStats[kwart.nummer - 1].eigenDoelpunten++;
            } else {
              kwartStats[kwart.nummer - 1].tegenstanderDoelpunten++;
            }
          });
        }
      });
    });

    const aantalWedstrijden = wedstrijden.length || 1;
    kwartStats.forEach(stat => {
      stat.gemiddeldEigen = Math.round((stat.eigenDoelpunten / aantalWedstrijden) * 10) / 10;
      stat.gemiddeldTegenstander = Math.round((stat.tegenstanderDoelpunten / aantalWedstrijden) * 10) / 10;
    });

    return kwartStats;
  };

  const berekenThuisUitTrend = () => {
    let thuisGewonnen = 0, thuisVerloren = 0, thuisGelijk = 0;
    let uitGewonnen = 0, uitVerloren = 0, uitGelijk = 0;

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

      const isThuis = wed.thuisUit !== 'uit';
      
      if (eigenDoelpunten > tegenstanderDoelpunten) {
        if (isThuis) thuisGewonnen++;
        else uitGewonnen++;
      } else if (eigenDoelpunten < tegenstanderDoelpunten) {
        if (isThuis) thuisVerloren++;
        else uitVerloren++;
      } else if (eigenDoelpunten > 0 || tegenstanderDoelpunten > 0) {
        if (isThuis) thuisGelijk++;
        else uitGelijk++;
      }
    });

    const thuisTotal = thuisGewonnen + thuisVerloren + thuisGelijk;
    const uitTotal = uitGewonnen + uitVerloren + uitGelijk;

    return {
      thuis: {
        gewonnen: thuisGewonnen,
        verloren: thuisVerloren,
        gelijk: thuisGelijk,
        totaal: thuisTotal,
        winPercentage: thuisTotal > 0 ? Math.round((thuisGewonnen / thuisTotal) * 100) : 0
      },
      uit: {
        gewonnen: uitGewonnen,
        verloren: uitVerloren,
        gelijk: uitGelijk,
        totaal: uitTotal,
        winPercentage: uitTotal > 0 ? Math.round((uitGewonnen / uitTotal) * 100) : 0
      }
    };
  };

  const berekenLaatste3 = () => {
    const laatste3 = wedstrijden.slice(-3);
    
    interface Laatste3Stat {
      datum: string;
      tegenstander: string;
      thuisUit: string;
      eigenDoelpunten: number;
      tegenstanderDoelpunten: number;
      resultaat: string;
    }
    
    const stats: Laatste3Stat[] = [];

    laatste3.forEach(wed => {
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

      let resultaat = 'gelijkspel';
      if (eigenDoelpunten > tegenstanderDoelpunten) resultaat = 'gewonnen';
      else if (eigenDoelpunten < tegenstanderDoelpunten) resultaat = 'verloren';

      stats.push({
        datum: wed.datum,
        tegenstander: wed.tegenstander || 'Tegenstander',
        thuisUit: wed.thuisUit === 'uit' ? '✈️ Uit' : '🏠 Thuis',
        eigenDoelpunten,
        tegenstanderDoelpunten,
        resultaat
      });
    });

    let trend = 'stable';
    if (stats.length >= 2) {
      const recentWins = stats.filter(s => s.resultaat === 'gewonnen').length;
      const olderWins = wedstrijden.slice(-6, -3).filter(w => {
        let eigen = 0, tegen = 0;
        w.kwarten.forEach(k => {
          k.doelpunten?.forEach(d => {
            if (d.type === 'eigen') eigen++;
            else tegen++;
          });
        });
        return eigen > tegen;
      }).length;

      if (recentWins > olderWins) trend = 'improving';
      else if (recentWins < olderWins) trend = 'declining';
    }

    return {
      wedstrijden: stats,
      trend
    };
  };

  const berekenWaarschuwingen = () => {
    interface Waarschuwing {
      type: 'low-playtime' | 'high-absence' | 'unbalanced' | 'inconsistent';
      speler?: string;
      bericht: string;
      urgentie: 'hoog' | 'medium' | 'laag';
    }

    const waarschuwingen: Waarschuwing[] = [];
    const speelminutenDetail = berekenSpeelminutenDetail(wedstrijden, spelers);
    const totalWedstrijden = wedstrijden.length;

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

    return waarschuwingen;
  };

  const speelminutenDetail = berekenSpeelminutenDetail();
  const positieSuccessRate = berekenPositieSuccessRate();
  const themaSucces = berekenThemaSucces();
  const doelpuntenPerKwart = berekenDoelpuntenPerKwart();
  const thuisUitTrend = berekenThuisUitTrend();
  const laatste3 = berekenLaatste3();
  const waarschuwingen = berekenWaarschuwingen();
  const teamPrestaties = berekenTeamPrestaties();
  const topscorers = berekenTopscorers(wedstrijden, spelers);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistieken</h2>

      {wedstrijden.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
      ) : (
        <>
          {/* ========== WAARSCHUWINGEN ========== */}
          {waarschuwingen.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">🚨 Aandachtspunten</h3>
              {waarschuwingen.map((w, idx) => {
                const bgColor = w.urgentie === 'hoog' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300';
                const textColor = w.urgentie === 'hoog' ? 'text-red-800' : 'text-yellow-800';
                return (
                  <div key={idx} className={`border-2 rounded-lg p-4 ${bgColor}`}>
                    <p className={`font-semibold text-sm ${textColor}`}>{w.bericht}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========== TEAM PRESTATIES ========== */}
          {(() => {
            if (teamPrestaties.totaalEigenDoelpunten === 0 && teamPrestaties.totaalTegenstanderDoelpunten === 0) {
              return null;
            }
            
            return (
              <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-50">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🏆 Team Prestaties</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-green-600">{teamPrestaties.totaalEigenDoelpunten}</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Voor</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-red-600">{teamPrestaties.totaalTegenstanderDoelpunten}</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Tegen</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-yellow-200">
                    <div className={`text-2xl font-bold ${
                      teamPrestaties.doelsaldo > 0 ? 'text-green-600' : 
                      teamPrestaties.doelsaldo < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {teamPrestaties.doelsaldo > 0 ? '+' : ''}{teamPrestaties.doelsaldo}
                    </div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Doelsaldo</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-blue-600">{teamPrestaties.winstPercentage}%</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Winst %</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-100 rounded-lg p-2 text-center border-2 border-green-300">
                    <div className="text-xl font-bold text-green-700">{teamPrestaties.gewonnen}</div>
                    <div className="text-xs text-green-700 font-medium">Gewonnen</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 text-center border-2 border-gray-300">
                    <div className="text-xl font-bold text-gray-700">{teamPrestaties.gelijkspel}</div>
                    <div className="text-xs text-gray-700 font-medium">Gelijk</div>
                  </div>
                  <div className="bg-red-100 rounded-lg p-2 text-center border-2 border-red-300">
                    <div className="text-xl font-bold text-red-700">{teamPrestaties.verloren}</div>
                    <div className="text-xs text-gray-700 font-medium">Verloren</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========== TOPSCORERS ========== */}
          {(() => {
            if (topscorers.length === 0) {
              return null;
            }
            
            return (
              <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">⚽ Topscorers</h3>
                <div className="space-y-2">
                  {topscorers.map((scorer, index) => {
                    let medalEmoji = '';
                    let borderColor = 'border-gray-300';
                    let bgColor = 'bg-white';
                    
                    if (index === 0) {
                      medalEmoji = '🥇';
                      borderColor = 'border-yellow-400';
                      bgColor = 'bg-yellow-50';
                    } else if (index === 1) {
                      medalEmoji = '🥈';
                      borderColor = 'border-gray-400';
                      bgColor = 'bg-gray-50';
                    } else if (index === 2) {
                      medalEmoji = '🥉';
                      borderColor = 'border-orange-400';
                      bgColor = 'bg-orange-50';
                    }
                    
                    return (
                      <div 
                        key={scorer.naam} 
                        className={`flex items-center justify-between p-3 rounded-lg border-2 ${borderColor} ${bgColor} shadow-sm`}
                      >
                        <div className="flex items-center gap-2">
                          {medalEmoji && <span className="text-2xl">{medalEmoji}</span>}
                          <div>
                            <div className="font-bold text-sm">{scorer.naam}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{scorer.doelpunten}</div>
                          <div className="text-xs text-gray-600 font-medium">
                            {scorer.doelpunten === 1 ? 'doelpunt' : 'doelpunten'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ========== SPEELMINUTEN DETAIL ========== */}
          <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">⏱️ Speelminuten Detail</h3>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
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
                      <td className="py-2 px-2 font-medium text-sm">{stat.naam}</td>
                      <td className="text-right py-2 px-2 text-sm">{stat.regeliarMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2 text-sm">{stat.wisselMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2 text-sm">{stat.bankMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2 font-bold text-sm">{stat.totaalMinuten.toFixed(1)}</td>
                      <td className="text-right py-2 px-2 text-sm">{stat.gemiddeldePerWedstrijd.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========== POSITIE SUCCESS RATE ========== */}
          <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">🏆 Positie Success Rate</h3>
            <p className="text-xs text-gray-600 mb-3">Meest succesvolle positie per speler (% wins als team)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {positieSuccessRate.sort((a, b) => a.naam.localeCompare(b.naam)).map(stat => {
                const totalPosities = Object.values(stat.posities).reduce((sum, p) => sum + p.count, 0);
                if (totalPosities === 0) return null;

                return (
                  <div key={stat.naam} className="border rounded-lg p-3 bg-white">
                    <h4 className="font-bold text-sm mb-2">{stat.naam}</h4>
                    {stat.bestPositie ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-green-100 p-2 rounded border border-green-300">
                          <span className="font-semibold">Meest succesvol:</span>
                          <span className="text-lg font-bold text-green-600">{stat.bestPositie}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success rate:</span>
                          <span className="font-semibold text-green-600">{stat.successRateBest}%</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="text-xs font-semibold text-gray-700 mb-1">Alle posities:</div>
                          {Object.entries(stat.posities)
                            .sort((a, b) => b[1].successRate - a[1].successRate)
                            .map(([pos, data]) => (
                              <div key={pos} className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{pos}: {data.count}x</span>
                                <span className="font-semibold">{data.successRate}%</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Nog onvoldoende data</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========== THEMA SUCCESS ========== */}
          <div className="border-2 border-purple-400 rounded-lg p-4 bg-purple-50">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🎯 Thema Success %</h3>
            {themaSucces.filter(t => t.totaal > 0).length === 0 ? (
              <p className="text-sm text-gray-600">Nog geen thema's geëvalueerd</p>
            ) : (
              <div className="space-y-2">
                {themaSucces
                  .filter(t => t.totaal > 0)
                  .sort((a, b) => b.percentage - a.percentage)
                  .map(tema => {
                    return (
                      <div key={tema.id} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{tema.emoji}</span>
                            <div>
                              <div className="font-semibold text-sm">{tema.label}</div>
                              <div className="text-xs text-gray-600">{tema.goed}/{tema.totaal} goed</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{tema.percentage}%</div>
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

          {/* ========== DOELPUNTEN PER KWART ========== */}
          <div className="border-2 border-indigo-400 rounded-lg p-4 bg-indigo-50">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">📊 Doelpunten per Kwart</h3>
            <p className="text-xs text-gray-600 mb-3">Gemiddeld per kwart over alle wedstrijden</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {doelpuntenPerKwart.map(kwart => (
                <div key={kwart.kwartNummer} className="bg-white rounded-lg p-3 border-2 border-indigo-300">
                  <h4 className="font-bold text-sm text-center mb-2">Kwart {kwart.kwartNummer}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xs">Wij:</span>
                      <span className="font-bold text-green-600">{kwart.gemiddeldEigen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">Zij:</span>
                      <span className="font-bold text-red-600">{kwart.gemiddeldTegenstander}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========== THUIS VS UIT ========== */}
          <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🏠✈️ Thuis vs Uit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border-2 border-green-300">
                <h4 className="font-bold text-sm mb-2 text-green-700">🏠 Thuis ({thuisUitTrend.thuis.totaal})</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-xs">Gewonnen:</span>
                    <span className="font-bold text-green-600">{thuisUitTrend.thuis.gewonnen}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Gelijk:</span>
                    <span className="font-bold text-gray-600">{thuisUitTrend.thuis.gelijk}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Verloren:</span>
                    <span className="font-bold text-red-600">{thuisUitTrend.thuis.verloren}x</span>
                  </div>
                  <div className="border-t pt-1 mt-1 flex justify-between bg-green-50 p-2 rounded">
                    <span className="text-xs font-semibold">Winpercentage:</span>
                    <span className="font-bold text-lg text-green-600">{thuisUitTrend.thuis.winPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border-2 border-orange-300">
                <h4 className="font-bold text-sm mb-2 text-orange-700">✈️ Uit ({thuisUitTrend.uit.totaal})</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-xs">Gewonnen:</span>
                    <span className="font-bold text-green-600">{thuisUitTrend.uit.gewonnen}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Gelijk:</span>
                    <span className="font-bold text-gray-600">{thuisUitTrend.uit.gelijk}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Verloren:</span>
                    <span className="font-bold text-red-600">{thuisUitTrend.uit.verloren}x</span>
                  </div>
                  <div className="border-t pt-1 mt-1 flex justify-between bg-orange-50 p-2 rounded">
                    <span className="text-xs font-semibold">Winpercentage:</span>
                    <span className="font-bold text-lg text-orange-600">{thuisUitTrend.uit.winPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== LAATSTE 3 WEDSTRIJDEN ========== */}
          <div className="border-2 border-cyan-400 rounded-lg p-4 bg-cyan-50">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">📋 Laatste {Math.min(3, wedstrijden.length)} Wedstrijden</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-600">Trend:</span>
              <span className={`font-bold text-sm ${
                laatste3.trend === 'improving' ? 'text-green-600' : 
                laatste3.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {laatste3.trend === 'improving' ? '📈 Verbetert!' : 
                 laatste3.trend === 'declining' ? '📉 Verslechtert' : '➡️ Stabiel'}
              </span>
            </div>
            <div className="space-y-2">
              {laatste3.wedstrijden.map((wed, idx) => {
                const resultaatColor = wed.resultaat === 'gewonnen' ? 'bg-green-100 border-green-400' : 
                                       wed.resultaat === 'verloren' ? 'bg-red-100 border-red-400' : 'bg-gray-100 border-gray-400';
                const resultaatEmoji = wed.resultaat === 'gewonnen' ? '✅' : 
                                       wed.resultaat === 'verloren' ? '❌' : '🤝';
                
                return (
                  <div key={idx} className={`border-2 rounded-lg p-3 ${resultaatColor}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">{wed.tegenstander}</div>
                        <div className="text-xs text-gray-600">{wed.datum} • {wed.thuisUit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{wed.eigenDoelpunten} - {wed.tegenstanderDoelpunten}</div>
                        <div className="text-sm">{resultaatEmoji} {wed.resultaat}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
