import { useState, useEffect } from 'react';
import { LogOut, Loader } from 'lucide-react';
import { Speler, Wedstrijd, Doelpunt, formaties, Team } from './types';
import TeamBeheer from './components/teambeheer.tsx';
import Statistieken from './components/statistieken.tsx';
import WedstrijdOpstelling from './components/wedstrijdopstelling.tsx';
import WedstrijdOverzicht from './components/WedstrijdOverzicht.tsx';
import Instellingen from './components/Instellingen.tsx';
import Help from './components/Help.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import InviteCoaches from './components/InviteCoaches.tsx';
import TeamSelector from './components/TeamSelector.tsx';
import Navigation, { DEFAULT_MENU_ITEMS } from './components/Navigation';
import { 
  getCurrentCoach, 
  logoutCoach, 
  getTeamData, 
  Coach, 
  saveSpelers, 
  saveWedstrijden, 
  saveTeamInfo,
  getCoachTeams,
  switchTeam,
  createNewTeam
} from './firebase/firebaseService';

function App() {
  // Auth state
  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Multi-Tenant states
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [coachTeams, setCoachTeams] = useState<Team[]>([]);

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
    const unsubscribe = getCurrentCoach(async (coach) => {
      setCurrentCoach(coach);
      setAuthLoading(false);

      if (coach) {
        try {
          const teams = await getCoachTeams(coach.uid);
          setCoachTeams(teams);
          
          const activeTeamId = coach.currentTeamId || coach.teamId || teams[0]?.teamId;
          if (activeTeamId) {
            setSelectedTeamId(activeTeamId);
            await loadTeamData(activeTeamId, coach.uid);
          }
        } catch (error) {
          console.error('Error loading teams:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load team data when selected team changes
  useEffect(() => {
    if (selectedTeamId) {
      loadTeamData(selectedTeamId);
    }
  }, [selectedTeamId]);

  // Auto-save spelers naar Firebase
  useEffect(() => {
    if (selectedTeamId && Array.isArray(spelers) && spelers.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveSpelers(selectedTeamId, spelers).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [spelers, selectedTeamId]);

  // Auto-save wedstrijden naar Firebase
  useEffect(() => {
    if (selectedTeamId && Array.isArray(wedstrijden) && wedstrijden.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveWedstrijden(selectedTeamId, wedstrijden).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [wedstrijden, selectedTeamId]);

  // Auto-save team info naar Firebase
  useEffect(() => {
    if (selectedTeamId && clubNaam !== 'Mijn Club' && teamNaam !== 'Team A') {
      const saveTimeout = setTimeout(() => {
        saveTeamInfo(selectedTeamId, clubNaam, teamNaam).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [clubNaam, teamNaam, selectedTeamId]);

  const loadTeamData = async (teamId: string, coachUid?: string) => {
    try {
      const data = await getTeamData(teamId, coachUid);
      setSpelers(data.spelers || []);
      setWedstrijden(data.wedstrijden || []);
      setClubNaam(data.clubNaam);
      setTeamNaam(data.teamNaam);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  const handleTeamSwitch = async (teamId: string) => {
    if (!currentCoach) return;
    
    try {
      setSelectedTeamId(teamId);
      await switchTeam(currentCoach.uid, teamId);
      await loadTeamData(teamId, currentCoach.uid);
    } catch (error) {
      console.error('Error switching team:', error);
    }
  };

  const handleNewTeam = async () => {
    if (currentCoach) {
      try {
        const teams = await getCoachTeams(currentCoach.uid);
        setCoachTeams(teams);
      } catch (error) {
        console.error('Error refreshing teams:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutCoach();
      setCurrentCoach(null);
      setSpelers([]);
      setWedstrijden([]);
      setCoachTeams([]);
      setSelectedTeamId(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const removeSpeler = (id: number) => {
    setSpelers(spelers.filter(s => s.id !== id));
  };

  const getFormatieNaam = (key: string): string => {
    const namen: Record<string, string> = {
      '6x6-vliegtuig': '✈️ 6x6 Vliegtuig',
      '6x6-dobbelsteen': '🎲 6x6 Dobbelsteen',
      '8x8': '⚽ 8x8'
    };
    return namen[key] || key;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">App laden...</p>
        </div>
      </div>
    );
  }

  if (!currentCoach) {
    return <AuthScreen onLoginSuccess={() => {}} />;
  }

  return (
    <Navigation
      clubNaam={clubNaam}
      teamNaam={teamNaam}
      activeScreen={huidigScherm}
      onScreenChange={setHuidigScherm}
      menuItems={DEFAULT_MENU_ITEMS}
      onLogout={handleLogout}
      currentCoach={currentCoach}
    >
      {/* TEAM SELECTOR */}
      <div className="mb-6">
        <TeamSelector
          currentCoach={currentCoach}
          teams={coachTeams}
          selectedTeamId={selectedTeamId}
          onTeamChange={handleTeamSwitch}
          onNewTeam={handleNewTeam}
        />
      </div>

      {selectedTeamId ? (
        <>
          {/* WEDSTRIJDEN SCHERM */}
          {huidigScherm === 'wedstrijden' && (
            <WedstrijdOverzicht
              wedstrijden={wedstrijden}
              teamNaam={teamNaam}
              onNieuweWedstrijd={() => setFormatieModal(true)}
              onBekijk={(wedstrijd) => {
                setHuidgeWedstrijd(wedstrijd);
                setHuidigScherm('wedstrijd');
              }}
              onKopieer={() => {}}
              onVerwijder={() => {}}
            />
          )}

          {/* WEDSTRIJD DETAIL SCHERM */}
          {huidigScherm === 'wedstrijd' && huidgeWedstrijd && (
            <WedstrijdOpstelling
              wedstrijd={huidgeWedstrijd}
              wedstrijden={wedstrijden}
              spelers={spelers}
              clubNaam={clubNaam}
              teamNaam={teamNaam}
              onUpdateDatum={(datum) => {
                const updated = { ...huidgeWedstrijd, datum };
                setHuidgeWedstrijd(updated);
              }}
              onUpdateTegenstander={(tegenstander) => {
                const updated = { ...huidgeWedstrijd, tegenstander };
                setHuidgeWedstrijd(updated);
              }}
              onUpdateThuisUit={(thuisUit) => {
                const updated = { ...huidgeWedstrijd, thuisUit };
                setHuidgeWedstrijd(updated);
              }}
              onUpdateWedstrijdType={() => {}}
              onToggleAfwezig={() => {}}
              onSave={() => {}}
              onKwartChange={() => {}}
              onTerug={() => setHuidigScherm('wedstrijden')}
              selectedFormatie="8x8"
            />
          )}

          {/* TEAM BEHEER SCHERM */}
          {huidigScherm === 'team' && (
            <TeamBeheer
              spelers={spelers}
              clubNaam={clubNaam}
              teamNaam={teamNaam}
              onVoegSpelerToe={addSpeler}
              onVerwijderSpeler={removeSpeler}
              onUpdateClubNaam={setClubNaam}
              onUpdateTeamNaam={setTeamNaam}
              onLaadTestdata={() => {}}
              onWisAlles={() => {}}
            />
          )}

          {/* STATISTIEKEN SCHERM */}
          {huidigScherm === 'statistieken' && (
            <Statistieken spelers={spelers} wedstrijden={wedstrijden} />
          )}

          {/* INSTELLINGEN SCHERM */}
          {huidigScherm === 'instellingen' && (
            <Instellingen />
          )}

          {/* HELP SCHERM */}
          {huidigScherm === 'help' && (
            <Help />
          )}

          {/* INVITE COACHES SCHERM */}
          {huidigScherm === 'inviteCoaches' && (
            <InviteCoaches currentCoach={currentCoach} teamId={selectedTeamId} />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Geen team geselecteerd. Maak een team aan of selecteer een bestaand team.</p>
        </div>
      )}

      {/* FORMATIE MODAL */}
      {formatieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Kies Formatie</h3>
              <div className="space-y-3">
                {Object.entries(formaties).map(([key, formatie]) => (
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
                        formatie: key,
                        thuisUit: 'thuis',
                        afwezigeSpelers: gastspelerIds,
                        kwarten: Array(4)
                          .fill(null)
                          .map((_, i) => ({
                            nummer: i + 1,
                            minuten: 12.5,
                            opstelling: formatie.reduce(
                              (acc, pos) => ({
                                ...acc,
                                [pos]: ''
                              }),
                              {} as Record<string, string>
                            ),
                            wissels: [],
                            doelpunten: []
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
                    <p className="text-sm text-gray-600">{formatie.length} posities</p>
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
    </Navigation>
  );
}

export default App;
