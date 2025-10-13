import { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Eye } from 'lucide-react';
import { Speler, Wedstrijd, formaties } from './types';
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
  };

  const kopieerWedstrijd = (wedstrijd: Wedstrijd) => {
    const gekopieerd: Wedstrijd = {
      ...wedstrijd,
      id: Date.now(),
      datum: new Date().toISOString().split('T')[0],
      tegenstander: wedstrijd.tegenstander ? `${wedstrijd.tegenstander} (kopie)` : ''
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">
            ⚽ {clubNaam} - {teamNaam}
          </h1>
          <p className="text-center text-gray-600 mb-6">Opstelling Manager</p>

          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            <button 
              onClick={() => setHuidigScherm('wedstrijden')} 
              className={`px-4 py-2 rounded-lg font-medium ${huidigScherm === 'wedstrijden' || huidigScherm === 'wedstrijd' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              ⚽ Wedstrijden
            </button>
            <button 
              onClick={() => setHuidigScherm('statistieken')} 
              className={`px-4 py-2 rounded-lg font-medium ${huidigScherm === 'statistieken' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              📈 Statistieken
            </button>
            <button 
              onClick={() => setHuidigScherm('team')} 
              className={`px-4 py-2 rounded-lg font-medium ${huidigScherm === 'team' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              👥 Team
            </button>
          </div>

          <div>
            {huidigScherm === 'wedstrijden' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Wedstrijden</h2>
                </div>

                {/* Nieuwe Wedstrijd Knoppen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">➕ Nieuwe Wedstrijd Aanmaken</h3>
                  {spelers.length < 6 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">Je hebt minimaal 6 spelers nodig om een wedstrijd aan te maken.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <button 
                        onClick={() => maakWedstrijd('6x6-vliegtuig')} 
                        className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-left"
                      >
                        <h4 className="text-lg font-bold mb-1">✈️ 6x6 Vliegtuig</h4>
                        <p className="text-sm opacity-90">Keeper, Achter, Links, Midden, Rechts, Voor</p>
                      </button>
                      <button 
                        onClick={() => maakWedstrijd('6x6-dobbelsteen')} 
                        className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-left"
                      >
                        <h4 className="text-lg font-bold mb-1">🎲 6x6 Dobbelsteen</h4>
                        <p className="text-sm opacity-90">2-1-2 opstelling met centrale middenvelder</p>
                      </button>
                      {spelers.length >= 8 && (
                        <button 
                          onClick={() => maakWedstrijd('8x8')} 
                          className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 text-left"
                        >
                          <h4 className="text-lg font-bold mb-1">⚽ 8 tegen 8</h4>
                          <p className="text-sm opacity-90">Keeper, 2 Achter, 3 Midden, 2 Voor</p>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Overzicht Wedstrijden */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">Gespeelde Wedstrijden ({wedstrijden.length})</h3>
                  {wedstrijden.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()).map(wedstrijd => {
                    const datumFormatted = new Date(wedstrijd.datum).toLocaleDateString('nl-NL', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    return (
                      <div key={wedstrijd.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold">
                              {getFormatieNaam(wedstrijd.formatie)} - {datumFormatted}
                              {wedstrijd.tegenstander && <span className="text-blue-600"> vs {wedstrijd.tegenstander}</span>}
                            </h4>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setHuidgeWedstrijd(wedstrijd); setHuidigScherm('wedstrijd'); }} 
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />Bekijk
                            </button>
                            <button 
                              onClick={() => kopieerWedstrijd(wedstrijd)} 
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1" 
                              title="Kopieer deze wedstrijd"
                            >
                              <Plus className="w-4 h-4" />Kopieer
                            </button>
                            <button 
                              onClick={() => verwijderWedstrijd(wedstrijd.id)} 
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {wedstrijden.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld. Maak hierboven je eerste wedstrijd aan!</p>
                  )}
                </div>
              </div>
            )}

            {huidigScherm === 'team' && (
              <TeamBeheer
                clubNaam={clubNaam}
                setClubNaam={setClubNaam}
                teamNaam={teamNaam}
                setTeamNaam={setTeamNaam}
                spelers={spelers}
                setSpelers={setSpelers}
              />
            )}

            {huidigScherm === 'statistieken' && (
              <Statistieken spelers={spelers} wedstrijden={wedstrijden} />
            )}

            {huidigScherm === 'wedstrijd' && huidgeWedstrijd && (
              <WedstrijdOpstelling
                wedstrijd={huidgeWedstrijd}
                spelers={spelers}
                clubNaam={clubNaam}
                teamNaam={teamNaam}
                onUpdateDatum={updateDatum}
                onUpdateTegenstander={updateTegenstander}
                onUpdateOpstelling={updateOpstelling}
                onVoegWisselToe={voegWisselToe}
                onUpdateWissel={updateWissel}
                onVerwijderWissel={verwijderWissel}
                onKopieer={() => kopieerWedstrijd(huidgeWedstrijd)}
                onSluiten={() => { setHuidgeWedstrijd(null); setHuidigScherm('wedstrijden'); }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
