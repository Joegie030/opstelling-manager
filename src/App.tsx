import { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Eye } from 'lucide-react';
import { Speler, Wedstrijd, formaties } from './types';
import TeamBeheer from './components/teambeheer.tsx';
import Statistieken from './components/statistieken.tsx';
import Statistieken from './components/wedstrijdopstelling.tsx';


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
  
  const [huidigScherm, setHuidigScherm] = useState('team');
  const [huidgeWedstrijd, setHuidgeWedstrijd] = useState<Wedstrijd | null>(null);

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

  const maakWedstrijd = (formatie: '6x6' | '8x8') => {
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
      setHuidigScherm('overzicht');
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
              onClick={() => setHuidigScherm('team')} 
              className={`px-4 py-2 rounded-lg font-medium ${huidigScherm === 'team' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              👥 Team
            </button>
            <button 
              onClick={() => setHuidigScherm('nieuwe-wedstrijd')} 
              className={`px-4 py-2 rounded-lg font-medium ${huidigScherm === 'nieuwe-wedstrijd' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              ➕ Nieuwe Wedstrijd
            </button>
            <button 
              onClick={() => setHuidigScherm('overzicht')} 
              className={`px-4 py-2 rounded-lg font-medium ${huidigScherm === 'overzicht' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              📊 Overzicht
            </button>
            <button 
              onClick={() => setHuidigScherm('statistieken')} 
              className={`px-4 py-2 rounded-lg font-medium ${huidigScherm === 'statistieken' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              📈 Statistieken
            </button>
          </div>

          <div>
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

            {huidigScherm === 'nieuwe-wedstrijd' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6" />Nieuwe Wedstrijd
                </h2>
                {spelers.length < 6 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Je hebt minimaal 6 spelers nodig.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <button 
                      onClick={() => maakWedstrijd('6x6')} 
                      className="p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-left"
                    >
                      <h3 className="text-xl font-bold mb-2">6 tegen 6</h3>
                      <p className="text-sm opacity-90">Keeper, Achter, Links, Midden, Rechts, Voor</p>
                      <p className="text-xs opacity-75 mt-2">💡 Je kunt wisselen na 6,25 min</p>
                    </button>
                    {spelers.length >= 8 && (
                      <button 
                        onClick={() => maakWedstrijd('8x8')} 
                        className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 text-left"
                      >
                        <h3 className="text-xl font-bold mb-2">8 tegen 8</h3>
                        <p className="text-sm opacity-90">Keeper, 2 Achter, 3 Midden, 2 Voor</p>
                        <p className="text-xs opacity-75 mt-2">💡 Je kunt wisselen na 6,25 min</p>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {huidigScherm === 'overzicht' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Overzicht Wedstrijden</h2>
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
                              {wedstrijd.formatie} - {datumFormatted}
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
                </div>
                {wedstrijden.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
                )}
              </div>
            )}

            {huidigScherm === 'statistieken' && (
              <Statistieken spelers={spelers} wedstrijden={wedstrijden} />
            )}

            {huidigScherm === 'wedstrijd' && huidgeWedstrijd && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h2 className="text-2xl font-bold">{clubNaam} {teamNaam} - {huidgeWedstrijd.formatie}</h2>
                      <input 
                        type="date" 
                        value={huidgeWedstrijd.datum} 
                        onChange={(e) => updateDatum(e.target.value)} 
                        className="px-3 py-2 border-2 border-blue-500 rounded-lg font-medium" 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Tegenstander:</label>
                      <input 
                        type="text" 
                        value={huidgeWedstrijd.tegenstander || ''} 
                        onChange={(e) => updateTegenstander(e.target.value)} 
                        placeholder="Optioneel" 
                        className="px-3 py-2 border rounded-lg" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => kopieerWedstrijd(huidgeWedstrijd)} 
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />Kopieer
                    </button>
                    <button 
                      onClick={() => { setHuidgeWedstrijd(null); setHuidigScherm('overzicht'); }} 
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Opslaan & Sluiten
                    </button>
                  </div>
                </div>

                <p className="text-center text-gray-500 py-8">
                  Wedstrijd opstelling functionaliteit wordt nog toegevoegd...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
