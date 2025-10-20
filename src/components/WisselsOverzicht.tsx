import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, ArrowRightLeft } from 'lucide-react';
import { Speler, Wedstrijd } from '../types';

interface WisselsOverzichtProps {
  kwartIndex: number;
  kwart: any;
  wedstrijd: Wedstrijd;
  spelers: Speler[];
  onVoegWisselToe: (kwartIndex: number, positie: string, wisselSpelerId: string) => void;
  onVerwijderWissel: (kwartIndex: number, wisselIndex: number) => void;
}

export function WisselsOverzicht({
  kwartIndex,
  kwart,
  wedstrijd,
  spelers,
  onVoegWisselToe,
  onVerwijderWissel
}: WisselsOverzichtProps) {
  const [bankOpen, setBankOpen] = useState(false);
  const [wisselModal, setWisselModal] = useState<{ open: boolean; bankSpelerId?: string }>({ open: false });

  // Bereken speelminuten tot nu toe
  const berekenMinutenTotNu = () => {
    const minuten: Record<string, number> = {};
    wedstrijd.kwarten.forEach((k, ki) => {
      if (ki > kwartIndex) return;
      
      Object.entries(k.opstelling).forEach(([pos, sid]) => {
        if (!sid) return;
        const kwartWissel = k.wissels?.find(w => w.positie === pos);
        const min = kwartWissel && kwartWissel.wisselSpelerId ? 6.25 : k.minuten;
        minuten[sid] = (minuten[sid] || 0) + min;
      });
      
      k.wissels?.forEach(w => {
        if (w.wisselSpelerId) {
          minuten[w.wisselSpelerId] = (minuten[w.wisselSpelerId] || 0) + 6.25;
        }
      });
    });
    return minuten;
  };

  const minutenTotNu = berekenMinutenTotNu();

  // Spelers die IN HET VELD staan (ORIGINELE opstelling)
  const spelersInVeld = Object.entries(kwart.opstelling)
    .filter(([_, sid]) => sid)
    .map(([pos, sid]) => ({
      spelerId: sid,
      positie: pos,
      naam: spelers.find(s => s.id.toString() === sid)?.naam || 'Onbekend',
      minutenGespeeld: minutenTotNu[sid] || 0
    }))
    .sort((a, b) => b.minutenGespeeld - a.minutenGespeeld);

  // Spelers die al gewisseld zijn (OUT)
  const geswitchteSpelers = new Set(kwart.wissels?.map((w: any) => w.positie) || []);

  // Spelers OP DE BANK
  const spelersOpBank = spelers
    .filter(s => !spelersInVeld.some(v => v.spelerId === s.id.toString()))
    .map(s => ({
      id: s.id,
      naam: s.naam,
      minutenGespeeld: minutenTotNu[s.id] || 0
    }))
    .sort((a, b) => b.minutenGespeeld - a.minutenGespeeld);

  // Veldspelers die nog kunnen wisselen (niet al gewisseld uit deze positie)
  const getBeschikbareVeldspelers = () => {
    return spelersInVeld
      .filter(v => !geswitchteSpelers.has(v.positie))
      .sort((a, b) => b.minutenGespeeld - a.minutenGespeeld);
  };

  const handleWisselConfirm = (veldSpeler: any, bankSpelerId: string) => {
    onVoegWisselToe(kwartIndex, veldSpeler.positie, bankSpelerId);
    setWisselModal({ open: false });
  };

  return (
    <div className="border border-orange-200 rounded-lg overflow-hidden">
      {/* OP DE BANK - INKLAPBAAR HOOFDTITEL */}
      <button
        onClick={() => setBankOpen(!bankOpen)}
        className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:bg-orange-100 p-4 transition-colors bg-orange-50 border-b border-orange-200"
      >
        <span>🪑 OP DE BANK ({spelersOpBank.length})</span>
        {bankOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {bankOpen && (
        <div className="p-4 space-y-4 bg-white">
          {/* Bankspelers lijst */}
          <div className="space-y-2">
            {spelersOpBank.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Geen spelers op de bank</p>
            ) : (
              spelersOpBank.map(speler => (
                <div key={speler.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{speler.naam}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">({speler.minutenGespeeld.toFixed(2)} min)</span>
                  </div>
                  <button
                    onClick={() => setWisselModal({ open: true, bankSpelerId: speler.id.toString() })}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    Erin
                  </button>
                </div>
              ))
            )}
          </div>

          {/* WISSEL MODAL - Kies wie eruit gaat */}
          {wisselModal.open && wisselModal.bankSpelerId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="bg-blue-600 text-white p-4">
                  <h3 className="text-lg font-bold">
                    ✅ {spelers.find(s => s.id.toString() === wisselModal.bankSpelerId)?.naam} erin
                  </h3>
                  <p className="text-sm opacity-90">Kies wie eruit gaat (sortering: meeste speeltijd)</p>
                </div>

                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                  {getBeschikbareVeldspelers().length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4">Geen spelers kunnen wisselen</p>
                  ) : (
                    getBeschikbareVeldspelers().map(veldSpeler => (
                      <button
                        key={`${veldSpeler.positie}-${veldSpeler.spelerId}`}
                        onClick={() => handleWisselConfirm(veldSpeler, wisselModal.bankSpelerId!)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-500 transition-all text-left"
                      >
                        <div className="font-medium">❌ {veldSpeler.naam}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Positie: <span className="font-semibold">{veldSpeler.positie}</span> • 
                          Speeltijd: <span className="font-semibold">{veldSpeler.minutenGespeeld.toFixed(2)} min</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t p-4">
                  <button
                    onClick={() => setWisselModal({ open: false })}
                    className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GEPLANDE WISSELS OVERZICHT */}
          {kwart.wissels && kwart.wissels.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <h5 className="text-xs font-bold text-gray-700 mb-3">✅ GEPLANDE WISSELS ({kwart.wissels.length})</h5>
              <div className="space-y-2">
                {kwart.wissels.map((wissel: any, wisselIndex: number) => {
                  const uitSpeler = spelersInVeld.find(s => s.positie === wissel.positie);
                  const inSpeler = spelers.find(s => s.id.toString() === wissel.wisselSpelerId);

                  return (
                    <div key={wissel.id} className="flex items-center justify-between p-3 bg-white rounded border border-green-300 hover:bg-green-100 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-red-600 font-bold">❌</span>
                        <span className="text-sm font-medium truncate text-gray-700">{uitSpeler?.naam || 'Onbekend'}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600 font-bold">✅</span>
                        <span className="text-sm font-medium truncate text-gray-700">{inSpeler?.naam || 'Onbekend'}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-auto">6,25 min</span>
                      </div>
                      <button
                        onClick={() => onVerwijderWissel(kwartIndex, wisselIndex)}
                        className="ml-2 px-2 py-1 text-red-500 hover:bg-red-100 rounded text-xs transition-colors flex items-center gap-1 whitespace-nowrap"
                        title="Verwijder wissel"
                      >
                        <Trash2 className="w-3 h-3" />
                        Verwijder
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
