import { Speler, Wedstrijd, Doelpunt, formaties } from '../types';

interface Props {
  spelers: Speler[];
  wedstrijden: Wedstrijd[];
}

export default function Statistieken({ spelers, wedstrijden }: Props) {
  // Helper functie voor backward compatibility met oude '6x6' formatie
  const getFormatie = (formatieNaam: string): string[] => {
    // @ts-ignore - Voor backward compatibility met oude data
    if (formatieNaam === '6x6') {
      return formaties['6x6-vliegtuig'];
    }
    // @ts-ignore - Type check skippen voor oude formaties
    return formaties[formatieNaam] || [];
  };

  const berekenAlgemeneStats = () => {
    interface Stats {
      [key: number]: {
        naam: string;
        totaalMinuten: number;
        totaalKeeperBeurten: number;
        totaalWisselMinuten: number;
        wedstrijden: number;
      }
    }

    const stats: Stats = {};
    spelers.forEach(s => {
      stats[s.id] = { 
        naam: s.naam, 
        totaalMinuten: 0, 
        totaalKeeperBeurten: 0, 
        totaalWisselMinuten: 0, 
        wedstrijden: 0 
      };
    });

    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(kwart => {
        const spelersMetMinuten: Record<string, number> = {};
        
        Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
          if (sid && stats[Number(sid)]) {
            const wissel = kwart.wissels?.find(w => w.positie === pos);
            const min = wissel && wissel.wisselSpelerId ? 6.25 : kwart.minuten;
            stats[Number(sid)].totaalMinuten += min;
            spelersMetMinuten[sid] = (spelersMetMinuten[sid] || 0) + min;
            if (pos === 'Keeper') stats[Number(sid)].totaalKeeperBeurten += 1;
          }
        });
        
        kwart.wissels?.forEach(w => {
          if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
            stats[Number(w.wisselSpelerId)].totaalMinuten += 6.25;
            spelersMetMinuten[w.wisselSpelerId] = (spelersMetMinuten[w.wisselSpelerId] || 0) + 6.25;
            if (w.positie === 'Keeper') stats[Number(w.wisselSpelerId)].totaalKeeperBeurten += 1;
          }
        });
        
        spelers.forEach(s => {
          const gespeeld = spelersMetMinuten[s.id.toString()] || 0;
          const wissel = kwart.minuten - gespeeld;
          if (wissel > 0) stats[s.id].totaalWisselMinuten += wissel;
        });
      });
    });

    wedstrijden.forEach(wed => {
      const spelersInWed = new Set<string>();
      wed.kwarten.forEach(k => {
        Object.values(k.opstelling).forEach(sid => { if (sid) spelersInWed.add(sid); });
      });
      spelersInWed.forEach(sid => { 
        if (stats[Number(sid)]) stats[Number(sid)].wedstrijden += 1; 
      });
    });
    
    return Object.values(stats);
  };

  // NIEUW: Bereken topscorers
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

  // NIEUW: Bereken team prestaties
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
        // Alleen gelijkspel tellen als er daadwerkelijk doelpunten zijn gevallen
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistieken</h2>
      {wedstrijden.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
      ) : (
        <>
          {/* NIEUW: Team Prestaties */}
          {(() => {
            const prestaties = berekenTeamPrestaties();
            
            // Alleen tonen als er doelpunten zijn
            if (prestaties.totaalEigenDoelpunten === 0 && prestaties.totaalTegenstanderDoelpunten === 0) {
              return null;
            }
            
            return (
              <div className="border-2 border-yellow-400 rounded-lg p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                  🏆 Team Prestaties
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl sm:text-4xl font-bold text-green-600">
                      {prestaties.totaalEigenDoelpunten}
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Voor</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl sm:text-4xl font-bold text-red-600">
                      {prestaties.totaalTegenstanderDoelpunten}
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Tegen</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className={`text-3xl sm:text-4xl font-bold ${
                      prestaties.doelsaldo > 0 ? 'text-green-600' : 
                      prestaties.doelsaldo < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {prestaties.doelsaldo > 0 ? '+' : ''}{prestaties.doelsaldo}
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Doelsaldo</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                      {prestaties.winstPercentage}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Winst %</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-100 rounded-lg p-3 text-center border-2 border-green-300">
                    <div className="text-2xl font-bold text-green-700">{prestaties.gewonnen}</div>
                    <div className="text-xs text-green-700 font-medium">Gewonnen</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-center border-2 border-gray-300">
                    <div className="text-2xl font-bold text-gray-700">{prestaties.gelijkspel}</div>
                    <div className="text-xs text-gray-700 font-medium">Gelijk</div>
                  </div>
                  <div className="bg-red-100 rounded-lg p-3 text-center border-2 border-red-300">
                    <div className="text-2xl font-bold text-red-700">{prestaties.verloren}</div>
                    <div className="text-xs text-gray-700 font-medium">Verloren</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* NIEUW: Topscorers */}
          {(() => {
            const topscorers = berekenTopscorers();
            
            if (topscorers.length === 0) {
              return null;
            }
            
            return (
              <div className="border-2 border-green-400 rounded-lg p-4 sm:p-6 bg-gradient-to-br from-green-50 to-blue-50">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                  ⚽ Topscorers
                </h3>
                <div className="space-y-3">
                  {topscorers.map((scorer, index) => {
                    let medalEmoji = '';
                    let borderColor = 'border-gray-300';
                    let bgColor = 'bg-white';
                    
                    if (index === 0) {
                      medalEmoji = '🥇';
                      borderColor = 'border-yellow-400';
                      bgColor = 'bg-gradient-to-r from-yellow-50 to-yellow-100';
                    } else if (index === 1) {
                      medalEmoji = '🥈';
                      borderColor = 'border-gray-400';
                      bgColor = 'bg-gradient-to-r from-gray-50 to-gray-100';
                    } else if (index === 2) {
                      medalEmoji = '🥉';
                      borderColor = 'border-orange-400';
                      bgColor = 'bg-gradient-to-r from-orange-50 to-orange-100';
                    }
                    
                    return (
                      <div 
                        key={scorer.naam} 
                        className={`flex items-center justify-between p-4 rounded-lg border-2 ${borderColor} ${bgColor} shadow-sm`}
                      >
                        <div className="flex items-center gap-3">
                          {medalEmoji && <span className="text-3xl">{medalEmoji}</span>}
                          <div>
                            <div className="font-bold text-lg">{scorer.naam}</div>
                            {index < 3 && (
                              <div className="text-xs text-gray-600 font-medium">
                                {index === 0 ? 'Topscorer!' : index === 1 ? '2e plaats' : '3e plaats'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">
                            {scorer.doelpunten}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {scorer.doelpunten === 1 ? 'doelpunt' : 'doelpunten'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {topscorers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nog geen doelpunten geregistreerd
                  </p>
                )}
              </div>
            );
          })()}

          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="text-xl font-semibold mb-3">Totaal Overzicht Alle Spelers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Speler</th>
                    <th className="text-right py-2">Wedstrijden</th>
                    <th className="text-right py-2">Gespeeld</th>
                    <th className="text-right py-2">Wissel</th>
                    <th className="text-right py-2">Keeper</th>
                  </tr>
                </thead>
                <tbody>
                  {berekenAlgemeneStats().sort((a, b) => b.totaalMinuten - a.totaalMinuten).map(stat => (
                    <tr key={stat.naam} className="border-b">
                      <td className="py-2 font-medium">{stat.naam}</td>
                      <td className="text-right py-2">{stat.wedstrijden}</td>
                      <td className="text-right py-2">{stat.totaalMinuten} min</td>
                      <td className="text-right py-2">{stat.totaalWisselMinuten} min</td>
                      <td className="text-right py-2">{stat.totaalKeeperBeurten}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="text-xl font-semibold mb-3">Positie Statistieken</h3>
            <p className="text-sm text-gray-600 mb-3">Hoe vaak heeft elke speler op elke positie gespeeld?</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 sticky left-0 bg-blue-50">Speler</th>
                    {(() => {
                      const allePosities = new Set<string>();
                      wedstrijden.forEach(w => {
                        getFormatie(w.formatie).forEach(p => allePosities.add(p));
                      });
                      return Array.from(allePosities).sort().map(p => (
                        <th key={p} className="text-center py-2 px-2 text-sm">{p}</th>
                      ));
                    })()}
                    <th className="text-right py-2 px-2">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const positieStats: Record<number, { naam: string; posities: Record<string, number> }> = {};
                    const allePosities = new Set<string>();
                    
                    spelers.forEach(s => {
                      positieStats[s.id] = { naam: s.naam, posities: {} };
                    });
                    
                    wedstrijden.forEach(w => {
                      getFormatie(w.formatie).forEach(p => allePosities.add(p));
                    });
                    
                    wedstrijden.forEach(wed => {
                      wed.kwarten.forEach(k => {
                        Object.entries(k.opstelling).forEach(([pos, sid]) => {
                          if (sid && positieStats[Number(sid)]) {
                            if (!positieStats[Number(sid)].posities[pos]) {
                              positieStats[Number(sid)].posities[pos] = 0;
                            }
                            positieStats[Number(sid)].posities[pos] += 1;
                          }
                        });
                        k.wissels?.forEach(w => {
                          if (w.wisselSpelerId && positieStats[Number(w.wisselSpelerId)]) {
                            if (!positieStats[Number(w.wisselSpelerId)].posities[w.positie]) {
                              positieStats[Number(w.wisselSpelerId)].posities[w.positie] = 0;
                            }
                            positieStats[Number(w.wisselSpelerId)].posities[w.positie] += 1;
                          }
                        });
                      });
                    });
                    
                    const positiesArray = Array.from(allePosities).sort();
                    
                    return Object.values(positieStats)
                      .sort((a, b) => a.naam.localeCompare(b.naam))
                      .map(spelerStat => {
                        const totaal = Object.values(spelerStat.posities).reduce((sum, val) => sum + val, 0);
                        return (
                          <tr key={spelerStat.naam} className="border-b hover:bg-blue-100">
                            <td className="py-2 px-2 font-medium sticky left-0 bg-blue-50">{spelerStat.naam}</td>
                            {positiesArray.map(positie => (
                              <td key={positie} className="text-center py-2 px-2">
                                {spelerStat.posities[positie] || '-'}
                              </td>
                            ))}
                            <td className="text-right py-2 px-2 font-semibold">{totaal}x</td>
                          </tr>
                        );
                      });
                  })()}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 Tip: Dit telt hoe vaak een speler op een positie heeft gespeeld over alle wedstrijden. 
              Als een speler invalt op een positie, telt dat ook mee.
            </p>
          </div>
        </>
      )}
    </div>
  );
}