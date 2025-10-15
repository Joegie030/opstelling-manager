import { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Eye, X, Copy } from 'lucide-react';
import { Speler, Wedstrijd, Doelpunt, formaties } from './types';
import TeamBeheer from './components/teambeheer.tsx';
import Statistieken from './components/statistieken.tsx';
import WedstrijdOpstelling from './components/wedstrijdopstelling.tsx';

function App() {
  const [spelers, setSpelers] = useState<Speler[]>(() => {
    const opgeslagen = localStorage.getItem('voetbal_spelers');
    return opgeslagen ? JSON.parse(opgeslagen) : [];
  });
  
  const [wedstrijden, setWedstrijden] = useState<Wedstrijd[]>(() => {
    const opgeslagen = localStorage.getItem('voetbal_wedstrijden');
    return opgeslagen ? JSON.parse(opgeslagen) : [];
  });
  
  const [clubNaam, setClubNaam] = useState(() => {
    return localStorage.getItem('voetbal_clubNaam') || 'Mijn Club';
  });
  
  const [teamNaam, setTeamNaam] = useState(() => {
    return localStorage.getItem('voetbal_teamNaam') || 'Team A';
  });
  
  const [huidigScherm, setHuidigScherm] = useState('wedstrijden');
  const [huidgeWedstrijd, setHuidgeWedstrijd] = useState<Wedstrijd | null>(null);
  const [formatieModal, setFormatieModal] = useState(false);

  // Helper functie om formatie naam mooi weer te geven (met backward compatibility)
  const getFormatieNaam = (formatie: string): string => {
    const namen: Record<string, string> = {
      '6x6': '✈️ 6x6 Vliegtuig',
      '6x6-vliegtuig': '✈️ 6x6 Vliegtuig',
      '6x6-dobbelsteen': '🎲 6x6 Dobbelsteen',
      '8x8': '⚽ 8x8'
    };
    return namen[formatie] || formatie;
  };

  useEffect(() => {
    localStorage.setItem('voetbal_spelers', JSON.stringify(spelers));
  }, [spelers]);

  useEffect(() => {
    localStorage.setItem('voetbal_wedstrijden', JSON.stringify(wedstrijden));
  }, [wedstrijden]);

  useEffect(() => {
    localStorage.setItem('voetbal_clubNaam', clubNaam);
  }, [clubNaam]);

  useEffect(() => {
    localStorage.setItem('voetbal_teamNaam', teamNaam);
  }, [teamNaam]);

  const maakWedstrijd = (formatie: '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8') => {
    const nieuweWedstrijd: Wedstrijd = {
      id: Date.now(),
      datum: new Date().toISOString().split('T')[0],
      tegenstander: '',
      thuisUit: 'thuis',
      formatie,
      kwarten: [
        { nummer: 1, opstelling: {}, wissels: [], minuten: 12.5 },
        { nummer: 2, opstelling: {}, wissels: [], minuten: 12.5 },
        { nummer: 3, opstelling: {}, wissels: [], minuten: 12.5 },
        { nummer: 4, opstelling: {}, wissels: [], minuten: 12.5 }
      ]
    };
    setWedstrijden([...wedstrijden, nieuweWedstrijd]);
    setHuidgeWedstrijd(nieuweWedstrijd);
    setHuidigScherm('wedstrijd');
    setFormatieModal(false);
  };

  const kopieerWedstrijd = (wedstrijd: Wedstrijd) => {
    const gekopieerd: Wedstrijd = {
      ...wedstrijd,
      id: Date.now(),
      datum: new Date().toISOString().split('T')[0],
      tegenstander: wedstrijd.tegenstander ? `${wedstrijd.tegenstander} (kopie)` : '',
      thuisUit: wedstrijd.thuisUit || 'thuis'
    };
    setWedstrijden([...wedstrijden, gekopieerd]);
    setHuidgeWedstrijd(gekopieerd);
    setHuidigScherm('wedstrijd');
  };

  const verwijderWedstrijd = (wedstrijdId: number) => {
    setWedstrijden(wedstrijden.filter(w => w.id !== wedstrijdId));
    if (huidgeWedstrijd?.id === wedstrijdId) {
      setHuidgeWedstrijd(null);
      setHuidigScherm('wedstrijden');
    }
  };

  const updateDatum = (nieuweDatum: string) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd, datum: nieuweDatum };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateTegenstander = (nieuweTegenstander: string) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd, tegenstander: nieuweTegenstander };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateThuisUit = (nieuweThuisUit: 'thuis' | 'uit') => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd, thuisUit: nieuweThuisUit };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const toggleAfwezig = (spelerId: number) => {
    if (!huidgeWedstrijd) return;
    const huidigeAfwezigen = huidgeWedstrijd.afwezigeSpelers || [];
    const updated = { 
      ...huidgeWedstrijd, 
      afwezigeSpelers: huidigeAfwezigen.includes(spelerId)
        ? huidigeAfwezigen.filter(id => id !== spelerId)
        : [...huidigeAfwezigen, spelerId]
    };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateOpstelling = (kwartIndex: number, positie: string, spelerId: string) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].opstelling[positie] = spelerId;
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const voegWisselToe = (kwartIndex: number) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].wissels.push({ 
      id: Date.now(), 
      positie: '', 
      wisselSpelerId: '' 
    });
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateWissel = (kwartIndex: number, wisselIndex: number, veld: 'positie' | 'wisselSpelerId', waarde: string) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].wissels[wisselIndex][veld] = waarde;
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const verwijderWissel = (kwartIndex: number, wisselIndex: number) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].wissels.splice(wisselIndex, 1);
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  // NIEUW: Doelpunten handlers
  const voegDoelpuntToe = (kwartIndex: number, doelpunt: Omit<Doelpunt, 'id'>) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd };
    
    // Zorg dat doelpunten array bestaat
    if (!updated.kwarten[kwartIndex].doelpunten) {
      updated.kwarten[kwartIndex].doelpunten = [];
    }
    
    // Voeg doelpunt toe met unieke ID
    updated.kwarten[kwartIndex].doelpunten!.push({
      ...doelpunt,
      id: Date.now()
    });
    
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const verwijderDoelpunt = (kwartIndex: number, doelpuntId: number) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd };
    
    if (updated.kwarten[kwartIndex].doelpunten) {
      updated.kwarten[kwartIndex].doelpunten = updated.kwarten[kwartIndex].doelpunten!.filter(
        d => d.id !== doelpuntId
      );
    }
    
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  // NIEUW: Notities handlers
  const updateWedstrijdNotities = (notities: string) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd, notities };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateKwartAantekeningen = (kwartIndex: number, aantekeningen: string) => {
    if (!huidgeWedstrijd) return;
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].aantekeningen = aantekeningen;
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  // Testdata handlers
  const TESTDATA_SPELERS = [
    'Jan Jansen',
    'Piet Pietersen',
    'Klaas de Vries',
    'Henk van Dam',
    'Dirk Bakker',
    'Sven Visser',
    'Lars de Jong',
    'Tim Peters',
    'Tom de Boer',
    'Mike van Dijk',
    'Max Smit',
    'Bob de Groot'
  ];

  const laadTestdata = () => {
    const nieuweSpelers: Speler[] = TESTDATA_SPELERS.map((naam, index) => ({
      id: Date.now() + index,
      naam: naam
    }));
    
    setSpelers(nieuweSpelers);
    setClubNaam('VV Testteam');
    setTeamNaam('F1 - Oranje');
  };

  const wisAlles = () => {
    setSpelers([]);
    setWedstrijden([]);
    setClubNaam('Mijn Club');
    setTeamNaam('Team A');
  };

  const voegSpelerToe = (naam: string) => {
    const nieuweSpeler: Speler = {
      id: Date.now(),
      naam: naam
    };
    setSpelers([...spelers, nieuweSpeler]);
  };

  const verwijderSpeler = (id: number) => {
    setSpelers(spelers.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Modern Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-green-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-md">
                ⚽
              </div>
              <div className="text-white">
                <h1 className="text-xl font-bold leading-tight">Opstelling Manager</h1>
                <p className="text-sm opacity-90">{clubNaam} - {teamNaam}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs - Responsive */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button 
              onClick={() => setHuidigScherm('wedstrijden')} 
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm sm:text-base ${
                huidigScherm === 'wedstrijden' || huidigScherm === 'wedstrijd' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <span className="hidden sm:inline">⚽ Wedstrijden</span>
              <span className="sm:hidden">⚽</span>
            </button>
            <button 
              onClick={() => setHuidigScherm('statistieken')} 
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm sm:text-base ${
                huidigScherm === 'statistieken' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <span className="hidden sm:inline">📈 Statistieken</span>
              <span className="sm:hidden">📈</span>
            </button>
            <button 
              onClick={() => setHuidigScherm('team')} 
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm sm:text-base ${
                huidigScherm === 'team' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              <span className="hidden sm:inline">👥 Team</span>
              <span className="sm:hidden">👥</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto sm:p-4 p-2">
        <div className="bg-white rounded-xl shadow-lg sm:p-6 p-3">
          <div>
            {huidigScherm === 'wedstrijden' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Wedstrijden</h2>
                </div>

                {/* Nieuwe Wedstrijd Knop */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {spelers.length < 6 ? (
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">➕ Nieuwe Wedstrijd Aanmaken</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">Je hebt minimaal 6 spelers nodig om een wedstrijd aan te maken.</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFormatieModal(true)}
                      className="w-full p-5 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Plus className="w-6 h-6" />
                        <span className="text-xl font-bold">Nieuwe Wedstrijd Aanmaken</span>
                      </div>
                      <p className="text-sm opacity-90 mt-1">Kies je formatie</p>
                    </button>
                  )}
                </div>

                {/* Overzicht Wedstrijden - VERBETERD met scheiding komende/gespeelde */}
                <div className="space-y-4">
                  {(() => {
                    const vandaag = new Date();
                    vandaag.setHours(0, 0, 0, 0); // Start van vandaag
                    
                    // Split wedstrijden in komend en gespeeld
                    const komendeWedstrijden = wedstrijden
                      .filter(w => new Date(w.datum) >= vandaag)
                      .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()); // Oudste eerst
                    
                    const gespeeldeWedstrijden = wedstrijden
                      .filter(w => new Date(w.datum) < vandaag)
                      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()); // Nieuwste eerst
                    
                    const renderWedstrijd = (wedstrijd: Wedstrijd, isKomend: boolean) => {
                      const datumFormatted = new Date(wedstrijd.datum).toLocaleDateString('nl-NL', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });
                      
                      // Bepaal formatie kleur
                      const formatieKleur = wedstrijd.formatie.includes('vliegtuig') ? 'bg-blue-100 text-blue-700' :
                                           wedstrijd.formatie.includes('dobbelsteen') ? 'bg-purple-100 text-purple-700' :
                                           'bg-green-100 text-green-700';
                      
                      // Thuis/Uit indicator
                      const thuisUit = wedstrijd.thuisUit || 'thuis';
                      const isThuis = thuisUit === 'thuis';
                      
                      // Verschillende styling voor komend vs gespeeld
                      const cardStyle = isKomend 
                        ? "border-2 border-blue-400 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow"
                        : "border rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow";
                      
                      return (
                        <div key={wedstrijd.id} className={cardStyle}>
                          {/* Header: Formatie badge + Datum + Thuis/Uit */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${formatieKleur}`}>
                              {getFormatieNaam(wedstrijd.formatie)}
                            </span>
                            <span className={`text-sm font-medium ${isKomend ? 'text-blue-700' : 'text-gray-600'}`}>
                              {datumFormatted}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              isThuis ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {isThuis ? '🏠 Thuis' : '✈️ Uit'}
                            </span>
                          </div>
                          
                          {/* Match-up display */}
                          <div className="mb-3 flex items-center gap-2 flex-wrap">
                            {isThuis ? (
                              <>
                                <span className="font-bold text-blue-600">{teamNaam}</span>
                                <span className="text-gray-400 font-medium">vs</span>
                                <span className="font-bold text-gray-700">
                                  {wedstrijd.tegenstander || '(Tegenstander niet ingevuld)'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="font-bold text-gray-700">
                                  {wedstrijd.tegenstander || '(Tegenstander niet ingevuld)'}
                                </span>
                                <span className="text-gray-400 font-medium">vs</span>
                                <span className="font-bold text-blue-600">{teamNaam}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => { setHuidgeWedstrijd(wedstrijd); setHuidigScherm('wedstrijd'); }} 
                              className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Bekijk
                            </button>
                            <button 
                              onClick={() => kopieerWedstrijd(wedstrijd)} 
                              className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
                              title="Kopieer deze wedstrijd"
                            >
                              <Copy className="w-4 h-4" />
                              Kopieer
                            </button>
                            <button 
                              onClick={() => verwijderWedstrijd(wedstrijd.id)} 
                              className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Verwijder
                            </button>
                            
                            {/* Mobile: full width buttons */}
                            <button 
                              onClick={() => { setHuidgeWedstrijd(wedstrijd); setHuidigScherm('wedstrijd'); }} 
                              className="sm:hidden flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                              <span>Bekijk</span>
                            </button>
                            <button 
                              onClick={() => kopieerWedstrijd(wedstrijd)} 
                              className="sm:hidden flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              title="Kopieer"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => verwijderWedstrijd(wedstrijd.id)} 
                              className="sm:hidden flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Verwijder"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    };
                    
                    return (
                      <>
                        {/* KOMENDE WEDSTRIJDEN SECTIE */}
                        {komendeWedstrijden.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-blue-600">📅 Komende Wedstrijden</h3>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                {komendeWedstrijden.length}
                              </span>
                            </div>
                            {komendeWedstrijden.map(w => renderWedstrijd(w, true))}
                          </div>
                        )}
                        
                        {/* GESPEELDE WEDSTRIJDEN SECTIE */}
                        {gespeeldeWedstrijden.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-gray-600">🏁 Gespeelde Wedstrijden</h3>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
                                {gespeeldeWedstrijden.length}
                              </span>
                            </div>
                            {gespeeldeWedstrijden.map(w => renderWedstrijd(w, false))}
                          </div>
                        )}
                        
                        {/* Geen wedstrijden bericht */}
                        {wedstrijden.length === 0 && (
                          <p className="text-gray-500 text-center py-8">Nog geen wedstrijden aangemaakt. Maak hierboven je eerste wedstrijd aan!</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {huidigScherm === 'team' && (
              <TeamBeheer
                clubNaam={clubNaam}
                teamNaam={teamNaam}
                spelers={spelers}
                onUpdateClubNaam={setClubNaam}
                onUpdateTeamNaam={setTeamNaam}
                onVoegSpelerToe={voegSpelerToe}
                onVerwijderSpeler={verwijderSpeler}
                onLaadTestdata={laadTestdata}
                onWisAlles={wisAlles}
              />
            )}

            {huidigScherm === 'statistieken' && (
              <Statistieken spelers={spelers} wedstrijden={wedstrijden} />
            )}

            {huidigScherm === 'wedstrijd' && huidgeWedstrijd && (
              <WedstrijdOpstelling
                wedstrijd={huidgeWedstrijd}
                wedstrijden={wedstrijden}
                spelers={spelers}
                clubNaam={clubNaam}
                teamNaam={teamNaam}
                onUpdateDatum={updateDatum}
                onUpdateTegenstander={updateTegenstander}
                onUpdateThuisUit={updateThuisUit}
                onToggleAfwezig={toggleAfwezig}
                onUpdateOpstelling={updateOpstelling}
                onVoegWisselToe={voegWisselToe}
                onUpdateWissel={updateWissel}
                onVerwijderWissel={verwijderWissel}
                onVoegDoelpuntToe={voegDoelpuntToe}
                onVerwijderDoelpunt={verwijderDoelpunt}
                onUpdateWedstrijdNotities={updateWedstrijdNotities}
                onUpdateKwartAantekeningen={updateKwartAantekeningen}
                onKopieer={() => kopieerWedstrijd(huidgeWedstrijd)}
                onSluiten={() => { setHuidgeWedstrijd(null); setHuidigScherm('wedstrijden'); }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Formatie Selectie Modal - RESPONSIVE */}
      {formatieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Compact op mobiel */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 sm:p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold">Kies je formatie</h3>
                <p className="text-xs sm:text-sm opacity-90 mt-0.5 sm:mt-1 hidden sm:block">Selecteer hoe je wilt spelen</p>
              </div>
              <button 
                onClick={() => setFormatieModal(false)}
                className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            {/* Content - Responsive layout */}
            <div className="overflow-y-auto p-3 sm:p-6 flex-1">
              <div className="space-y-2 sm:space-y-4">
                {/* 6x6 Vliegtuig - RESPONSIVE */}
                <button
                  onClick={() => maakWedstrijd('6x6-vliegtuig')}
                  className="w-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg sm:rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group
                             p-3 sm:p-6"
                >
                  <div className="flex items-center sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Mobiel: Compacte weergave */}
                      <div className="sm:hidden">
                        <h4 className="text-base font-bold text-blue-700 mb-1 flex items-center gap-2">
                          ✈️ 6x6 Vliegtuig
                        </h4>
                        <p className="text-xs text-gray-600">
                          1-1-3-1 • 6 spelers
                        </p>
                      </div>
                      
                      {/* Desktop: Uitgebreide weergave */}
                      <div className="hidden sm:block">
                        <h4 className="text-2xl font-bold text-blue-700 mb-2 group-hover:text-blue-800">
                          ✈️ 6x6 Vliegtuig
                        </h4>
                        <p className="text-gray-700 mb-3">
                          Klassieke 1-1-3-1 opstelling
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-blue-800 font-medium">Keeper</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-blue-800 font-medium">Achter</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-blue-800 font-medium">Links</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-blue-800 font-medium">Midden</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-blue-800 font-medium">Rechts</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-blue-800 font-medium">Voor</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Icoon - Check op mobiel, Plus op desktop */}
                    <div className="shrink-0">
                      <div className="sm:hidden w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="hidden sm:block text-blue-500 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </button>

                {/* 6x6 Dobbelsteen - RESPONSIVE */}
                <button
                  onClick={() => maakWedstrijd('6x6-dobbelsteen')}
                  className="w-full bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg sm:rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left group
                             p-3 sm:p-6"
                >
                  <div className="flex items-center sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Mobiel: Compacte weergave */}
                      <div className="sm:hidden">
                        <h4 className="text-base font-bold text-purple-700 mb-1 flex items-center gap-2">
                          🎲 6x6 Dobbelsteen
                        </h4>
                        <p className="text-xs text-gray-600">
                          2-1-2 • 6 spelers
                        </p>
                      </div>
                      
                      {/* Desktop: Uitgebreide weergave */}
                      <div className="hidden sm:block">
                        <h4 className="text-2xl font-bold text-purple-700 mb-2 group-hover:text-purple-800">
                          🎲 6x6 Dobbelsteen
                        </h4>
                        <p className="text-gray-700 mb-3">
                          2-1-2 opstelling met centrale middenvelder
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-purple-800 font-medium">Keeper</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-purple-800 font-medium">Links achter</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-purple-800 font-medium">Rechts achter</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-purple-800 font-medium">Midden</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-purple-800 font-medium">Links voor</span>
                          <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-purple-800 font-medium">Rechts voor</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Icoon - Check op mobiel, Plus op desktop */}
                    <div className="shrink-0">
                      <div className="sm:hidden w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="hidden sm:block text-purple-500 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </button>

                {/* 8x8 - RESPONSIVE - Only if enough players */}
                {spelers.length >= 8 ? (
                  <button
                    onClick={() => maakWedstrijd('8x8')}
                    className="w-full bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg sm:rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-left group
                               p-3 sm:p-6"
                  >
                    <div className="flex items-center sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Mobiel: Compacte weergave */}
                        <div className="sm:hidden">
                          <h4 className="text-base font-bold text-green-700 mb-1 flex items-center gap-2">
                            ⚽ 8 tegen 8
                          </h4>
                          <p className="text-xs text-gray-600">
                            1-2-3-2 • 8 spelers
                          </p>
                        </div>
                        
                        {/* Desktop: Uitgebreide weergave */}
                        <div className="hidden sm:block">
                          <h4 className="text-2xl font-bold text-green-700 mb-2 group-hover:text-green-800">
                            ⚽ 8 tegen 8
                          </h4>
                          <p className="text-gray-700 mb-3">
                            Volledige opstelling: 1-2-3-2
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-green-800 font-medium">Keeper</span>
                            <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-green-800 font-medium">2 Achter</span>
                            <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-green-800 font-medium">3 Midden</span>
                            <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-green-800 font-medium">2 Voor</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Icoon - Check op mobiel, Plus op desktop */}
                      <div className="shrink-0">
                        <div className="sm:hidden w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block text-green-500 group-hover:scale-110 transition-transform">
                          <Plus className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg sm:rounded-xl opacity-50 p-3 sm:p-6">
                    <div className="flex items-center sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Mobiel: Compacte weergave */}
                        <div className="sm:hidden">
                          <h4 className="text-base font-bold text-gray-500 mb-1">
                            ⚽ 8 tegen 8
                          </h4>
                          <p className="text-xs text-orange-600 font-medium">
                            ⚠️ Min. 8 spelers ({spelers.length}/8)
                          </p>
                        </div>
                        
                        {/* Desktop: Uitgebreide weergave */}
                        <div className="hidden sm:block">
                          <h4 className="text-2xl font-bold text-gray-500 mb-2">
                            ⚽ 8 tegen 8
                          </h4>
                          <p className="text-gray-600 mb-2">
                            Volledige opstelling: 1-2-3-2
                          </p>
                          <p className="text-sm text-orange-600 font-medium">
                            ⚠️ Je hebt minimaal 8 spelers nodig (nu: {spelers.length})
                          </p>
                        </div>
                      </div>
                      
                      {/* Geblokkeerd icoon */}
                      <div className="shrink-0 opacity-30">
                        <div className="sm:hidden w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white">
                          <X className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block text-gray-400">
                          <X className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer - Compact op mobiel */}
            <div className="border-t p-3 sm:p-4 bg-gray-50">
              <button
                onClick={() => setFormatieModal(false)}
                className="w-full px-4 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors text-sm sm:text-base"
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

export default App;
