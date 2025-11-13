import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ALLE_THEMAS } from '../types';
import { useWedstrijd } from './WedstrijdContext';
import { formatResultaat } from '../utils/formatters';

export function WedstrijdSamenvatting() {
  const [sections, setSections] = useState({
    resultaat: true,
    thema: false,
    kwarten: false,
    doelpunten: false,
    opmerkingen: false,
    statistieken: false
  });

  const { wedstrijd, teamNaam, spelers } = useWedstrijd();

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const berekenEindstand = () => {
    let eigenDoelpunten = 0;
    let tegenstanderDoelpunten = 0;
    const doelpuntenmakers: Record<number, { naam: string; goals: number }> = {};
    
    wedstrijd.kwarten.forEach(kwart => {
      if (kwart.doelpunten) {
        kwart.doelpunten.forEach(doelpunt => {
          if (doelpunt.type === 'eigen') {
            eigenDoelpunten++;
            if (doelpunt.spelerId) {
              if (!doelpuntenmakers[doelpunt.spelerId]) {
                const speler = spelers.find(s => s.id === doelpunt.spelerId);
                doelpuntenmakers[doelpunt.spelerId] = {
                  naam: speler?.naam || 'Onbekend',
                  goals: 0
                };
              }
              doelpuntenmakers[doelpunt.spelerId].goals++;
            }
          } else {
            tegenstanderDoelpunten++;
          }
        });
      }
    });
    
    const doelpuntenmakersList = Object.values(doelpuntenmakers).sort((a, b) => b.goals - a.goals);
    
    return {
      eigenDoelpunten,
      tegenstanderDoelpunten,
      doelpuntenmakers: doelpuntenmakersList,
      resultaat: eigenDoelpunten > tegenstanderDoelpunten ? 'gewonnen' :
                 eigenDoelpunten < tegenstanderDoelpunten ? 'verloren' : 'gelijkspel'
    };
  };

  const berekenWedstrijdStats = () => {
    const stats: Record<number, { naam: string; minuten: number; keeperBeurten: number; wisselMinuten: number }> = {};
    
    spelers.forEach(s => {
      stats[s.id] = { naam: s.naam, minuten: 0, keeperBeurten: 0, wisselMinuten: 0 };
    });

    wedstrijd.kwarten.forEach(kwart => {
      const spelersMetMinuten: Record<string, number> = {};
      
      Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
        if (sid && stats[Number(sid)]) {
          const wissel = kwart.wissels?.find(w => w.positie === pos);
          const min = wissel && wissel.wisselSpelerId ? 6.25 : kwart.minuten;
          stats[Number(sid)].minuten += min;
          spelersMetMinuten[sid] = (spelersMetMinuten[sid] || 0) + min;
          if (pos === 'Keeper') stats[Number(sid)].keeperBeurten += 1;
        }
      });
      
      kwart.wissels?.forEach(w => {
        if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
          stats[Number(w.wisselSpelerId)].minuten += 6.25;
          spelersMetMinuten[w.wisselSpelerId] = (spelersMetMinuten[w.wisselSpelerId] || 0) + 6.25;
          if (w.positie === 'Keeper') stats[Number(w.wisselSpelerId)].keeperBeurten += 1;
        }
      });
      
      spelers.forEach(s => {
        const gespeeld = spelersMetMinuten[s.id.toString()] || 0;
        const wissel = kwart.minuten - gespeeld;
        if (wissel > 0) stats[s.id].wisselMinuten += wissel;
      });
    });

    return Object.values(stats).filter(s => s.minuten > 0).sort((a, b) => b.minuten - a.minuten);
  };

  const eindstand = berekenEindstand();
  const stats = berekenWedstrijdStats();
  const result = formatResultaat(eindstand.eigenDoelpunten, eindstand.tegenstanderDoelpunten);

  const SectionButton = ({ section, label, icon }: { section: keyof typeof sections; label: string; icon: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors border-b"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold text-gray-800">{label}</span>
      </div>
      {sections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );

  return (
    <div className="border-2 border-purple-400 rounded-lg overflow-hidden bg-purple-50">
      <div className="bg-purple-100 border-b-2 border-purple-400 p-4">
        <h2 className="text-2xl font-bold text-purple-900">📊 Wedstrijd Samenvatting & Statistieken</h2>
      </div>

      <div className="bg-white">
        {/* ========== RESULTAAT ========== */}
        <div className="border-b-2 border-gray-200">
          <SectionButton section="resultaat" label="Resultaat" icon="🎯" />
          {sections.resultaat && (
            <div className="p-4 space-y-3 bg-gray-50">
              <div className="bg-white border-l-4 border-purple-500 p-3 rounded">
                <p className="text-sm text-gray-700">
                  {wedstrijd.thuisUit === 'uit' ? (
                    <>
                      <strong>{teamNaam}</strong> speelde uit tegen <strong>{wedstrijd.tegenstander || 'Tegenstander'}</strong> op {wedstrijd.datum}.
                    </>
                  ) : (
                    <>
                      <strong>{teamNaam}</strong> speelde thuis tegen <strong>{wedstrijd.tegenstander || 'Tegenstander'}</strong> op {wedstrijd.datum}.
                    </>
                  )}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  De wedstrijd eindigde in een <strong>{result.text} {result.emoji}</strong>.
                </p>
              </div>
              
              {wedstrijd.thuisUit === 'uit' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-gray-600">{eindstand.tegenstanderDoelpunten}</div>
                    <div className="text-xs text-gray-600 mt-1">{wedstrijd.tegenstander || 'Tegenstander'} 🏠</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-2xl font-bold text-gray-500">-</div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-blue-600">{eindstand.eigenDoelpunten}</div>
                    <div className="text-xs text-gray-600 mt-1">{teamNaam} ✈️</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-blue-600">{eindstand.eigenDoelpunten}</div>
                    <div className="text-xs text-gray-600 mt-1">{teamNaam} 🏠</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-2xl font-bold text-gray-500">-</div>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-gray-600">{eindstand.tegenstanderDoelpunten}</div>
                    <div className="text-xs text-gray-600 mt-1">{wedstrijd.tegenstander || 'Tegenstander'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========== THEMA EVALUATIE ========== */}
        {wedstrijd.themas && wedstrijd.themas.length > 0 && (
          <div className="border-b-2 border-gray-200">
            <SectionButton section="thema" label="Thema Evaluatie" icon="🎯" />
            {sections.thema && (
              <div className="p-4 space-y-3 bg-gray-50">
                {wedstrijd.themas.map(themaId => {
                  const thema = ALLE_THEMAS.find(t => t.id === themaId);
                  if (!thema) return null;
                  
                  const beoordelingen = wedstrijd.kwarten
                    .map(k => k.themaBeoordelingen?.[themaId])
                    .filter(Boolean);
                  
                  const goed = beoordelingen.filter(b => b === 'goed').length;
                  const beter = beoordelingen.filter(b => b === 'beter').length;
                  const totaal = goed + beter;
                  
                  if (totaal === 0) return null;
                  
                  const percentage = Math.round((goed / totaal) * 100);
                  
                  return (
                    <div key={themaId} className="bg-white border-l-4 border-blue-500 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{thema.emoji}</span>
                        <span className="font-semibold text-sm flex-1">{thema.label}</span>
                        <span className="text-lg font-bold text-blue-600">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{goed}/{totaal} kwarten goed</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========== KWART VERLOOP ========== */}
        <div className="border-b-2 border-gray-200">
          <SectionButton section="kwarten" label="Kwart Verloop" icon="⏱️" />
          {sections.kwarten && (
            <div className="p-4 space-y-3 bg-gray-50">
              {wedstrijd.kwarten.map((kwart, idx) => {
                const doelpuntenDitKwart = kwart.doelpunten?.filter(d => d.type === 'eigen').length || 0;
                const tegenstanderDoelpuntenDitKwart = kwart.doelpunten?.filter(d => d.type === 'tegenstander').length || 0;
                
                // Thema's voor dit kwart
                const themasDitKwart = wedstrijd.themas?.filter(themaId => {
                  const beoordeling = kwart.themaBeoordelingen?.[themaId];
                  return beoordeling !== null && beoordeling !== undefined;
                }) || [];
                
                return (
                  <div key={idx} className="bg-white border-l-4 border-green-500 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-sm">Kwart {kwart.nummer}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {doelpuntenDitKwart > 0 && <span>⚽ {doelpuntenDitKwart} goal{doelpuntenDitKwart !== 1 ? 's' : ''} • </span>}
                          <span className="text-gray-500">{kwart.minuten} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{doelpuntenDitKwart} - {tegenstanderDoelpuntenDitKwart}</div>
                      </div>
                    </div>

                    {/* Thema's per kwart */}
                    {themasDitKwart.length > 0 && (
                      <div className="my-2 pt-2 border-t">
                        <div className="text-xs font-semibold text-gray-600 mb-1">Thema's:</div>
                        <div className="flex flex-wrap gap-1">
                          {themasDitKwart.map(themaId => {
                            const thema = ALLE_THEMAS.find(t => t.id === themaId);
                            const beoordeling = kwart.themaBeoordelingen?.[themaId];
                            if (!thema) return null;
                            
                            const bgColor = beoordeling === 'goed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
                            const emoji = beoordeling === 'goed' ? '✅' : '⚠️';
                            
                            return (
                              <span key={themaId} className={`${bgColor} px-2 py-0.5 rounded text-xs font-medium`}>
                                {emoji} {thema.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Aantekeningen */}
                    {kwart.aantekeningen && (
                      <div className="mt-2 text-xs italic text-gray-600 bg-yellow-50 rounded p-2">
                        💬 "{kwart.aantekeningen}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== DOELPUNTENMAKERS ========== */}
        {eindstand.doelpuntenmakers.length > 0 && (
          <div className="border-b-2 border-gray-200">
            <SectionButton section="doelpunten" label="Doelpuntenmakers" icon="⚽" />
            {sections.doelpunten && (
              <div className="p-4 space-y-2 bg-gray-50">
                {eindstand.doelpuntenmakers.map((maker, idx) => {
                  const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⚽';
                  return (
                    <div key={idx} className="bg-white border-l-4 border-orange-500 rounded p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{medalEmoji}</span>
                        <span className="font-semibold text-sm">{maker.naam}</span>
                      </div>
                      <span className="text-lg font-bold text-orange-600">{maker.goals}x</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========== STATISTIEKEN ========== */}
        <div className="border-b-2 border-gray-200">
          <SectionButton section="statistieken" label="Spelers Statistieken" icon="📋" />
          {sections.statistieken && (
            <div className="p-4 bg-gray-50 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-2 font-bold text-gray-700">Speler</th>
                    <th className="text-right py-2 px-2 font-bold text-gray-700">Gespeeld</th>
                    <th className="text-right py-2 px-2 font-bold text-gray-700">Wissel</th>
                    <th className="text-right py-2 px-2 font-bold text-gray-700">Keeper</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(stat => (
                    <tr key={stat.naam} className="border-b hover:bg-white transition-colors">
                      <td className="py-2 px-2 text-gray-800 font-medium">{stat.naam}</td>
                      <td className="text-right py-2 px-2 text-gray-700">{stat.minuten.toFixed(1)} min</td>
                      <td className="text-right py-2 px-2 text-gray-700">{stat.wisselMinuten.toFixed(1)} min</td>
                      <td className="text-right py-2 px-2 text-gray-700 font-semibold text-blue-600">{stat.keeperBeurten}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========== OPMERKINGEN ========== */}
        {wedstrijd.notities && (
          <div>
            <SectionButton section="opmerkingen" label="Opmerkingen" icon="💭" />
            {sections.opmerkingen && (
              <div className="p-4 bg-gray-50">
                <div className="bg-white border-l-4 border-indigo-500 rounded p-3">
                  <p className="text-sm text-gray-700 italic">"{wedstrijd.notities}"</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
