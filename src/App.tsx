import { useState, useEffect } from 'react';
import { Users, Clock, Trophy, Plus, Trash2, Eye } from 'lucide-react';

interface Speler {
  id: number;
  naam: string;
}

interface Wissel {
  id: number;
  positie: string;
  wisselSpelerId: string;
}

interface Kwart {
  nummer: number;
  opstelling: Record<string, string>;
  wissels: Wissel[];
  minuten: number;
}

interface Wedstrijd {
  id: number;
  datum: string;
  tegenstander: string;
  formatie: '6x6' | '8x8';
  kwarten: Kwart[];
}

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
  
  const [nieuweSpeler, setNieuweSpeler] = useState('');
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

  const formaties: Record<'6x6' | '8x8', string[]> = {
    '6x6': ['Keeper', 'Achter', 'Links', 'Midden', 'Rechts', 'Voor'],
    '8x8': ['Keeper', 'Links achter', 'Rechts achter', 'Links midden', 'Midden', 'Rechts midden', 'Links voor', 'Rechts voor']
  };

  const voegSpelerToe = () => {
    if (nieuweSpeler.trim()) {
      setSpelers([...spelers, { id: Date.now(), naam: nieuweSpeler.trim() }]);
      setNieuweSpeler('');
    }
  };

  const verwijderSpeler = (id: number) => {
    setSpelers(spelers.filter(s => s.id !== id));
  };

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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />Team Beheer
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-4 text-lg">Club & Team Informatie</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Club Naam</label>
                      <input 
                        type="text" 
                        value={clubNaam} 
                        onChange={(e) => setClubNaam(e.target.value)} 
                        placeholder="Bijv. FC Rotterdam" 
                        className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Team Naam</label>
                      <input 
                        type="text" 
                        value={teamNaam} 
                        onChange={(e) => setTeamNaam(e.target.value)} 
                        placeholder="Bijv. JO19-1" 
                        className="w-full px-4 py-2 border-2 border-green-500 rounded-lg font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-4 text-lg">Spelers</h3>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value={nieuweSpeler} 
                      onChange={(e) => setNieuweSpeler(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && voegSpelerToe()} 
                      placeholder="Naam nieuwe speler" 
                      className="flex-1 px-4 py-2 border rounded-lg" 
                    />
                    <button 
                      onClick={voegSpelerToe} 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />Toevoegen
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {spelers.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium">{s.naam}</span>
                        <button 
                          onClick={() => verwijderSpeler(s.id)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {spelers.length === 0 && <p className="text-gray-500 text-center py-8">Nog geen spelers toegevoegd</p>}
                  {spelers.length > 0 && <p className="text-sm text-gray-600 mt-4 text-center">Totaal {spelers.length} speler{spelers.length !== 1 ? 's' : ''}</p>}
                </div>
              </div>
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
                    </button>
                    {spelers.length >= 8 && (
                      <button 
                        onClick={() => maakWedstrijd('8x8')} 
                        className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 text-left"
                      >
                        <h3 className="text-xl font-bold mb-2">8 tegen 8</h3>
                        <p className="text-sm opacity-90">Keeper, 2 Achter, 3 Midden, 2 Voor</p>
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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Statistieken</h2>
                {wedstrijden.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
                ) : (
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
