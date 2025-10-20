import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ALLE_THEMAS } from '../types';
import { useWedstrijd } from './WedstrijdContext';

export function WedstrijdSamenvatting() {
  const [samenvattingOpen, setSamenvattingOpen] = useState(false);
  const { wedstrijd, teamNaam, spelers } = useWedstrijd();

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

  const eindstand = berekenEindstand();

  return (
    <div className="border-2 border-purple-200 bg-purple-50 rounded-lg overflow-hidden">
      <button
        onClick={() => setSamenvattingOpen(!samenvattingOpen)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="text-sm font-semibold text-gray-700">
            Wedstrijd Samenvatting
          </span>
        </div>
        {samenvattingOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      
      {samenvattingOpen && (
        <div className="px-3 py-4 border-t border-purple-200 bg-white space-y-4">
          
          {/* Resultaat samenvatting */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-bold text-lg mb-2">🎯 Resultaat</h3>
            <p className="text-gray-700">
              <strong>{teamNaam}</strong> speelde tegen <strong>{wedstrijd.tegenstander || 'Tegenstander'}</strong> op {wedstrijd.datum}.
              De wedstrijd eindigde in een <strong>{eindstand.resultaat === 'gewonnen' ? 'overwinning' : eindstand.resultaat === 'verloren' ? 'verlies' : 'gelijkspel'}</strong> met een eindstand van <strong>{eindstand.eigenDoelpunten} - {eindstand.tegenstanderDoelpunten}</strong>.
            </p>
          </div>

          {/* Thema's evaluatie */}
          {wedstrijd.themas && wedstrijd.themas.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-bold text-lg mb-3">🎯 Thema Evaluatie</h3>
              <div className="space-y-2">
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
                    <div key={themaId} className="flex items-center gap-3">
                      <span className="text-2xl">{thema.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{thema.label}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {goed}/{totaal} ✅
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kwart verloop */}
          <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-bold text-lg mb-3">⏱️ Kwart Verloop</h3>
            <div className="space-y-2">
              {wedstrijd.kwarten.map((kwart, idx) => {
                const doelpuntenDitKwart = kwart.doelpunten?.filter(d => d.type === 'eigen').length || 0;
                const tegenstanderDoelpuntenDitKwart = kwart.doelpunten?.filter(d => d.type === 'tegenstander').length || 0;
                
                return (
                  <div key={idx} className="bg-white rounded p-3 border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">Kwart {kwart.nummer}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {doelpuntenDitKwart > 0 && <span>⚽ {doelpuntenDitKwart} goal{doelpuntenDitKwart !== 1 ? 's' : ''}</span>}
                          {kwart.aantekeningen && <span className="ml-2">💬 Notitie</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{doelpuntenDitKwart} - {tegenstanderDoelpuntenDitKwart}</div>
                      </div>
                    </div>
                    {kwart.aantekeningen && (
                      <div className="mt-2 text-xs italic text-gray-600 bg-gray-50 rounded p-2">
                        "{kwart.aantekeningen}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Doelpuntenmakers */}
          {eindstand.doelpuntenmakers.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-bold text-lg mb-3">⚽ Doelpuntenmakers</h3>
              <div className="space-y-2">
                {eindstand.doelpuntenmakers.map((maker, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white rounded p-2 border border-yellow-200">
                    <span className="text-2xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⚽'}
                    </span>
                    <span className="font-semibold flex-1">{maker.naam}</span>
                    <span className="font-bold text-orange-600">{maker.goals}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Algemene opmerkingen */}
          {wedstrijd.notities && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="font-bold text-lg mb-2">💭 Opmerkingen</h3>
              <p className="text-gray-700 text-sm italic">"{wedstrijd.notities}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
