import { Speler, Wedstrijd, formaties } from '../types';

interface Props {
  spelers: Speler[];
  wedstrijden: Wedstrijd[];
}

export default function Statistieken({ spelers, wedstrijden }: Props) {
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
          if (stats[s.id]) {
            const gespeeld = spelersMetMinuten[s.id.toString()] || 0;
            const wissel = kwart.minuten - gespeeld;
            if (wissel > 0) stats[s.id].totaalWisselMinuten += wissel;
          }
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistieken</h2>
      {wedstrijden.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
      ) : (
        <>
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
                        formaties[w.formatie].forEach(p => allePosities.add(p));
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
                      formaties[w.formatie].forEach(p => allePosities.add(p));
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