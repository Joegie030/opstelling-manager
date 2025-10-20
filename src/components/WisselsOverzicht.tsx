import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowRightLeft } from 'lucide-react';
import { Speler, Wedstrijd } from '../types';

interface WisselsOverzichtProps {
  kwartIndex: number;
  kwart: any;
  wedstrijd: Wedstrijd;
  spelers: Speler[];
  onVoegWisselToe: (kwartIndex: number) => void;
  onUpdateWissel: (kwartIndex: number, wisselIndex: number, veld: 'positie' | 'wisselSpelerId', waarde: string) => void;
  onVerwijderWissel: (kwartIndex: number, wisselIndex: number) => void;
}

export function WisselsOverzicht({
  kwartIndex,
  kwart,
  wedstrijd,
  spelers,
  onVoegWisselToe,
  onUpdateWissel,
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

  // Spelers die IN HET VELD staan
  const spelersInVeld = Object.entries(kwart.opstelling)
    .filter(([_, sid]) => sid)
    .map(([pos, sid]) => ({
      spelerId: sid,
      positie: pos,
      naam: spelers.find(s => s.id.toString() === sid)?.naam || 'Onbekend'
    }));

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
    .sort((a, b) => a.minutenGespeeld - b.minutenGespeeld);

  // Verkrijgbare veldspelers om uit te wisselen (naar positie)
  const getVerkrijgbareUitVeld = (bankSpelerId: string) => {
    return spelersInVeld
      .filter(v => !geswitchteSpelers.has(v.positie))
      .map(v => ({
        ...v,
        bankSpelerId: bankSpelerId
      }));
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-sm">Wissels na 6,25 min</h4>

      {/* IN HET VELD */}
      <div className="bg-white rounded-lg p-3 border border-orange-100">
        <h5 className="text-xs font-bold text-gray-700 mb-2">IN HET VELD ({spelersInVeld.length})</h5>
        <div className="space-y-2">
          {spelersInVeld.map(speler => (
            <div key={speler.spelerId} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{speler.naam}</span>
                <span className="text-xs text-gray-500">({speler.positie})</span>
              </div>
              {geswitchteSpelers.has(speler.positie) && (
                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">Wisseluitgang</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* OP DE BANK - INKLAPBAAR */}
      <div className="bg-white rounded-lg p-3 border border-orange-100">
        <button
          onClick={() => setBankOpen(!bankOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors"
        >
          <span>OP DE BANK ({spelersOpBank.length})</span>
          {bankOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {bankOpen && (
          <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
            {spelersOpBank.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Geen spelers op de bank</p>
            ) : (
              spelersOpBank.map(speler => (
                <div key={speler.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{speler.naam}</span>
                    <span className="text-xs text-gray-500">{speler.minutenGespeeld} min</span>
                  </div>
                  <button
                    onClick={() => setWisselModal({ open: true, bankSpelerId: speler.id.toString() })}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    Wissel
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* WISSEL MODAL - Kies uit wie uit */}
      {wisselModal.open && wisselModal.bankSpelerId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-lg font-bold">
                {spelers.find(s => s.id.toString() === wisselModal.bankSpelerId)?.naam} erin
              </h3>
              <p className="text-sm opacity-90">Kies wie eruit gaat</p>
            </div>

            <div className="p-4 space-y-2">
              {getVerkrijgbareUitVeld(wisselModal.bankSpelerId).map(veldSpeler => (
                <button
                  key={veldSpeler.spelerId}
                  onClick={() => {
                    // Voeg wissel toe
                    onVoegWisselToe(kwartIndex);
                    
                    // Update de nieuwe wissel
                    const wisselIndex = kwart.wissels.length;
                    onUpdateWissel(kwartIndex, wisselIndex, 'positie', veldSpeler.positie);
                    onUpdateWissel(kwartIndex, wisselIndex, 'wisselSpelerId', wisselModal.bankSpelerId!);
                    
                    setWisselModal({ open: false });
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all text-left"
                >
                  <div className="font-medium">{veldSpeler.naam}</div>
                  <div className="text-xs text-gray-500">Positie: {veldSpeler.positie}</div>
                </button>
              ))}
            </div>

            <div className="border-t p-4">
              <button
                onClick={() => setWisselModal({ open: false })}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GEPLANDE WISSELS OVERZICHT */}
      {kwart.wissels && kwart.wissels.length > 0 && (
        <div className="bg-white rounded-lg p-3 border-2 border-green-200">
          <h5 className="text-xs font-bold text-gray-700 mb-2">GEPLANDE WISSELS</h5>
          <div className="space-y-2">
            {kwart.wissels.map((wissel: any, wisselIndex: number) => {
              const uitSpeler = wissel.positie ? spelersInVeld.find(s => s.positie === wissel.positie) : null;
              const inSpeler = wissel.wisselSpelerId ? spelers.find(s => s.id.toString() === wissel.wisselSpelerId) : null;

              return (
                <div key={wissel.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{uitSpeler?.naam || '?'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-sm font-medium truncate">{inSpeler?.naam || '?'}</span>
                  </div>
                  <button
                    onClick={() => onVerwijderWissel(kwartIndex, wisselIndex)}
                    className="px-2 py-1 text-red-500 hover:bg-red-100 rounded text-xs transition-colors"
                  >
                    Verwijder
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
