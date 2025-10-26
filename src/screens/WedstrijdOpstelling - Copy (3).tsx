import { useState } from 'react';
import { Clock, Plus, Trash2, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Speler, Wedstrijd, Doelpunt, formaties, ALLE_THEMAS, KWART_OBSERVATIES } from '../types';
import ScoreTracking from '../components/ScoreTracking';
import { WedstrijdProvider } from '../components/WedstrijdContext';
import { WedstrijdHeader } from '../components/WedstrijdHeader';
import { WedstrijdSamenvatting } from '../components/WedstrijdSamenvatting';
import VoetbalVeld from '../components/VoetbalVeld';
import { berekenWedstrijdStats, berekenTotaalKeeperBeurten } from '../utils/calculations';

// ✅ GECORRIGEERDE Props Interface
interface Props {
  // Data
  wedstrijd: Wedstrijd;
  spelers: Speler[];
  clubNaam: string;
  teamNaam: string;

  // Wedstrijd level callbacks
  onUpdateWedstrijd: (updated: Wedstrijd) => void;
  onUpdateWedstrijdNotities: (notities: string) => void;
  onUpdateWedstrijdThemas: (themas: string[]) => void;
  onUpdateWedstrijdType: (type: 'competitie' | 'oefenwedstrijd' | '') => void;
  onUpdateWedstrijdFormatie: (formatie: string) => void;
  onUpdateThuisUit: (thuisUit: 'thuis' | 'uit') => void;
  onUpdateWedstrijdAfgelast: (isAfgelast: boolean) => void;
  onToggleAfwezig: (spelerId: number) => void;

  // Kwart level callbacks
  onUpdateKwartOpstelling: (kwartIndex: number, opstelling: Record<string, string>) => void;
  onUpdateKwartWissels: (kwartIndex: number, wissels: any[]) => void;
  onUpdateKwartDoelpunten: (kwartIndex: number, doelpunten: Doelpunt[]) => void;
  onUpdateKwartAantekeningen: (kwartIndex: number, aantekeningen: string) => void;
  onUpdateKwartThemaBeoordeling: (kwartIndex: number, themaId: string, beoordeling: 'goed' | 'beter' | null) => void;
  onUpdateKwartObservaties: (kwartIndex: number, observaties: string[]) => void;

  // Navigation
  onSluiten: () => void;
}

// ✅ GECORRIGEERDE Destructuring
export default function WedstrijdOpstelling({
  wedstrijd,
  spelers,
  clubNaam,
  teamNaam,
  onUpdateWedstrijd,
  onUpdateWedstrijdNotities,
  onUpdateWedstrijdThemas,
  onUpdateWedstrijdType,
  onUpdateWedstrijdFormatie,
  onUpdateThuisUit,
  onUpdateWedstrijdAfgelast,
  onToggleAfwezig,
  onUpdateKwartOpstelling,
  onUpdateKwartWissels,
  onUpdateKwartDoelpunten,
  onUpdateKwartAantekeningen,
  onUpdateKwartThemaBeoordeling,
  onUpdateKwartObservaties,
  onSluiten
}: Props) {
  
  const [selectieModal, setSelectieModal] = useState<{ open: boolean; kwartIndex: number; positie: string }>({ open: false, kwartIndex: 0, positie: '' });
  
  const posities = formaties[wedstrijd.formatie === '6x6' ? '6x6-vliegtuig' : wedstrijd.formatie as '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8'];

  const getPositieLayout = () => {
    const formatie = wedstrijd.formatie === '6x6' ? '6x6-vliegtuig' : wedstrijd.formatie;
    
    if (formatie === '6x6-vliegtuig') {
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
    if (formatie === '6x6-dobbelsteen') {
      return {
        rijen: [
          [{ positie: 'Links voor', col: 'col-start-1' }, { positie: 'Rechts voor', col: 'col-start-3' }],
          [{ positie: 'Midden', col: 'col-start-2' }],
          [{ positie: 'Links achter', col: 'col-start-1' }, { positie: 'Rechts achter', col: 'col-start-3' }],
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

  const getGebruikteSpelers = (kwartIndex: number) => {
    const gebruikt = new Set<string>();
    Object.values(wedstrijd.kwarten[kwartIndex].opstelling).forEach(sid => {
      if (sid) gebruik.add(sid);
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

  const getKeeperBeurtenInWedstrijd = () => {
    const keeperTeller: Record<number, number> = {};
    spelers.forEach(s => { keeperTeller[s.id] = 0; });
    
    wedstrijd.kwarten.forEach(kwart => {
      const keeperId = kwart.opstelling['Keeper'];
      if (keeperId) {
        keeperTeller[Number(keeperId)] += 1;
      }
      kwart.wissels?.forEach(w => {
        if (w.positie === 'Keeper' && w.wisselSpelerId) {
          keeperTeller[Number(w.wisselSpelerId)] += 1;
        }
      });
    });
    
    return keeperTeller;
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
    const keeperBeurten = getKeeperBeurtenInWedstrijd();
    const totaalKeeperBeurten = berekenTotaalKeeperBeurten([wedstrijd], spelers);
    const stats = berekenWedstrijdStats(wedstrijd, spelers);
    const isKeeperPositie = huidigePositie === 'Keeper';
    const afwezigeSpelers = wedstrijd.afwezigeSpelers || [];
    
    const beschikbareSpelers = spelers.filter(s => 
      !afwezigeSpelers.includes(s.id) || s.id.toString() === huidigeSid
    );
    
    return beschikbareSpelers
      .map(speler => ({
        ...speler,
        isGebruikt: gebruikt.has(speler.id.toString()) && speler.id.toString() !== huidigeSid,
        minutenGespeeld: stats.speelminuten[speler.id] ?? 0,
        aantalWissel: wisselBeurten[speler.id] ?? 0,
        keeperBeurten: totaalKeeperBeurten[speler.id] ?? 0,
        keeperBeurtenDezeWedstrijd: keeperBeurten[speler.id] ?? 0
      }))
      .sort((a, b) => {
        if (a.isGebruikt !== b.isGebruikt) return a.isGebruikt ? 1 : -1;
        if (isKeeperPositie) {
          if (a.keeperBeurtenDezeWedstrijd !== b.keeperBeurtenDezeWedstrijd) {
            return a.keeperBeurtenDezeWedstrijd - b.keeperBeurtenDezeWedstrijd;
          }
          return (a.keeperBeurten ?? 0) - (b.keeperBeurten ?? 0);
        }
        return (a.minutenGespeeld ?? 0) - (b.minutenGespeeld ?? 0);
      });
  };

  const selecteerSpeler = (spelerId: string) => {
    const nieuweOpstelling = {
      ...wedstrijd.kwarten[selectieModal.kwartIndex].opstelling,
      [selectieModal.positie]: spelerId
    };
    onUpdateKwartOpstelling(selectieModal.kwartIndex, nieuweOpstelling);
    sluitSelectieModal();
  };

  const sluitSelectieModal = () => {
    setSelectieModal({ open: false, kwartIndex: 0, positie: '' });
  };

  const voegWisselToe = (kwartIndex: number) => {
    const nieuweWissels = [
      ...(wedstrijd.kwarten[kwartIndex].wissels || []),
      { positie: '', wisselSpelerId: '' }
    ];
    onUpdateKwartWissels(kwartIndex, nieuweWissels);
  };

  const verwijderWissel = (kwartIndex: number, wisselIndex: number) => {
    const nieuweWissels = wedstrijd.kwarten[kwartIndex].wissels?.filter((_, i) => i !== wisselIndex) || [];
    onUpdateKwartWissels(kwartIndex, nieuweWissels);
  };

  const updateWissel = (kwartIndex: number, wisselIndex: number, veld: 'positie' | 'wisselSpelerId', waarde: string) => {
    const wissels = wedstrijd.kwarten[kwartIndex].wissels || [];
    const nieuweWissels = wissels.map((w, i) => 
      i === wisselIndex ? { ...w, [veld]: waarde } : w
    );
    onUpdateKwartWissels(kwartIndex, nieuweWissels);
  };

  const voegDoelpuntToe = (kwartIndex: number, thuisOf: 'thuis' | 'uit') => {
    const nieuweDoelpunt: Doelpunt = {
      id: Date.now(),
      thuisOf,
      doelpuntenmaker: ''
    };
    const nieuweDoelpunten = [...(wedstrijd.kwarten[kwartIndex].doelpunten || []), nieuweDoelpunt];
    onUpdateKwartDoelpunten(kwartIndex, nieuweDoelpunten);
  };

  const verwijderDoelpunt = (kwartIndex: number, doelpuntId: number) => {
    const nieuweDoelpunten = wedstrijd.kwarten[kwartIndex].doelpunten?.filter(d => d.id !== doelpuntId) || [];
    onUpdateKwartDoelpunten(kwartIndex, nieuweDoelpunten);
  };

  const updateDoelpuntMaker = (kwartIndex: number, doelpuntId: number, doelpuntenmaker: string) => {
    const nieuweDoelpunten = wedstrijd.kwarten[kwartIndex].doelpunten?.map(d => 
      d.id === doelpuntId ? { ...d, doelpuntenmaker } : d
    ) || [];
    onUpdateKwartDoelpunten(kwartIndex, nieuweDoelpunten);
  };

  return (
    <WedstrijdProvider 
      wedstrijd={wedstrijd}
      spelers={spelers}
      clubNaam={clubNaam}
      teamNaam={teamNaam}
    >
      <div className="space-y-6 pb-8">
        <WedstrijdHeader
          wedstrijd={wedstrijd}
          teamNaam={teamNaam}
          onUpdateThuisUit={onUpdateThuisUit}
          onUpdateWedstrijdType={onUpdateWedstrijdType}
          onUpdateWedstrijdFormatie={onUpdateWedstrijdFormatie}
          onUpdateWedstrijdAfgelast={onUpdateWedstrijdAfgelast}
          onClose={onSluiten}
        />

        {/* KWARTEN SECTIE */}
        {wedstrijd.kwarten.map((kwart, kwartIndex) => (
          <div key={kwartIndex} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-600">Kwart {kwart.nummer}</h2>
              <p className="text-gray-600">{kwart.minuten} minuten</p>
            </div>

            {/* VOETBALVELD */}
            <div className="mb-6 bg-gradient-to-b from-green-100 to-green-200 p-6 rounded-lg">
              <VoetbalVeld
                kwart={kwart}
                formatie={wedstrijd.formatie}
                onSelectSpeler={(positie) => {
                  setSelectieModal({ open: true, kwartIndex, positie });
                }}
              />
            </div>

            {/* AFWEZIGE SPELERS */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Afwezige spelers</h3>
              <div className="flex flex-wrap gap-2">
                {spelers.map(speler => (
                  <button
                    key={speler.id}
                    onClick={() => onToggleAfwezig(speler.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      wedstrijd.afwezigeSpelers?.includes(speler.id)
                        ? 'bg-red-200 text-red-800'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {speler.naam}
                  </button>
                ))}
              </div>
            </div>

            {/* WISSELS SECTIE */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Wissels (na 6,25 minuten)</h3>
                <button
                  onClick={() => voegWisselToe(kwartIndex)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Wissel toevoegen
                </button>
              </div>

              {kwart.wissels && kwart.wissels.length > 0 ? (
                <div className="space-y-2">
                  {kwart.wissels.map((wissel, wisselIndex) => (
                    <div key={wisselIndex} className="flex gap-2">
                      <select
                        value={wissel.positie || ''}
                        onChange={(e) => updateWissel(kwartIndex, wisselIndex, 'positie', e.target.value)}
                        className="flex-1 border rounded px-2 py-1"
                      >
                        <option value="">Kies positie</option>
                        {posities.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                      <select
                        value={wissel.wisselSpelerId || ''}
                        onChange={(e) => updateWissel(kwartIndex, wisselIndex, 'wisselSpelerId', e.target.value)}
                        className="flex-1 border rounded px-2 py-1"
                      >
                        <option value="">Kies speler</option>
                        {spelers.map(s => (
                          <option key={s.id} value={s.id}>{s.naam}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => verwijderWissel(kwartIndex, wisselIndex)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nog geen wissels toegevoegd</p>
              )}
            </div>

            {/* SCORE TRACKING - ✅ CORRECTE PROPS */}
            <div className="mb-6">
              <ScoreTracking
                kwart={kwart}
                spelers={spelers}
                teamNaam={teamNaam}
                onVoegThuis={() => voegDoelpuntToe(kwartIndex, 'thuis')}
                onVoegUit={() => voegDoelpuntToe(kwartIndex, 'uit')}
                onVerwijder={(id) => verwijderDoelpunt(kwartIndex, id)}
                onUpdateDoelpuntenMaker={(id, maker) => updateDoelpuntMaker(kwartIndex, id, maker)}
              />
            </div>

            {/* AANTEKENINGEN */}
            <div className="mb-6">
              <h3 className="font-bold mb-2">Aantekeningen</h3>
              <textarea
                value={kwart.aantekeningen || ''}
                onChange={(e) => onUpdateKwartAantekeningen(kwartIndex, e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Notities over dit kwart..."
                rows={2}
              />
            </div>

            {/* THEMA BEOORDELINGEN */}
            {wedstrijd.themas && wedstrijd.themas.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Thema's dit kwart</h3>
                <div className="space-y-2">
                  {wedstrijd.themas.map(themaId => (
                    <div key={themaId} className="flex items-center gap-4">
                      <label className="text-sm font-medium">{themaId}</label>
                      <div className="flex gap-2">
                        {(['goed', 'beter', null] as const).map(beoordeling => (
                          <button
                            key={beoordeling || 'none'}
                            onClick={() => onUpdateKwartThemaBeoordeling(kwartIndex, themaId, beoordeling)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              (kwart.themaBeoordelingen?.[themaId] ?? null) === beoordeling
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {beoordeling === 'goed' ? '✅ Goed' : beoordeling === 'beter' ? '⚠️ Kan beter' : '❌ Reset'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OBSERVATIES */}
            <div className="mb-6">
              <h3 className="font-bold mb-2">Observaties</h3>
              <div className="flex flex-wrap gap-2">
                {KWART_OBSERVATIES.map(obs => (
                  <button
                    key={obs}
                    onClick={() => {
                      const huidigeObs = kwart.observaties || [];
                      const nieuweObs = huidigeObs.includes(obs)
                        ? huidigeObs.filter(o => o !== obs)
                        : [...huidigeObs, obs];
                      onUpdateKwartObservaties(kwartIndex, nieuweObs);
                    }}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      kwart.observaties?.includes(obs)
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {obs}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* WEDSTRIJD SAMENVATTING */}
        <WedstrijdSamenvatting
          wedstrijd={wedstrijd}
          spelers={spelers}
          teamNaam={teamNaam}
          onUpdateNotities={onUpdateWedstrijdNotities}
          onUpdateThemas={onUpdateWedstrijdThemas}
        />

        {/* SLUIT KNOP */}
        <div className="flex justify-center">
          <button
            onClick={onSluiten}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Terug naar wedstrijdoverzicht
          </button>
        </div>

        {/* SPELER SELECTIE MODAL */}
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
                  {getBeschikbareSpelers(selectieModal.kwartIndex, selectieModal.positie).map((speler: any) => (
                    <button
                      key={speler.id}
                      onClick={() => selecteerSpeler(speler.id.toString())}
                      disabled={speler.isGebruikt}
                      className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                        speler.isGebruikt
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                          : 'border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer'
                      }`}
                    >
                      <div className="font-semibold text-lg">{speler.naam}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        ⚽ {speler.minutenGespeeld} min | 🪑 {speler.aantalWissel}x bank
                      </div>
                    </button>
                  ))}
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
    </WedstrijdProvider>
  );
}
