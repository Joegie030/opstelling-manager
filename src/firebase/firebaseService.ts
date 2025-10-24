import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
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
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
  QueryConstraint,
  orderBy
} from 'firebase/firestore';
import { Speler, Wedstrijd } from '../types';

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
// TYPES & INTERFACES
// ============================================

export interface Coach {
  uid: string;
  email: string;
  naam: string;
  teamIds: string[];  // MULTI-TEAM SUPPORT
  rol: 'admin' | 'coach' | 'viewer';
  createdAt: string;
}

export interface Team {
  teamId: string;
  clubNaam: string;
  teamNaam: string;
  coaches: string[];
  createdAt: string;
  updatedAt: string;
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

export const registerCoach = async (email: string, password: string, naam: string): Promise<Coach> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Maak nieuw team aan
    const teamId = `team_${Date.now()}`;
    const now = new Date().toISOString();
    
    const team: Team = {
      teamId,
      clubNaam: 'Mijn Club',
      teamNaam: 'Team A',
      coaches: [user.uid],
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(db, 'teams', teamId), team);

    // Maak coach profiel met multi-team support
    const coach: Coach = {
      uid: user.uid,
      email,
      naam,
      teamIds: [teamId],  // ARRAY voor meerdere teams
      rol: 'admin',
      createdAt: now
    };

    await setDoc(doc(db, 'coaches', user.uid), coach);

    return coach;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginCoach = async (email: string, password: string): Promise<Coach> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let coachDoc = await getDoc(doc(db, 'coaches', user.uid));
    
    // Als coach document niet bestaat, maak het aan (backward compatibility)
    if (!coachDoc.exists()) {
      const coach: Coach = {
        uid: user.uid,
        email,
        naam: email.split('@')[0], // Default naam
        teamIds: [],
        rol: 'admin',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'coaches', user.uid), coach);
      return coach;
    }

    return coachDoc.data() as Coach;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutCoach = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

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

export const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const updateTeamInfo = async (teamId: string, clubNaam: string, teamNaam: string): Promise<void> => {
  try {
    await updateTeam(teamId, { clubNaam, teamNaam });
    console.log('✅ Team info opgeslagen:', clubNaam, teamNaam);
  } catch (error) {
    console.error('Error updating team info:', error);
    throw error;
  }
};

// ============================================
// SPELER FUNCTIES
// ============================================

export const addSpeler = async (teamId: string, speler: Speler): Promise<string> => {
  try {
    const spelerId = `speler_${speler.id}`;
    const docRef = doc(db, 'teams', teamId, 'spelers', spelerId);
    
    await setDoc(docRef, {
      ...speler,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return spelerId;
  } catch (error) {
    console.error('Error adding speler:', error);
    throw error;
  }
};

export const updateSpeler = async (teamId: string, spelerId: string, updates: Partial<Speler>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'spelers', spelerId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating speler:', error);
    throw error;
  }
};

export const deleteSpeler = async (teamId: string, spelerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'spelers', spelerId));
  } catch (error) {
    console.error('Error deleting speler:', error);
    throw error;
  }
};

export const getSpelers = async (teamId: string): Promise<Speler[]> => {
  try {
    const q = query(collection(db, 'teams', teamId, 'spelers'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Speler);
  } catch (error) {
    console.error('Error getting spelers:', error);
    return [];
  }
};

export const onSpelersChange = (teamId: string, callback: (spelers: Speler[]) => void): Unsubscribe => {
  const q = query(collection(db, 'teams', teamId, 'spelers'));
  return onSnapshot(q, (querySnapshot) => {
    const spelers = querySnapshot.docs.map(doc => doc.data() as Speler);
    callback(spelers);
  });
};

export const saveSpelersInBatch = async (teamId: string, spelers: Speler[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    spelers.forEach(speler => {
      const spelerId = `speler_${speler.id}`;
      const docRef = doc(db, 'teams', teamId, 'spelers', spelerId);
      batch.set(docRef, {
        ...speler,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    
    await batch.commit();
    console.log('✅ Batch saved:', spelers.length, 'spelers');
  } catch (error) {
    console.error('Error saving spelers in batch:', error);
    throw error;
  }
};

// ============================================
// WEDSTRIJD FUNCTIES (DIRECT ONDER TEAM!)
// ============================================

export const addWedstrijd = async (teamId: string, wedstrijd: Wedstrijd): Promise<string> => {
  try {
    const wedstrijdId = `wedstrijd_${wedstrijd.id}`;
    const docRef = doc(db, 'teams', teamId, 'wedstrijden', wedstrijdId);
    
    await setDoc(docRef, {
      ...wedstrijd,
      isAfgelast: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return wedstrijdId;
  } catch (error) {
    console.error('Error adding wedstrijd:', error);
    throw error;
  }
};

export const updateWedstrijd = async (teamId: string, wedstrijdId: string, updates: Partial<Wedstrijd>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'wedstrijden', wedstrijdId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating wedstrijd:', error);
    throw error;
  }
};

export const deleteWedstrijd = async (teamId: string, wedstrijdId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'teams', teamId, 'wedstrijden', wedstrijdId));
    await batch.commit();
  } catch (error) {
    console.error('Error deleting wedstrijd:', error);
    throw error;
  }
};

export const getWedstrijden = async (
  teamId: string,
  type?: 'competitie' | 'oefenwedstrijd',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<Wedstrijd[]> => {
  try {
    let constraints: QueryConstraint[] = [
      orderBy('datum', sortOrder === 'asc' ? 'asc' : 'desc')
    ];
    
    if (type) {
      constraints.push(where('type', '==', type));
    }
    
    const q = query(
      collection(db, 'teams', teamId, 'wedstrijden'),
      ...constraints
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Wedstrijd);
  } catch (error) {
    console.error('Error getting wedstrijden:', error);
    return [];
  }
};

export const onWedstrijdenChange = (teamId: string, callback: (wedstrijden: Wedstrijd[]) => void): Unsubscribe => {
  const q = query(
    collection(db, 'teams', teamId, 'wedstrijden'),
    orderBy('datum', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const wedstrijden = querySnapshot.docs.map(doc => doc.data() as Wedstrijd);
    callback(wedstrijden);
  });
};

export const saveWedstrijdenInBatch = async (teamId: string, wedstrijden: Wedstrijd[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    wedstrijden.forEach(wedstrijd => {
      const wedstrijdId = `wedstrijd_${wedstrijd.id}`;
      const docRef = doc(db, 'teams', teamId, 'wedstrijden', wedstrijdId);
      batch.set(docRef, {
        ...wedstrijd,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    
    await batch.commit();
    console.log('✅ Batch saved:', wedstrijden.length, 'wedstrijden');
  } catch (error) {
    console.error('Error saving wedstrijden in batch:', error);
    throw error;
  }
};

// ============================================
// KWARTEN FUNCTIES (DIRECT ONDER WEDSTRIJD!)
// ============================================

export const updateKwart = async (teamId: string, wedstrijdId: string, kwartNum: number, updates: any): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'wedstrijden', wedstrijdId, 'kwarten', kwartNum.toString()), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating kwart:', error);
    throw error;
  }
};

// ============================================
// STATISTIEKEN FUNCTIES (DIRECT ONDER TEAM!)
// ============================================

export const updateStatistieken = async (teamId: string, statistieken: any): Promise<void> => {
  try {
    await updateDoc(doc(db, 'statistieken', teamId), {
      ...statistieken,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating statistieken:', error);
    throw error;
  }
};

export const getStatistieken = async (teamId: string): Promise<any> => {
  try {
    const docSnap = await getDoc(doc(db, 'statistieken', teamId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting statistieken:', error);
    return null;
  }
};

// ============================================
// COACH UITNODIGING FUNCTIES
// ============================================

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

export const acceptInvite = async (inviteId: string, userUid: string, teamId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'invites', inviteId), {
      status: 'accepted'
    });

    const team = await getTeam(teamId);
    if (team) {
      await updateTeam(teamId, {
        coaches: [...team.coaches, userUid]
      });
    }

    // Add teamId to coach's teamIds array
    const coachDoc = await getDoc(doc(db, 'coaches', userUid));
    if (coachDoc.exists()) {
      const coach = coachDoc.data() as Coach;
      if (!coach.teamIds.includes(teamId)) {
        await updateDoc(doc(db, 'coaches', userUid), {
          teamIds: [...coach.teamIds, teamId]
        });
      }
    }
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
};

// ============================================
// LEGACY COMPATIBILITY
// ============================================

export const getTeamData = async (teamId: string) => {
  try {
    const team = await getTeam(teamId);
    const spelers = await getSpelers(teamId);
    const wedstrijden = await getWedstrijden(teamId);
    
    return {
      spelers,
      wedstrijden,
      clubNaam: team?.clubNaam || 'Mijn Club',
      teamNaam: team?.teamNaam || 'Team A'
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

export const saveSpelers = async (teamId: string, spelers: any[]): Promise<void> => {
  return saveSpelersInBatch(teamId, spelers);
};

export const saveWedstrijden = async (teamId: string, wedstrijden: any[]): Promise<void> => {
  return saveWedstrijdenInBatch(teamId, wedstrijden);
};

export const saveTeamInfo = async (teamId: string, clubNaam: string, teamNaam: string): Promise<void> => {
  return updateTeamInfo(teamId, clubNaam, teamNaam);
};
