import { useState, useEffect } from 'react';
import { LogOut, Loader, AlertCircle } from 'lucide-react';
import { Speler, Wedstrijd, Doelpunt, formaties, Seizoen } from './types';
import TeamBeheer from './screens/TeamBeheer.tsx';
import Statistieken from './screens/Statistieken.tsx';
import WedstrijdOverzicht from './screens/WedstrijdOverzicht.tsx';
import WedstrijdOpstelling from './screens/WedstrijdOpstelling.tsx';  
import Instellingen from './screens/Instellingen.tsx';
import AuthScreen from './screens/AuthScreen.tsx';
import InviteCoaches from './components/InviteCoaches.tsx';
import { Navigation, DEFAULT_MENU_ITEMS } from './components/Navigation';
import { 
  getCurrentCoach, 
  logoutCoach, 
  Coach, 
  getTeam,
  getSpelers, 
  getWedstrijden,
  saveSpelers, 
  saveWedstrijden, 
  saveTeamInfo,
  getSeizoenen,
  addWedstrijd
} from './firebase/firebaseService';
import { getFormatieNaam } from './utils/formatters';

function App() {
  // Auth state
  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ✨ NIEUW v2: Team & Seizoen selectie
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedSeizoenId, setSelectedSeizoenId] = useState<string | null>(null);
  const [seizoenen, setSeizoenen] = useState<Seizoen[]>([]);
  const [seizoenenLoading, setSeizoenLoading] = useState(false);
  const [showSeizoenModal, setShowSeizoenModal] = useState(false);

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

  // ✨ EFFECT 1: Check auth on mount
  useEffect(() => {
    const unsubscribe = getCurrentCoach((coach) => {
      setCurrentCoach(coach);
      setAuthLoading(false);

      // Selecteer eerste team automatisch
      if (coach && coach.teamIds.length > 0) {
        setSelectedTeamId(coach.teamIds[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✨ EFFECT 2: Load seizoenen when team selected
  useEffect(() => {
    if (selectedTeamId) {
      loadSeizoenen(selectedTeamId);
    }
  }, [selectedTeamId]);

  // ✨ EFFECT 3: Load team data when seizoen selected
  useEffect(() => {
    if (selectedTeamId && selectedSeizoenId) {
      loadTeamData(selectedTeamId, selectedSeizoenId);
    }
  }, [selectedTeamId, selectedSeizoenId]);

  // ✨ EFFECT 4: Auto-save spelers naar Firestore (teamId nodig, seizoen niet nodig)
  useEffect(() => {
    if (selectedTeamId && spelers.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveSpelers(selectedTeamId, spelers).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [spelers, selectedTeamId]);

  // ✨ EFFECT 5: Auto-save wedstrijden naar Firestore (REQUIRES seizoenId!)
  useEffect(() => {
    if (selectedTeamId && selectedSeizoenId && wedstrijden.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveWedstrijden(selectedTeamId, selectedSeizoenId, wedstrijden).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [wedstrijden, selectedTeamId, selectedSeizoenId]);

  // ✨ EFFECT 6: Auto-save team info naar Firestore (teamId nodig)
  useEffect(() => {
    if (selectedTeamId) {
      const saveTimeout = setTimeout(() => {
        saveTeamInfo(selectedTeamId, clubNaam, teamNaam).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [clubNaam, teamNaam, selectedTeamId]);

  // ✨ Load seizoenen van geselecteerde team
  const loadSeizoenen = async (teamId: string) => {
    try {
      setSeizoenLoading(true);
      const data = await getSeizoenen(teamId);
      setSeizoenen(data);
      
      // Auto-select actief seizoen
      const activeSeizoenen = data.filter(s => s.status === 'actief');
      if (activeSeizoenen.length > 0) {
        setSelectedSeizoenId(activeSeizoenen[0].seizoenId);
      } else if (data.length > 0) {
        // Fallback: selecteer eerste seizoen als geen actief
        setSelectedSeizoenId(data[0].seizoenId);
        setShowSeizoenModal(true);
      }
      // ✅ FIXED: Geen forced redirect meer! User kan zelf seizoen aanmaken in TeamBeheer
      setSeizoenLoading(false);
    } catch (error) {
      console.error('Error loading seizoenen:', error);
      setSeizoenLoading(false);
    }
  };

  // ✨ Laad team data van Firestore (met seizoenId!)
  const loadTeamData = async (teamId: string, seizoenId: string) => {
    try {
      const [team, spelers, wedstrijden] = await Promise.all([
        getTeam(teamId),
        getSpelers(teamId),
        getWedstrijden(teamId, seizoenId)
      ]);

      setSpelers(spelers);
      setWedstrijden(wedstrijden);
      setClubNaam(team?.clubNaam || 'Mijn Club');
      setTeamNaam(team?.teamNaam || 'Team A');
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  // Kopieer wedstrijd
  const kopieerWedstrijd = (wedstrijd: Wedstrijd) => {
    setKopieerModal({
      open: true,
      wedstrijd: wedstrijd,
      datum: new Date().toISOString().split('T')[0],
      tegenstander: wedstrijd.tegenstander ? `${wedstrijd.tegenstander}` : ''
    });
  };

  // Bevestig kopie
  const bevestigKopieerWedstrijd = () => {
    if (!kopieerModal.wedstrijd || !selectedTeamId || !selectedSeizoenId) return;

    const gekopieerd: Wedstrijd = {
      ...kopieerModal.wedstrijd,
      id: Date.now(),
      datum: kopieerModal.datum,
      tegenstander: kopieerModal.tegenstander,
      thuisUit: kopieerModal.wedstrijd.thuisUit || 'thuis',
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
    setHuidigScherm('wedstrijden');
  };

  // Verwijder wedstrijd
  const verwijderWedstrijd = (id: number) => {
    setWedstrijden(wedstrijden.filter(w => w.id !== id));
  };

  // Voeg speler toe
  const addSpeler = (naam: string, type?: 'vast' | 'gast', team?: string) => {
    const newSpeler: Speler = {
      id: Date.now(),
      naam,
      type: type || 'vast',
      team: team || undefined
    };
    setSpelers([...spelers, newSpeler]);
  };

  // Verwijder speler
  const removeSpeler = (id: number) => {
    setSpelers(spelers.filter(s => s.id !== id));
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutCoach();
      setCurrentCoach(null);
      setSelectedTeamId(null);
      setSelectedSeizoenId(null);
      setSpelers([]);
      setWedstrijden([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading screen
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

  // Auth screen
  if (!currentCoach) {
    return <AuthScreen onLoginSuccess={() => {}} />;
  }

  // ✨ NIEUW: Seizoen loading/selectie screen
  if (!selectedTeamId || !selectedSeizoenId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          {seizoenenLoading ? (
            <>
              <Loader className="w-12 h-12 text-white animate-spin mx-auto" />
              <p className="text-white text-lg font-semibold">Seizoenen laden...</p>
            </>
          ) : seizoenen.length === 0 ? (
            <>
              <AlertCircle className="w-12 h-12 text-yellow-300 mx-auto" />
              <p className="text-white text-lg font-semibold">Geen seizoenen gevonden</p>
              <p className="text-white text-sm">Maak eerst een seizoen aan</p>
              <button
                onClick={() => setHuidigScherm('seizoenen')}
                className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
              >
                Seizoen Beheer
              </button>
            </>
          ) : (
            <>
              <Loader className="w-12 h-12 text-white animate-spin mx-auto" />
              <p className="text-white text-lg font-semibold">Data laden...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main app
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
          onKopieer={kopieerWedstrijd}
          onVerwijder={verwijderWedstrijd}
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
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateTegenstander={(tegenstander) => {
            const updated = { ...huidgeWedstrijd, tegenstander };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateThuisUit={(thuisUit) => {
            const updated = { ...huidgeWedstrijd, thuisUit };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateType={(type) => {
            const updated = { ...huidgeWedstrijd, type };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateFormatie={(formatie) => {
            const updated = { ...huidgeWedstrijd, formatie };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateAfwezigeSpelers={(afwezigeSpelers) => {
            const updated = { ...huidgeWedstrijd, afwezigeSpelers };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateNotities={(notities) => {
            const updated = { ...huidgeWedstrijd, notities };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateIsAfgelast={(isAfgelast) => {
            const updated = { ...huidgeWedstrijd, isAfgelast };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateOpstelling={(kwartIndex, opstelling) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, opstelling } : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateWissels={(kwartIndex, wissels) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, wissels } : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateDoelpunten={(kwartIndex, doelpunten) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, doelpunten } : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateWedstrijdThemas={(themas) => {
            const updated = { ...huidgeWedstrijd, themas };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateKwartAantekeningen={(kwartIndex, aantekeningen) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, aantekeningen } : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateKwartThemaBeoordeling={(kwartIndex, themaId, beoordeling) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex
                  ? {
                      ...k,
                      themaBeoordelingen: {
                        ...k.themaBeoordelingen,
                        [themaId]: beoordeling
                      }
                    }
                  : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateKwartObservaties={(kwartIndex, observaties) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, observaties } : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onSluiten={() => setHuidigScherm('wedstrijden')}
        />
      )}

      {/* TEAM SCHERM */}
      {huidigScherm === 'team' && selectedTeamId && (
        <div className="space-y-6">
          <TeamBeheer
            spelers={spelers}
            onVoegSpelerToe={addSpeler}
            onVerwijderSpeler={removeSpeler}
            clubNaam={clubNaam}
            teamNaam={teamNaam}
            onUpdateClubNaam={setClubNaam}
            onUpdateTeamNaam={setTeamNaam}
            onLaadTestdata={() => {
              console.log('Testdata laden (nog niet implemented)');
            }}
            onWisAlles={() => {
              if (confirm('Weet je zeker dat je alles wilt wissen?')) {
                setSpelers([]);
                setWedstrijden([]);
              }
            }}
            teamId={selectedTeamId}
            seizoenen={seizoenen}
            selectedSeizoenId={selectedSeizoenId}
            onSeizoenChange={(seizoenId) => {
              setSelectedSeizoenId(seizoenId);
              setHuidigScherm('wedstrijden');
            }}
            onSeizoenUpdate={() => {
              if (selectedTeamId) {
                loadSeizoenen(selectedTeamId);
              }
            }}
          />

          {/* Invite Coaches - ✨ FIXED: Gebruik selectedTeamId */}
          <InviteCoaches teamId={selectedTeamId} currentCoach={currentCoach} />
        </div>
      )}

      {/* STATISTIEKEN SCHERM */}
      {huidigScherm === 'statistieken' && (
        <Statistieken wedstrijden={wedstrijden} spelers={spelers} />
      )}

      {/* INSTELLINGEN SCHERM */}
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
