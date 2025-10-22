import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDOsTcZJr-8zfHd09adRKIw0GSe4YWj3zg",
  authDomain: "opstelling-manager.firebaseapp.com",
  projectId: "opstelling-manager",
  storageBucket: "opstelling-manager.firebasestorage.app",
  messagingSenderId: "891892185139",
  appId: "1:891892185139:web:ef03940adaa260df620b46",
  measurementId: "G-5PRWDN6BRG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Zet persistence zodat user ingelogd blijft
setPersistence(auth, browserLocalPersistence);

// ============================================
// INTERFACES
// ============================================

export interface Coach {
  uid: string;
  email: string;
  naam: string;
  teamId: string;                    // Backward compat
  teams?: string[];                  // STAP 3: Alle team IDs
  currentTeamId?: string;            // STAP 3: Actieve team
  rol: 'admin' | 'coach' | 'viewer';
  createdAt: string;
}

export interface Team {
  teamId: string;
  clubNaam: string;
  teamNaam: string;
  formatie: string;
  createdBy: string;
  createdAt: string;
  coaches: string[];                 // Array van coach UIDs
  spelers?: any[];
  wedstrijden?: any[];
  updatedAt?: string;
}

export interface CoachInvite {
  inviteId: string;
  teamId: string;
  email: string;
  invitedBy: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// ============================================
// AUTHENTICATION FUNCTIES
// ============================================

// Register nieuwe coach
export const registerCoach = async (email: string, password: string, naam: string): Promise<Coach> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Maak nieuw team aan
    const teamId = `team_${Date.now()}`;
    const team: Team = {
      teamId,
      clubNaam: 'Mijn Club',
      teamNaam: 'Team A',
      formatie: '8x8',
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      coaches: [user.uid]
    };

    await setDoc(doc(db, 'teams', teamId), team);

    // Maak coach profiel
    const coach: Coach = {
      uid: user.uid,
      email,
      naam,
      teamId,
      teams: [teamId],                // STAP 3: Start met 1 team
      currentTeamId: teamId,          // STAP 3: Set als actief
      rol: 'admin',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'coaches', user.uid), coach);

    return coach;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Login coach
export const loginCoach = async (email: string, password: string): Promise<Coach> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Haal coach data op
    const coachDoc = await getDoc(doc(db, 'coaches', user.uid));
    if (!coachDoc.exists()) {
      throw new Error('Coach profiel niet gevonden');
    }

    return coachDoc.data() as Coach;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Logout
export const logoutCoach = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Haal huidige user op - UPDATED STAP 3
export const getCurrentCoach = (callback: (coach: Coach | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const coachDoc = await getDoc(doc(db, 'coaches', user.uid));
        if (coachDoc.exists()) {
          const coach = coachDoc.data() as Coach;
          
          // STAP 3: Laad alle teams voor deze coach
          const teams = await getCoachTeams(user.uid);
          
          // Zet teams array en currentTeamId
          const updatedCoach: Coach = {
            ...coach,
            teams: teams.map(t => t.teamId),
            currentTeamId: coach.currentTeamId || coach.teamId
          };
          
          callback(updatedCoach);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error in getCurrentCoach:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// ============================================
// TEAM FUNCTIES
// ============================================

// Haal team op
export const getTeam = async (teamId: string): Promise<Team | null> => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (teamDoc.exists()) {
      return teamDoc.data() as Team;
    }
    return null;
  } catch (error) {
    console.error('Error getting team:', error);
    return null;
  }
};

// Update team info
export const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId), updates);
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

// STAP 3 NIEUW: CREATE NEW TEAM
export const createNewTeam = async (
  adminUid: string,
  clubNaam: string,
  teamNaam: string
): Promise<string> => {
  try {
    // Maak unieke team ID
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Nieuw team object
    const newTeam: Team = {
      teamId,
      clubNaam,
      teamNaam,
      formatie: '8x8',
      createdBy: adminUid,
      createdAt: new Date().toISOString(),
      coaches: [adminUid],
      spelers: [],
      wedstrijden: []
    };

    // Save team naar Firestore
    await setDoc(doc(db, 'teams', teamId), newTeam);

    // Update coach met nieuw team
    const coachRef = doc(db, 'coaches', adminUid);
    const coachDoc = await getDoc(coachRef);
    
    if (coachDoc.exists()) {
      const coach = coachDoc.data() as Coach;
      const teams = coach.teams || [coach.teamId];
      
      // Voeg nieuw team toe aan teams array
      await updateDoc(coachRef, {
        teams: [...new Set([...teams, teamId])],
        currentTeamId: teamId
      });
    }

    console.log('✅ Team aangemaakt:', teamId);
    return teamId;
  } catch (error: any) {
    console.error('Error creating team:', error);
    throw new Error(error.message);
  }
};

// STAP 3 NIEUW: GET COACH TEAMS
export const getCoachTeams = async (coachUid: string): Promise<Team[]> => {
  try {
    // Query: teams waar coach in de coaches array staat
    const q = query(
      collection(db, 'teams'),
      where('coaches', 'array-contains', coachUid)
    );
    
    const querySnapshot = await getDocs(q);
    const teams = querySnapshot.docs.map(doc => doc.data() as Team);
    
    console.log('✅ Teams opgehaald:', teams.length);
    return teams;
  } catch (error: any) {
    console.error('Error getting coach teams:', error);
    return [];
  }
};

// STAP 3 NIEUW: SWITCH TEAM
export const switchTeam = async (coachUid: string, newTeamId: string): Promise<void> => {
  try {
    // Check: is coach lid van dit team?
    const team = await getTeam(newTeamId);
    
    if (!team) {
      throw new Error('Team niet gevonden');
    }
    
    if (!team.coaches.includes(coachUid)) {
      throw new Error('Je bent niet lid van dit team');
    }

    // Update coach met nieuw actieve team
    await updateDoc(doc(db, 'coaches', coachUid), {
      currentTeamId: newTeamId,
      teamId: newTeamId
    });

    console.log('✅ Team gewisseld naar:', newTeamId);
  } catch (error: any) {
    console.error('Error switching team:', error);
    throw new Error(error.message);
  }
};

// ============================================
// COACH UITNODIGING FUNCTIES
// ============================================

// Nodig coach uit
export const inviteCoach = async (teamId: string, email: string, invitedByUid: string): Promise<string> => {
  try {
    const inviteId = `invite_${Date.now()}`;
    const invite: CoachInvite = {
      inviteId,
      teamId,
      email,
      invitedBy: invitedByUid,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await setDoc(doc(db, 'invites', inviteId), invite);
    return inviteId;
  } catch (error) {
    console.error('Error inviting coach:', error);
    throw error;
  }
};

// Haal pending invites op
export const getPendingInvites = async (email: string): Promise<CoachInvite[]> => {
  try {
    const q = query(
      collection(db, 'invites'),
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CoachInvite);
  } catch (error) {
    console.error('Error getting invites:', error);
    return [];
  }
};

// Accept invite
export const acceptInvite = async (inviteId: string, userUid: string, teamId: string): Promise<void> => {
  try {
    // Update invite status
    await updateDoc(doc(db, 'invites', inviteId), {
      status: 'accepted'
    });

    // Add user to team coaches
    const team = await getTeam(teamId);
    if (team) {
      await updateTeam(teamId, {
        coaches: [...team.coaches, userUid]
      });
    }
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
};

// ============================================
// DATA SYNC FUNCTIES - UPDATED STAP 3
// ============================================

// Save spelers - UPDATED: voeg coachUid toe voor security
export const saveSpelers = async (
  teamId: string,
  coachUid: string,
  spelers: any[]
): Promise<void> => {
  try {
    // Security check: is coach lid van dit team?
    const team = await getTeam(teamId);
    
    if (!team?.coaches.includes(coachUid)) {
      throw new Error('Permission denied: je bent niet lid van dit team');
    }

    await updateDoc(doc(db, 'teams', teamId), {
      spelers: spelers,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Spelers opgeslagen');
  } catch (error: any) {
    console.error('Error saving spelers:', error);
    throw error;
  }
};

// Save wedstrijden - UPDATED: voeg coachUid toe voor security
export const saveWedstrijden = async (
  teamId: string,
  coachUid: string,
  wedstrijden: any[]
): Promise<void> => {
  try {
    // Security check: is coach lid van dit team?
    const team = await getTeam(teamId);
    
    if (!team?.coaches.includes(coachUid)) {
      throw new Error('Permission denied: je bent niet lid van dit team');
    }

    await updateDoc(doc(db, 'teams', teamId), {
      wedstrijden: wedstrijden,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Wedstrijden opgeslagen');
  } catch (error: any) {
    console.error('Error saving wedstrijden:', error);
    throw error;
  }
};

// Save club en team naam - UPDATED: voeg coachUid toe voor security
export const saveTeamInfo = async (
  teamId: string,
  coachUid: string,
  clubNaam: string,
  teamNaam: string
): Promise<void> => {
  try {
    // Security check: is coach lid van dit team?
    const team = await getTeam(teamId);
    
    if (!team?.coaches.includes(coachUid)) {
      throw new Error('Permission denied: je bent niet lid van dit team');
    }

    await updateDoc(doc(db, 'teams', teamId), {
      clubNaam: clubNaam,
      teamNaam: teamNaam,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Team info opgeslagen:', clubNaam, teamNaam);
  } catch (error: any) {
    console.error('Error saving team info:', error);
    throw error;
  }
};

// Get team data - UPDATED: voeg coachUid toe voor security
export const getTeamData = async (teamId: string, coachUid: string) => {
  try {
    // Security check: is coach lid van dit team?
    const team = await getTeam(teamId);
    
    if (!team?.coaches.includes(coachUid)) {
      throw new Error('Permission denied: je bent niet lid van dit team');
    }

    return {
      spelers: team.spelers || [],
      wedstrijden: team.wedstrijden || [],
      clubNaam: team.clubNaam || 'Mijn Club',
      teamNaam: team.teamNaam || 'Team A'
    };
  } catch (error: any) {
    console.error('Error getting team data:', error);
    return {
      spelers: [],
      wedstrijden: [],
      clubNaam: 'Mijn Club',
      teamNaam: 'Team A'
    };
  }
};
