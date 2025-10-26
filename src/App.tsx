import { useState, useEffect } from 'react';
import { LogOut, Loader } from 'lucide-react';
import { Speler, Wedstrijd, Doelpunt, formaties } from './types';
import TeamBeheer from './screens/TeamBeheer.tsx';
import Statistieken from './screens/Statistieken.tsx';
import WedstrijdOverzicht from './screens/WedstrijdOverzicht.tsx';
import WedstrijdOpstelling from './screens/WedstrijdOpstelling.tsx';  
import Instellingen from './screens/Instellingen.tsx';
import AuthScreen from './screens/AuthScreen.tsx';
import InviteCoaches from './components/InviteCoaches.tsx';
import { Navigation, DEFAULT_MENU_ITEMS } from './components/Navigation';
import { getCurrentCoach, logoutCoach, getTeamData, Coach, saveSpelers, saveWedstrijden, saveTeamInfo } from './firebase/firebaseService';
import { getFormatieNaam } from './utils/formatters';

function App() {
  // Auth state
  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [spelers, setSpelers] = useState<Speler[]>([]);
  const [wedstrijden, setWedstrijden] = useState<Wedstrijd[]>([]);
  const [clubNaam, setClubNaam] = useState('Mijn Club');
  const [teamNaam, setTeamNaam] = useState('Team A');
  const [huidigScherm, setHuidigScherm] = useState('wedstrijden');
  const [huidgeWedstrijd, setHuidgeWedstrijd] = useState<Wedstrijd | null>(null);
  const [formatieModal, setFormatieModal] = useState(false);
  const [kopieerModal, setKopieerModal] = useState<{
    open: boolean;
    wedstrijd: Wedstrijd | null;
    datum: string;
    tegenstander: string;
  }>({ open: false, wedstrijd: null, datum: '', tegenstander: '' });

  // Check auth on mount
  useEffect(() => {
    const unsubscribe = getCurrentCoach((coach) => {
      setCurrentCoach(coach);
      setAuthLoading(false);

      // Laad team data als coach ingelogd is
      if (coach) {
        loadTeamData(coach.teamId);
      }
    });

    return () => unsubscribe();
  }, []);

  // Laad team data van Firestore
  const loadTeamData = async (teamId: string) => {
    try {
      const data = await getTeamData(teamId);
      setSpelers(data.spelers);
      setWedstrijden(data.wedstrijden);
      setClubNaam(data.clubNaam);
      setTeamNaam(data.teamNaam);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  // Save spelers naar Firestore (auto-sync)
  useEffect(() => {
    if (currentCoach && spelers.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveSpelers(currentCoach.teamId, spelers).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [spelers, currentCoach]);

  // Save wedstrijden naar Firestore (auto-sync)
  useEffect(() => {
    if (currentCoach && wedstrijden.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveWedstrijden(currentCoach.teamId, wedstrijden).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [wedstrijden, currentCoach]);

  // Save club en team naam naar Firestore (auto-sync)
  useEffect(() => {
    if (currentCoach) {
      const saveTimeout = setTimeout(() => {
        saveTeamInfo(currentCoach.teamId, clubNaam, teamNaam).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [clubNaam, teamNaam, currentCoach]);

  const kopieerWedstrijd = (wedstrijd: Wedstrijd) => {
    setKopieerModal({
      open: true,
      wedstrijd: wedstrijd,
      datum: new Date().toISOString().split('T')[0],
      tegenstander: wedstrijd.tegenstander ? `${wedstrijd.tegenstander}` : ''
    });
  };

  const bevestigKopieerWedstrijd = () => {
    if (!kopieerModal.wedstrijd) return;

    const gekopieerd: Wedstrijd = {
      ...kopieerModal.wedstrijd,
      id: Date.now(),
      datum: kopieerModal.datum,
      tegenstander: kopieerModal.tegenstander,
      notities: '',
      themas: [],
      afwezigeSpelers: [],
      kwarten: kopieerModal.wedstrijd.kwarten.map(kwart => ({
        ...kwart,
        doelpunten: [],
        wissels: [],
        aantekeningen: '',
        themaBeoordelingen: {},
        observaties: []
      }))
    };
    
    setWedstrijden([...wedstrijden, gekopieerd]);
    setKopieerModal({ open: false, wedstrijd: null, datum: '', tegenstander: '' });
    setHuidgeWedstrijd(gekopieerd);
    setHuidigScherm('wedstrijd');
  };

  const verwijderWedstrijd = (id: number) => {
    setWedstrijden(wedstrijden.filter(w => w.id !== id));
  };

  const removeSpeler = (id: number) => {
    setSpelers(spelers.filter(s => s.id !== id));
  };

  const addSpeler = (naam: string, type?: 'vast' | 'gast', team?: string) => {
    const newSpeler: Speler = {
      id: Date.now(),
      naam,
      type: type || 'vast',
      team: team || undefined
    };
    setSpelers([...spelers, newSpeler]);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">App laden...</p>
        </div>
      </div>
    );
  }

  if (!currentCoach) {
    return <AuthScreen />;
  }

  return (
    <Navigation 
      menuItems={DEFAULT_MENU_ITEMS}
      currentScreen={huidigScherm}
      onSelectScreen={setHuidigScherm}
      userEmail={currentCoach.email}
      onLogout={() => {
        logoutCoach();
        setCurrentCoach(null);
      }}
      teamNames={`${clubNaam} - ${teamNaam}`}
    >
      {/* ✅ WEDSTRIJDOVERZICHT - JUISTE PROP NAMEN */}
      {huidigScherm === 'wedstrijden' && (
        <WedstrijdOverzicht
          teamNaam={teamNaam}
          wedstrijden={wedstrijden}
          onNieuweWedstrijd={() => setFormatieModal(true)}
          onBekijk={(w) => {
            setHuidgeWedstrijd(w);
            setHuidigScherm('wedstrijd');
          }}
          onKopieer={kopieerWedstrijd}
          onVerwijder={verwijderWedstrijd}
        />
      )}

      {/* WEDSTRIJDOPSTELLING */}
      {huidigScherm === 'wedstrijd' && huidgeWedstrijd && (
        <WedstrijdOpstelling
          wedstrijd={huidgeWedstrijd}
          wedstrijden={wedstrijden}
          spelers={spelers}
          clubNaam={clubNaam}
          teamNaam={teamNaam}
          onSelectWedstrijd={(w) => {
            setHuidgeWedstrijd(w);
            setWedstrijden(wedstrijden.map(wd => wd.id === w.id ? w : wd));
          }}
          onClose={() => setHuidigScherm('wedstrijden')}
        />
      )}

      {/* TEAM */}
      {huidigScherm === 'team' && (
        <TeamBeheer
          spelers={spelers}
          onVoegSpelerToe={addSpeler}
          onVerwijderSpeler={removeSpeler}
          clubNaam={clubNaam}
          teamNaam={teamNaam}
          onUpdateClubNaam={setClubNaam}
          onUpdateTeamNaam={setTeamNaam}
          onLaadTestdata={() => {}}
          onWisAlles={() => {
            if (confirm('Weet je zeker dat je alles wilt wissen?')) {
              setSpelers([]);
              setWedstrijden([]);
            }
          }}
        />
      )}

      {/* STATISTIEKEN */}
      {huidigScherm === 'statistieken' && (
        <Statistieken wedstrijden={wedstrijden} spelers={spelers} />
      )}

      {/* INSTELLINGEN */}
      {huidigScherm === 'instellingen' && (
        <Instellingen
          clubNaam={clubNaam}
          teamNaam={teamNaam}
          onUpdateClubNaam={setClubNaam}
          onUpdateTeamNaam={setTeamNaam}
          onExportData={() => {}}
          onImportData={() => {}}
        />
      )}

      {/* FORMATIE MODAL */}
      {formatieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Kies Formatie</h3>
              <div className="space-y-3">
                {Object.entries(formaties).map(([key, positieLijst]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const gastspelerIds = spelers
                        .filter(s => s.type === 'gast')
                        .map(s => s.id);
                      
                      const newWedstrijd: Wedstrijd = {
                        id: Date.now(),
                        datum: new Date().toISOString().split('T')[0],
                        tegenstander: '',
                        formatie: key as '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8',
                        thuisUit: 'thuis',
                        afwezigeSpelers: gastspelerIds,
                        kwarten: Array(4)
                          .fill(null)
                          .map((_, i) => ({
                            nummer: i + 1,
                            minuten: 12.5,
                            opstelling: positieLijst.reduce(
                              (acc, pos) => ({
                                ...acc,
                                [pos]: ''
                              }),
                              {} as Record<string, string>
                            ),
                            wissels: [],
                            doelpunten: [],
                            aantekeningen: '',
                            themaBeoordelingen: {},
                            observaties: []
                          }))
                      };
                      setWedstrijden([...wedstrijden, newWedstrijd]);
                      setFormatieModal(false);
                      setHuidgeWedstrijd(newWedstrijd);
                      setHuidigScherm('wedstrijd');
                    }}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <h4 className="font-bold">{getFormatieNaam(key)}</h4>
                    <p className="text-sm text-gray-600">{positieLijst.length} posities</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setFormatieModal(false)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuleer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KOPIEER MODAL */}
      {kopieerModal.open && kopieerModal.wedstrijd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Kopieer Wedstrijd</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Datum</label>
                  <input
                    type="date"
                    value={kopieerModal.datum}
                    onChange={(e) =>
                      setKopieerModal({ ...kopieerModal, datum: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tegenstander</label>
                  <input
                    type="text"
                    value={kopieerModal.tegenstander}
                    onChange={(e) =>
                      setKopieerModal({ ...kopieerModal, tegenstander: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={bevestigKopieerWedstrijd}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Kopieer
              </button>
              <button
                onClick={() =>
                  setKopieerModal({
                    open: false,
                    wedstrijd: null,
                    datum: '',
                    tegenstander: ''
                  })
                }
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuleer
              </button>
            </div>
          </div>
        </div>
      )}
    </Navigation>
  );
}

export default App;
