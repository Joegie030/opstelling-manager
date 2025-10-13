import { useState } from 'react';
import { Clock, Plus, Trash2, X } from 'lucide-react';
import { Speler, Wedstrijd, formaties } from '../types';

interface Props {
  wedstrijd: Wedstrijd;
  spelers: Speler[];
  clubNaam: string;
  teamNaam: string;
  onUpdateDatum: (datum: string) => void;
  onUpdateTegenstander: (tegenstander: string) => void;
  onUpdateOpstelling: (kwartIndex: number, positie: string, spelerId: string) => void;
  onVoegWisselToe: (kwartIndex: number) => void;
  onUpdateWissel: (kwartIndex: number, wisselIndex: number, veld: 'positie' | 'wisselSpelerId', waarde: string) => void;
  onVerwijderWissel: (kwartIndex: number, wisselIndex: number) => void;
  onKopieer: () => void;
  onSluiten: () => void;
}

export default function WedstrijdOpstelling({
  wedstrijd,
  spelers,
  clubNaam,
  teamNaam,
  onUpdateDatum,
  onUpdateTegenstander,
  onUpdateOpstelling,
  onVoegWisselToe,
  onUpdateWissel,
  onVerwijderWissel,
  onKopieer,
  onSluiten
}: Props) {
  
  // Modal state
  const [selectieModal, setSelectieModal] = useState<{
    open: boolean;
    kwartIndex: number;
    positie: string;
  }>({ open: false, kwartIndex: 0, positie: '' });
  
  const posities = formaties[wedstrijd.formatie];

  // Bereken statistieken voor deze wedstrijd
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

    return Object.values(stats);
  };

  // Veldindeling
  const getPositieLayout = () => {
    if (wedstrijd.formatie === '6x6') {
      return {
        rijen: [
          [{ positie: 'Voor', col: 'col-start-2' }],
          [{ positie: 'Links' }, { positie: 'Midden' }, { positie: 'Rechts' }],
          [{ positie: 'Achter', col: 'col-start-2' }],
          [{ positie: 'Keeper', col: 'col-start-2' }]
        ],
        gridCols: 'grid-cols-3'
      };
    }
    return {
      rijen: [
        [{ positie: 'Links voor', col: 'col-start-2' }, { positie: 'Rechts voor', col: 'col-start-4' }],
        [{ positie: 'Links midden', col: 'col-start-1' }, { positie: 'Midden', col: 'col-start-3' }, { positie: 'Rechts midden', col: 'col-start-5' }],
        [{ positie: 'Links achter', col: 'col-start-2' }, { positie: 'Rechts achter', col: 'col-start-4' }],
        [{ positie: 'Keeper', col: 'col-start-3' }]
      ],
      gridCols: 'grid-cols-5'
    };
  };

  const layout = getPositieLayout();

  // Hulpfuncties
  const getGebruikteSpelers = (kwartIndex: number) => {
    const gebruikt = new Set<string>();
    Object.values(wedstrijd.kwarten[kwartIndex].opstelling).forEach(sid => {
      if (sid) gebruikt.add(sid);
    });
    return gebruikt;
  };

  const getKeeperSpelers = () => {
    const keepers = new Set<string>();
    wedstrijd.kwarten.forEach(kwart => {
      const keeperId = kwart.opstelling['Keeper'];
      if (keeperId) keepers.add(keeperId);
    });
    return keepers;
  };

  const getWisselBeurten = () => {
    const teller: Record<number, number> = {};
    spelers.forEach(s => { teller[s.id] = 0; });
    wedstrijd.kwarten.forEach(kwart => {
      const spelersInKwart = new Set<string>();
      Object.values(kwart.opstelling).forEach(sid => { if (sid) spelersInKwart.add(sid); });
      spelers.forEach(s => {
        if (!spelersInKwart.has(s.id.toString())) teller[s.id] += 1;
      });
    });
    return teller;
  };

  const getBeschikbareSpelers = (kwartIndex: number, huidigePositie: string) => {
    const gebruikt = getGebruikteSpelers(kwartIndex);
    const huidigeSid = wedstrijd.kwarten[kwartIndex].opstelling[huidigePositie];
    const keepers = getKeeperSpelers();
    const wisselBeurten = getWisselBeurten();
    const stats = berekenWedstrijdStats();
    
    return spelers.map(s => {
      const spelerStats = stats.find(stat => stat.naam === s.naam);
      return {
        ...s,
        isGebruikt: gebruikt.has(s.id.toString()) && s.id.toString() !== huidigeSid,
        isKeeper: keepers.has(s.id.toString()),
        aantalWissel: wisselBeurten[s.id] || 0,
        minutenGespeeld: spelerStats?.minuten || 0,
        keeperBeurten: spelerStats?.keeperBeurten || 0
      };
    });
  };

  // Regelchecks
  const checkKeeperWisselRegel = () => {
    const waarschuwingen: string[] = [];
    wedstrijd.kwarten.forEach((kwart, ki) => {
      const keeperId = kwart.opstelling['Keeper'];
      if (!keeperId) return;
      const keeperNaam = spelers.find(s => s.id.toString() === keeperId)?.naam;
      if (!keeperNaam) return;
      const vorigKwart = ki > 0 ? wedstrijd.kwarten[ki - 1] : null;
      const volgendKwart = ki < 3 ? wedstrijd.kwarten[ki + 1] : null;
      const speeltInVorig = vorigKwart && Object.values(vorigKwart.opstelling).includes(keeperId);
      const speeltInVolgend = volgendKwart && Object.values(volgendKwart.opstelling).includes(keeperId);
      if (!speeltInVorig && !speeltInVolgend) {
        waarschuwingen.push(`${keeperNaam} is keeper in kwart ${ki + 1} maar staat op de bank in ${vorigKwart ? 'kwart ' + ki : ''} ${!speeltInVorig && !speeltInVolgend && vorigKwart && volgendKwart ? 'én' : ''} ${volgendKwart ? 'kwart ' + (ki + 2) : ''}`);
      }
    });
    return waarschuwingen;
  };

  const checkDubbelWisselRegel = () => {
    const waarschuwingen: string[] = [];
    spelers.forEach(speler => {
      for (let ki = 0; ki < wedstrijd.kwarten.length - 1; ki++) {
        const k1 = wedstrijd.kwarten[ki];
        const k2 = wedstrijd.kwarten[ki + 1];
        const speelt1 = Object.values(k1.opstelling).includes(speler.id.toString()) || k1.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
        const speelt2 = Object.values(k2.opstelling).includes(speler.id.toString()) || k2.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
        if (!speelt1 && !speelt2) {
          waarschuwingen.push(`${speler.naam} staat 2 kwarten achter elkaar op de bank (kwart ${ki + 1} en ${ki + 2})`);
        }
      }
    });
    return waarschuwingen;
  };

  const checkInvallerBankRegel = () => {
    const waarschuwingen: string[] = [];
    spelers.forEach(speler => {
      for (let ki = 0; ki < wedstrijd.kwarten.length - 1; ki++) {
        const k1 = wedstrijd.kwarten[ki];
        const k2 = wedstrijd.kwarten[ki + 1];
        const basisK1 = Object.values(k1.opstelling).includes(speler.id.toString());
        const valtInK1 = k1.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
        const speeltK2 = Object.values(k2.opstelling).includes(speler.id.toString()) || k2.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
        if (valtInK1 && !basisK1 && !speeltK2) {
          waarschuwingen.push(`${speler.naam} valt in tijdens kwart ${ki + 1} maar zit op de bank in kwart ${ki + 2}`);
        }
        const speeltK1 = Object.values(k1.opstelling).includes(speler.id.toString()) || k1.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
        const basisK2 = Object.values(k2.opstelling).includes(speler.id.toString());
        const valtInK2 = k2.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
        if (!speeltK1 && valtInK2 && !basisK2) {
          waarschuwingen.push(`${speler.naam} zit op de bank in kwart ${ki + 1} en valt pas in tijdens kwart ${ki + 2}`);
        }
      }
    });
    return waarschuwingen;
  };

  const alleWaarschuwingen = [
    ...checkKeeperWisselRegel(),
    ...checkDubbelWisselRegel(),
    ...checkInvallerBankRegel()
  ];

  const stats = berekenWedstrijdStats();

  // Open modal voor speler selectie
  const openSelectieModal = (kwartIndex: number, positie: string) => {
    setSelectieModal({ open: true, kwartIndex, positie });
  };

  // Sluit modal
  const sluitSelectieModal = () => {
    setSelectieModal({ open: false, kwartIndex: 0, positie: '' });
  };

  // Selecteer speler
  const selecteerSpeler = (spelerId: string) => {
    onUpdateOpstelling(selectieModal.kwartIndex, selectieModal.positie, spelerId);
    sluitSelectieModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-2xl font-bold">{clubNaam} {teamNaam} - {wedstrijd.formatie}</h2>
            <input 
              type="date" 
              value={wedstrijd.datum} 
              onChange={(e) => onUpdateDatum(e.target.value)} 
              className="px-3 py-2 border-2 border-blue-500 rounded-lg font-medium" 
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tegenstander:</label>
            <input 
              type="text" 
              value={wedstrijd.tegenstander || ''} 
              onChange={(e) => onUpdateTegenstander(e.target.value)} 
              placeholder="Optioneel" 
              className="px-3 py-2 border rounded-lg" 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onKopieer} 
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />Kopieer
          </button>
          <button 
            onClick={onSluiten} 
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Opslaan & Sluiten
          </button>
        </div>
      </div>

      {wedstrijd.kwarten.map((kwart, kwartIndex) => (
        <div key={kwartIndex} className="border rounded-lg p-4 bg-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />Kwart {kwart.nummer} ({kwart.minuten} min)
          </h3>
          
          <div className="bg-green-100 rounded-lg p-6 mb-4">
            {layout.rijen.map((rij, rijIndex) => (
              <div key={rijIndex} className={`grid ${layout.gridCols} gap-4 mb-4`}>
                {rij.map(({ positie, col }) => {
                  const heeftWissel = kwart.wissels?.some(w => w.positie === positie);
                  const spelerId = kwart.opstelling[positie];
                  const spelerNaam = spelerId ? spelers.find(s => s.id.toString() === spelerId)?.naam : '';
                  const isKeeper = positie === 'Keeper';
                  
                  return (
                    <div key={positie} className={`space-y-1 ${col || ''}`}>
                      <label className="text-xs font-bold text-gray-700 block text-center">
                        {positie}
                        {heeftWissel && <span className="text-orange-600"> 🔄</span>}
                      </label>
                      <button
                        onClick={() => openSelectieModal(kwartIndex, positie)}
                        className={`w-full px-3 py-3 border-2 rounded-lg font-medium text-sm transition-all ${
                          spelerId
                            ? isKeeper 
                              ? 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100 text-gray-900'
                              : 'bg-white border-green-600 hover:bg-green-50 text-gray-900'
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        {spelerNaam || '+ Kies speler'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm">Wissels na 6,25 min</h4>
              <button 
                onClick={() => onVoegWisselToe(kwartIndex)} 
                className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-1 text-sm"
              >
                <Plus className="w-3 h-3" />Wissel toevoegen
              </button>
            </div>
            {kwart.wissels && kwart.wissels.length > 0 ? (
              <div className="space-y-3">
                {kwart.wissels.map((wissel, wisselIndex) => {
                  const startSpelerId = kwart.opstelling[wissel.positie];
                  const startSpelerNaam = spelers.find(s => s.id.toString() === startSpelerId)?.naam;
                  const beschikbareWisselSpelers = spelers.filter(s => 
                    s.id.toString() !== startSpelerId && 
                    !Object.values(kwart.opstelling).includes(s.id.toString()) &&
                    !kwart.wissels.some((w, i) => i !== wisselIndex && w.wisselSpelerId === s.id.toString())
                  );
                  return (
                    <div key={wissel.id} className="bg-white rounded p-3 flex gap-2 items-center">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Positie</label>
                          <select 
                            value={wissel.positie} 
                            onChange={(e) => onUpdateWissel(kwartIndex, wisselIndex, 'positie', e.target.value)} 
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="">Kies positie</option>
                            {posities.map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </select>
                          {startSpelerNaam && <p className="text-xs text-gray-500 mt-1">Uit: {startSpelerNaam}</p>}
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Wisselspeler</label>
                          <select 
                            value={wissel.wisselSpelerId} 
                            onChange={(e) => onUpdateWissel(kwartIndex, wisselIndex, 'wisselSpelerId', e.target.value)} 
                            className="w-full px-2 py-1 border rounded text-sm" 
                            disabled={!wissel.positie}
                          >
                            <option value="">Kies speler</option>
                            {beschikbareWisselSpelers.map(s => (
                              <option key={s.id} value={s.id}>{s.naam}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">In: na 6,25 min</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onVerwijderWissel(kwartIndex, wisselIndex)} 
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">Geen wissels</p>
            )}
          </div>
        </div>
      ))}

      <div className="border rounded-lg p-4 bg-blue-50">
        <h3 className="font-bold mb-3">Wedstrijd Statistieken</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Speler</th>
                <th className="text-right py-2">Gespeeld</th>
                <th className="text-right py-2">Wissel</th>
                <th className="text-right py-2">Keeper</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(stat => (
                <tr key={stat.naam} className="border-b">
                  <td className="py-2">{stat.naam}</td>
                  <td className="text-right py-2">{stat.minuten} min</td>
                  <td className="text-right py-2">{stat.wisselMinuten} min</td>
                  <td className="text-right py-2">{stat.keeperBeurten}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-yellow-50">
        <h3 className="font-bold mb-3 flex items-center gap-2">📋 Regelcheck</h3>
        {alleWaarschuwingen.length === 0 ? (
          <div className="flex items-center gap-2 text-green-700">
            <span className="text-xl">✅</span>
            <span>Alle regels zijn in orde!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alleWaarschuwingen.map((waarschuwing, index) => (
              <div key={index} className="flex items-start gap-2 text-orange-700 bg-orange-100 p-3 rounded">
                <span className="text-lg">⚠️</span>
                <span className="text-sm">{waarschuwing}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Speler Selectie Modal */}
      {selectieModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Kies speler voor {selectieModal.positie}</h3>
                <p className="text-sm opacity-90">Kwart {selectieModal.kwartIndex + 1}</p>
              </div>
              <button 
                onClick={sluitSelectieModal}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              <div className="space-y-2">
                {/* Leeg maken optie */}
                {wedstrijd.kwarten[selectieModal.kwartIndex].opstelling[selectieModal.positie] && (
                  <button
                    onClick={() => selecteerSpeler('')}
                    className="w-full p-4 border-2 border-red-300 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
                  >
                    <div className="font-semibold text-red-700">❌ Verwijder speler</div>
                    <div className="text-xs text-red-600 mt-1">Positie leeg maken</div>
                  </button>
                )}
                
                {/* Beschikbare spelers */}
                {getBeschikbareSpelers(selectieModal.kwartIndex, selectieModal.positie).map(speler => {
                  const isBeschikbaar = !speler.isGebruikt;
                  
                  return (
                    <button
                      key={speler.id}
                      onClick={() => isBeschikbaar && selecteerSpeler(speler.id.toString())}
                      disabled={!isBeschikbaar}
                      className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                        isBeschikbaar
                          ? 'border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer'
                          : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {speler.naam}
                            {speler.isKeeper && ' 🧤'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            {speler.minutenGespeeld > 0 && (
                              <div>⚽ {speler.minutenGespeeld} min gespeeld</div>
                            )}
                            {speler.keeperBeurten > 0 && (
                              <div>🧤 {speler.keeperBeurten}x keeper geweest</div>
                            )}
                            {speler.aantalWissel > 0 && (
                              <div>🪑 {speler.aantalWissel}x op de bank</div>
                            )}
                            {speler.minutenGespeeld === 0 && speler.aantalWissel === 0 && (
                              <div className="text-blue-600">✨ Nog niet gespeeld</div>
                            )}
                          </div>
                        </div>
                        {!isBeschikbaar && (
                          <div className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            In dit kwart
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={sluitSelectieModal}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}