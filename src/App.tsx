import { useState, useEffect } from 'react';
import { LogOut, Loader } from 'lucide-react';
import { Speler, Wedstrijd, Doelpunt, formaties, CoachInvite } from './types';
import TeamBeheer from './screens/TeamBeheer.tsx';
import Statistieken from './screens/Statistieken.tsx';
import WedstrijdOverzicht from './screens/WedstrijdOverzicht.tsx';
import WedstrijdOpstelling from './screens/WedstrijdOpstelling.tsx';  
import Instellingen from './screens/Instellingen.tsx';
import AuthScreen from './screens/AuthScreen.tsx';
import CoachBeheer from './screens/CoachBeheer.tsx';
import AcceptInviteScreen from './screens/AcceptInviteScreen.tsx';
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
  createTeam,
  deleteTeam,
  deleteWedstrijd,
  deleteSpeler,
  inviteCoach,
  getInviteById,
  acceptInvite,
  revokeInvite,
  getTeamCoaches,
  removeCoachFromTeam,
  getPendingInvitesByTeam
} from './firebase/firebaseService';
import { getFormatieNaam } from './utils/formatters';
import { laadTeamInfo, TeamInfo } from './utils/teamData';

function App() {
  // Auth state
  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ✨ Team selectie (seizoenen verwijderd)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  // ✨ NEW: Teams list with team names (for dropdown)
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // App state
  const [spelers, setSpelers] = useState<Speler[]>([]);
  const [wedstrijden, setWedstrijden] = useState<Wedstrijd[]>([]);
  const [clubNaam, setClubNaam] = useState('');
  const [teamNaam, setTeamNaam] = useState('');
  const [huidigScherm, setHuidigScherm] = useState('wedstrijden');
  const [huidgeWedstrijd, setHuidgeWedstrijd] = useState<Wedstrijd | null>(null);
  const [formatieModal, setFormatieModal] = useState(false);
  const [kopieerModal, setKopieerModal] = useState<{
    open: boolean;
    wedstrijd: Wedstrijd | null;
    datum: string;
    tegenstander: string;
  }>({ open: false, wedstrijd: null, datum: '', tegenstander: '' });

  // ✨ Coach Beheer state (v3.1)
  const [pendingInvites, setPendingInvites] = useState<CoachInvite[]>([]);
  const [teamCoaches, setTeamCoaches] = useState<Coach[]>([]);
  const [inviteIdFromUrl, setInviteIdFromUrl] = useState<string | null>(null);

  // ✨ EFFECT 1: Check auth on mount
  useEffect(() => {
    const unsubscribe = getCurrentCoach((coach) => {
      setCurrentCoach(coach);
      setAuthLoading(false);

      // Selecteer eerste team automatisch, ANDERS toon TeamBeheer
      if (coach && coach.teamIds.length > 0) {
        setSelectedTeamId(coach.teamIds[0]);
        setHuidigScherm('wedstrijden');
      } else {
        // Geen team - toon TeamBeheer om team te maken
        setHuidigScherm('team');
        console.log('ℹ️ Geen team gevonden - toon TeamBeheer');
      }
    });

    return () => unsubscribe();
  }, []);

  // ✨ EFFECT 1.5: Parse invite from URL on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/accept-invite\/(.+)$/);
    if (match) {
      const inviteId = match[1];
      console.log('📥 Found invite in URL:', inviteId);
      setInviteIdFromUrl(inviteId);
      setHuidigScherm('accept-invite');
    }
  }, []);

  // ✨ EFFECT 2: Load all team info when coach changes
  // 🎯 This populates the teams dropdown with team names
  useEffect(() => {
    if (currentCoach?.teamIds && currentCoach.teamIds.length > 0) {
      setTeamsLoading(true);
      laadTeamInfo(currentCoach.teamIds, getTeam)
        .then(loadedTeams => {
          console.log('✅ Teams loaded in App:', loadedTeams);
          setTeams(loadedTeams);
          setTeamsLoading(false);
        })
        .catch(error => {
          console.error('❌ Error loading teams:', error);
          setTeamsLoading(false);
        });
    } else {
      setTeams([]);
    }
  }, [currentCoach?.teamIds]);

  // ✨ EFFECT 3: Load team data when team selected (seizoenen verwijderd!)
  useEffect(() => {
    if (selectedTeamId) {
      loadTeamData(selectedTeamId);
    }
  }, [selectedTeamId]);

  // ✨ EFFECT 4: Auto-save spelers naar Firestore (teamId nodig)
  useEffect(() => {
    if (selectedTeamId && spelers.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveSpelers(selectedTeamId, spelers).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [spelers]);

  // ✨ EFFECT 5: Auto-save wedstrijden naar Firestore (seizoenId verwijderd!)
  useEffect(() => {
    if (selectedTeamId && wedstrijden.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveWedstrijden(selectedTeamId, wedstrijden).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [wedstrijden]);

  // ✨ EFFECT 6: Auto-save team info naar Firestore (teamId nodig)
  useEffect(() => {
    if (selectedTeamId) {
      const saveTimeout = setTimeout(() => {
        saveTeamInfo(selectedTeamId, clubNaam, teamNaam).catch(console.error);
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [clubNaam, teamNaam]);

  // ✨ EFFECT 7: Load pending invites when team selected
  useEffect(() => {
    if (selectedTeamId) {
      getPendingInvitesByTeam(selectedTeamId)
        .then(setPendingInvites)
        .catch(error => console.error('❌ Error loading pending invites:', error));
    }
  }, [selectedTeamId]);

  // ✨ EFFECT 8: Load team coaches when team selected
  useEffect(() => {
    if (selectedTeamId) {
      getTeamCoaches(selectedTeamId)
        .then(setTeamCoaches)
        .catch(error => console.error('❌ Error loading team coaches:', error));
    }
  }, [selectedTeamId]);

  // ✨ Laad team data van Firestore (seizoenId verwijderd!)
  const loadTeamData = async (teamId: string) => {
    try {
      const [team, spelers, wedstrijden] = await Promise.all([
        getTeam(teamId),
        getSpelers(teamId),
        getWedstrijden(teamId)
      ]);

      setSpelers(spelers);
      setWedstrijden(wedstrijden);
      setClubNaam(team?.clubNaam || '');
      setTeamNaam(team?.teamNaam || '');
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
    if (!kopieerModal.wedstrijd || !selectedTeamId) return;

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
  const verwijderWedstrijd = async (id: number) => {
    try {
      // 1. Verwijder lokaal uit state
      const updatedWedstrijden = wedstrijden.filter(w => w.id !== id);
      setWedstrijden(updatedWedstrijden);
      
      // 2. Verwijder uit Firebase
      if (selectedTeamId) {
        const wedstrijdId = `wedstrijd_${id}`;
        await deleteWedstrijd(selectedTeamId, wedstrijdId);
        console.log('✅ Wedstrijd verwijderd uit Firebase:', wedstrijdId);
      }
    } catch (error) {
      console.error('❌ Error deleting wedstrijd:', error);
      // Reload als het mislukt
      if (selectedTeamId) {
        await loadTeamData(selectedTeamId);
      }
    }
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

  // ✨ WISSEL HANDLERS
  const handleVoegWisselToe = (kwartIndex: number) => {
    const updated = {
      ...huidgeWedstrijd!,
      kwarten: huidgeWedstrijd!.kwarten.map((k, i) => {
        if (i === kwartIndex) {
          const newId = Math.max(...k.wissels.map(w => w.id), 0) + 1;
          return {
            ...k,
            wissels: [...k.wissels, { id: newId, positie: '', wisselSpelerId: '' }]
          };
        }
        return k;
      })
    };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const handleUpdateWissel = (kwartIndex: number, wisselIndex: number, veld: 'positie' | 'wisselSpelerId', waarde: string) => {
    const updated = {
      ...huidgeWedstrijd!,
      kwarten: huidgeWedstrijd!.kwarten.map((k, i) => {
        if (i === kwartIndex) {
          return {
            ...k,
            wissels: k.wissels.map((w, idx) => idx === wisselIndex ? { ...w, [veld]: waarde } : w)
          };
        }
        return k;
      })
    };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const handleVerwijderWissel = (kwartIndex: number, wisselIndex: number) => {
    const updated = {
      ...huidgeWedstrijd!,
      kwarten: huidgeWedstrijd!.kwarten.map((k, i) => {
        if (i === kwartIndex) {
          return {
            ...k,
            wissels: k.wissels.filter((_, idx) => idx !== wisselIndex)
          };
        }
        return k;
      })
    };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  // Maak nieuw team aan
  const handleCreateTeam = async (clubNaam: string, teamNaam: string) => {
    if (!currentCoach) return;
    
    try {
      console.log('🔵 Creating new team...');
      const newTeamId = await createTeam(currentCoach.uid, clubNaam, teamNaam);
      console.log('✅ Team created:', newTeamId);
      
      // Update current coach state
      const updatedCoach = {
        ...currentCoach,
        teamIds: [...currentCoach.teamIds, newTeamId]
      };
      setCurrentCoach(updatedCoach);
      
      // Reload teams (will be done automatically by EFFECT 2)
      // But manually add to avoid delay
      setTeams([...teams, { teamId: newTeamId, teamNaam }]);
      
      // Selecteer nieuwe team
      setSelectedTeamId(newTeamId);
      setClubNaam(clubNaam);
      setTeamNaam(teamNaam);
      setHuidigScherm('wedstrijden');
    } catch (error) {
      console.error('❌ Error creating team:', error);
      alert('Fout bij aanmaken team: ' + error);
    }
  };

  // ✅ NEW: Delete team handler (ook laatste team allowed!)
  const handleDeleteTeam = async (teamIdToDelete: string) => {
    if (!currentCoach) return;

    // Double confirmation
    const confirmed1 = confirm(
      `⚠️ Wil je "${clubNaam} - ${teamNaam}" echt verwijderen?\n\nDit kan NIET ongedaan gemaakt worden!`
    );

    if (!confirmed1) return;

    const confirmed2 = confirm(
      `🚨 LAATSTE WAARSCHUWING!\n\nAlle spelers, wedstrijden en statistieken worden verwijderd!\n\nBen je echt zeker?`
    );

    if (!confirmed2) return;

    try {
      console.log('🔵 Deleting team:', teamIdToDelete);
      await deleteTeam(currentCoach.uid, teamIdToDelete);
      
      // Update state
      const remainingTeamIds = currentCoach.teamIds.filter(id => id !== teamIdToDelete);
      setCurrentCoach({
        ...currentCoach,
        teamIds: remainingTeamIds
      });

      // Update teams list
      setTeams(teams.filter(t => t.teamId !== teamIdToDelete));

      // Als teams over zijn, selecteer volgende. Anders: terug naar team beheer scherm
      if (remainingTeamIds.length > 0) {
        // Nog teams over? Select eerste
        setSelectedTeamId(remainingTeamIds[0]);
        setHuidigScherm('wedstrijden');
        console.log('✅ Switched to team:', remainingTeamIds[0]);
      } else {
        // Geen teams meer? Terug naar team beheer
        setSelectedTeamId(null);
        setHuidigScherm('team');
        setClubNaam('');
        setTeamNaam('');
        setSpelers([]);
        setWedstrijden([]);
        console.log('✅ All teams deleted, back to team creation');
      }

      alert('✅ Team verwijderd');
      console.log('✅ Team deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting team:', error);
      alert('❌ Fout bij verwijderen team: ' + error);
    }
  };

// Verwijder speler
  const removeSpeler = async (id: number) => {
    try {
      const speler = spelers.find(s => s.id === id);
      
      // 1. Verwijder lokaal
      const updatedSpelers = spelers.filter(s => s.id !== id);
      setSpelers(updatedSpelers);
      
      // 2. Bij gast-speler: verwijder ook uit wedstrijden (afwezigeSpelers)
      if (speler?.type === 'gast') {
        const updatedWedstrijden = wedstrijden.map(w => ({
          ...w,
          afwezigeSpelers: (w.afwezigeSpelers || []).filter(sid => sid !== id)
        }));
        setWedstrijden(updatedWedstrijden);
      }
      
      // 3. Verwijder uit Firebase (JUISTE IMPORT NAAM!)
      if (selectedTeamId) {
        const spelerId = `speler_${id}`;
        await deleteSpeler(selectedTeamId, spelerId);  // ← deleteSpeler (de import!)
        console.log('✅ Speler verwijderd uit Firebase:', spelerId);
      }
    } catch (error) {
      console.error('❌ Error deleting speler:', error);
      // Reload op error
      if (selectedTeamId) {
        await loadTeamData(selectedTeamId);
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutCoach();
      setCurrentCoach(null);
      setSelectedTeamId(null);
      setTeams([]);
      setSpelers([]);
      setWedstrijden([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✨ Coach Beheer handlers (v3.1)
  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await revokeInvite(inviteId);
      // Reload pending invites
      if (selectedTeamId) {
        const updated = await getPendingInvitesByTeam(selectedTeamId);
        setPendingInvites(updated);
      }
    } catch (error: any) {
      console.error('❌ Error revoking invite:', error);
      alert('Fout bij intrekken invite: ' + error.message);
    }
  };

  const handleRemoveCoach = async (coachUid: string) => {
    try {
      if (!selectedTeamId || !currentCoach) return;
      
      await removeCoachFromTeam(selectedTeamId, coachUid, currentCoach.uid);
      
      // Reload team coaches
      const updated = await getTeamCoaches(selectedTeamId);
      setTeamCoaches(updated);
    } catch (error: any) {
      console.error('❌ Error removing coach:', error);
      alert('Fout bij verwijderen coach: ' + error.message);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      if (!currentCoach) return;
      
      const invite = await getInviteById(inviteId);
      if (!invite) throw new Error('Invite niet gevonden of verlopen');
      
      await acceptInvite(inviteId, currentCoach.uid, invite.teamId);
      
      // Add team to selected teams
      setSelectedTeamId(invite.teamId);
      setHuidigScherm('team');
      
      alert('✅ Je bent succesvol toegevoegd aan het team!');
    } catch (error: any) {
      console.error('❌ Error accepting invite:', error);
      alert('Fout bij accepteren invite: ' + error.message);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!currentCoach) {
    return <AuthScreen />;
  }

  // Main app with navigation
  return (
    <Navigation
      clubNaam={clubNaam}
      teamNaam={teamNaam}
      currentCoach={currentCoach}
      onLogout={handleLogout}
      onScreenChange={(screenId) => {
        setHuidigScherm(screenId);
        if (screenId === 'team') {
          setHuidgeWedstrijd(null);
        }
      }}
      activeScreen={huidigScherm}
      // ✨ PASS TEAMS AND TEAM SELECTOR
      teams={teams}
      selectedTeamId={selectedTeamId}
      onSelectTeam={(newTeamId) => {
        console.log('🔵 User selected team:', newTeamId);
        setSelectedTeamId(newTeamId);
      }}
    >
      {/* ✅ STAP 1: WEDSTRIJDEN SCHERM - FIXED PROPS */}
      {huidigScherm === 'accept-invite' && inviteIdFromUrl && (
        <AcceptInviteScreen
          inviteId={inviteIdFromUrl}
          onAccept={handleAcceptInvite}
        />
      )}

      {huidigScherm === 'wedstrijden' && (
        <WedstrijdOverzicht
          wedstrijden={wedstrijden}
          teamNaam={teamNaam}
          onNieuweWedstrijd={() => setFormatieModal(true)}
          onBekijk={(w) => {
            setHuidgeWedstrijd(w);
            setHuidigScherm('wedstrijd');
          }}
          onKopieer={kopieerWedstrijd}
          onVerwijder={verwijderWedstrijd}
        />
      )}

      {/* ✅ STAP 4: WEDSTRIJD OPSTELLING SCHERM - ADDED clubNaam & teamNaam */}
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
          onUpdateWedstrijdType={(type) => {
            const updated = { ...huidgeWedstrijd, type };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateWedstrijdNotities={(notities) => {
            const updated = { ...huidgeWedstrijd, notities };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateWedstrijdThemas={(themas) => {
            const updated = { ...huidgeWedstrijd, themas };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateWedstrijdFormatie={(formatie) => {
            const updated = { ...huidgeWedstrijd, formatie };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateWedstrijdAfgelast={(isAfgelast) => {
            const updated = { ...huidgeWedstrijd, isAfgelast };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onToggleAfwezig={(spelerId) => {
            const updated = {
              ...huidgeWedstrijd,
              afwezigeSpelers: huidgeWedstrijd.afwezigeSpelers.includes(spelerId)
                ? huidgeWedstrijd.afwezigeSpelers.filter(id => id !== spelerId)
                : [...huidgeWedstrijd.afwezigeSpelers, spelerId]
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateKwartOpstelling={(kwartIndex, opstelling) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, opstelling } : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onUpdateKwartWissels={(kwartIndex, wissels) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, wissels } : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onVoegWisselToe={handleVoegWisselToe}
          onUpdateWissel={handleUpdateWissel}
          onVerwijderWissel={handleVerwijderWissel}
          onUpdateKwartDoelpunten={(kwartIndex, doelpunten) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex ? { ...k, doelpunten } : k
              )
            };
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
          onVoegDoelpuntToe={(kwartIndex, doelpunt) => {
            const newId = Date.now() + Math.random();
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex 
                  ? { 
                      ...k, 
                      doelpunten: [...(k.doelpunten || []), { ...doelpunt, id: newId }] 
                    }
                  : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onVerwijderDoelpunt={(kwartIndex, doelpuntId) => {
            const updated = {
              ...huidgeWedstrijd,
              kwarten: huidgeWedstrijd.kwarten.map((k, i) =>
                i === kwartIndex
                  ? { ...k, doelpunten: (k.doelpunten || []).filter(d => d.id !== doelpuntId) }
                  : k
              )
            };
            setHuidgeWedstrijd(updated);
            setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
          }}
          onSluiten={() => setHuidigScherm('wedstrijden')}
        />
      )}

      {/* TEAM SCHERM */}
      {huidigScherm === 'team' && (
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
            onCreateTeam={handleCreateTeam}
            currentCoach={currentCoach}
            teamIds={currentCoach?.teamIds || []}
            teams={teams}
            onSelectTeam={(newTeamId) => {
              console.log('🔵 TeamBeheer: user selected team:', newTeamId);
              setSelectedTeamId(newTeamId);
            }}
            onDeleteTeam={handleDeleteTeam}
            pendingInvites={pendingInvites}
            teamCoaches={teamCoaches}
            onRevokeInvite={handleRevokeInvite}
            onRemoveCoach={handleRemoveCoach}
          />

          {/* Coaches Invitatie is in TeamBeheer component */}
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
                        formatie: key as '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8',
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
