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
// AUTHENTICATION FUNCTIES
// ============================================

export interface Coach {
  uid: string;
  email: string;
  naam: string;
  teamId: string;
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
  coaches: string[]; // UIDs van coaches
  spelers?: any[];
  wedstrijden?: any[];
}

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
      coaches: [user.uid],
      spelers: [],
      wedstrijden: []
    };

    await setDoc(doc(db, 'teams', teamId), team);

    // Maak coach profiel
    const coach: Coach = {
      uid: user.uid,
      email,
      naam,
      teamId,
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

// Haal huidige user op
export const getCurrentCoach = (callback: (coach: Coach | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const coachDoc = await getDoc(doc(db, 'coaches', user.uid));
      if (coachDoc.exists()) {
        callback(coachDoc.data() as Coach);
      } else {
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

// Get all teams for a coach
export const getCoachTeams = async (coachUid: string): Promise<Team[]> => {
  try {
    const q = query(
      collection(db, 'teams'),
      where('coaches', 'array-contains', coachUid)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Team);
  } catch (error) {
    console.error('Error getting coach teams:', error);
    return [];
  }
};

// Switch to different team
export const switchTeam = async (coachUid: string, newTeamId: string): Promise<void> => {
  try {
    // Verify coach has access to this team
    const team = await getTeam(newTeamId);
    if (!team || !team.coaches.includes(coachUid)) {
      throw new Error('Access denied to this team');
    }
    
    // Update coach's current team
    await updateDoc(doc(db, 'coaches', coachUid), {
      teamId: newTeamId
    });
  } catch (error) {
    console.error('Error switching team:', error);
    throw error;
  }
};

// ============================================
// COACH UITNODIGING FUNCTIES
// ============================================

export interface CoachInvite {
  inviteId: string;
  teamId: string;
  email: string;
  invitedBy: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

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
// DATA SYNC FUNCTIES (Spelers, Wedstrijden)
// ============================================

// Save spelers naar Firestore
export const saveSpelers = async (teamId: string, spelers: any[]): Promise<void> => {
  try {
    const cleanedSpelers = spelers.map(s => ({
      ...s,
      type: s.type || 'vast'
    }));
    
    await updateDoc(doc(db, 'teams', teamId), {
      spelers: cleanedSpelers
    });
  } catch (error) {
    console.error('Error saving spelers:', error);
    throw error;
  }
};

// Save wedstrijden naar Firestore
export const saveWedstrijden = async (teamId: string, wedstrijden: any[]): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId), {
      wedstrijden: wedstrijden
    });
  } catch (error) {
    console.error('Error saving wedstrijden:', error);
    throw error;
  }
};

// Save club en team naam
export const saveTeamInfo = async (teamId: string, clubNaam: string, teamNaam: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId), {
      clubNaam: clubNaam,
      teamNaam: teamNaam
    });
  } catch (error) {
    console.error('Error saving team info:', error);
    throw error;
  }
};

// Get team data - FIXED: accepts optional coachUid parameter to match App.tsx signature
export const getTeamData = async (teamId: string, coachUid?: string) => {
  try {
    const team = await getTeam(teamId);
    
    if (!team) {
      return {
        spelers: [],
        wedstrijden: [],
        clubNaam: 'Mijn Club',
        teamNaam: 'Team A'
      };
    }
    
    const spelers = (team.spelers || []).map((s: any) => ({
      ...s,
      type: s.type || 'vast'
    }));
    
    return {
      spelers,
      wedstrijden: team.wedstrijden || [],
      clubNaam: team.clubNaam || 'Mijn Club',
      teamNaam: team.teamNaam || 'Team A'
    };
  } catch (error) {
    console.error('Error getting team data:', error);
    return {
      spelers: [],
      wedstrijden: [],
      clubNaam: 'Mijn Club',
      teamNaam: 'Team A'
    };
  }
};

// ============================================
// CREATE NEW TEAM
// ============================================

export const createNewTeam = async (coachUid: string, clubNaam: string, teamNaam: string): Promise<string> => {
  try {
    const teamId = `team_${Date.now()}`;
    const team: Team = {
      teamId,
      clubNaam,
      teamNaam,
      formatie: '8x8',
      createdBy: coachUid,
      createdAt: new Date().toISOString(),
      coaches: [coachUid],
      spelers: [],
      wedstrijden: []
    };

    await setDoc(doc(db, 'teams', teamId), team);
    
    // Update coach om naar dit nieuwe team te wijzen
    await updateDoc(doc(db, 'coaches', coachUid), {
      teamId: teamId
    });
    
    return teamId;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};
