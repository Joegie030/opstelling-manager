# 🏢 Multi-Tenant Team Isolation - COMPLETE IMPLEMENTATION GUIDE

**Status:** Ready for Implementation ✅
**Complexity:** Medium (1-2 hours)
**Benefit:** Teams completely isolated, scalable, secure

---

## 📋 DOCUMENT OVERVIEW

This guide provides everything needed to implement multi-tenant team isolation.

### Files Included:
1. `firestore.rules` - Firebase Security Rules (CRITICAL)
2. `TeamSelector.tsx` - React component for team selection
3. Implementation checklists with code snippets
4. Architecture diagrams and flows
5. Testing procedures

---

## 🎯 QUICK START (5 Minutes)

If you just want to know WHAT to do:

1. **Update Firebase Rules** (copy from `firestore.rules`)
2. **Update Coach interface** (add `teams[]` and `currentTeamId`)
3. **Update firebaseService.ts** (add 3 new functions)
4. **Update App.tsx** (add `selectedTeamId` state, update effects)
5. **Add TeamSelector component** (copy component code)
6. **Test** (follow testing checklist)

Done! Teams are now isolated. ✅

---

## 🔒 WHAT THIS SOLVES

**Problem:** Multiple teams share one database
- Team A coaches can see Team B data ❌
- No proper isolation ❌
- Hard to manage multiple teams ❌

**Solution:** Multi-tenant with complete isolation
- Each team's data is 100% separate ✅
- Firebase Rules enforce access control ✅
- Coaches can manage multiple teams ✅
- Scales to unlimited teams ✅

---

## 📐 ARCHITECTURE OVERVIEW

### Before
```
Database
├── 1 Team's Data
│   ├── Spelers
│   ├── Wedstrijden
│   └── No access control ❌
```

### After
```
Database
├── Team 1 (Coaches: [uid1])
│   ├── Spelers (Only uid1 can see)
│   ├── Wedstrijden (Only uid1 can see)
│   └── Security: Firebase Rules ✅
├── Team 2 (Coaches: [uid1, uid2])
│   ├── Spelers (Only uid1, uid2 can see)
│   ├── Wedstrijden (Only uid1, uid2 can see)
│   └── Security: Firebase Rules ✅
└── Team 3 (Coaches: [uid2])
    ├── Spelers (Only uid2 can see)
    ├── Wedstrijden (Only uid2 can see)
    └── Security: Firebase Rules ✅
```

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Firebase Security Rules (CRITICAL!)

**File:** Copy to Firebase Console → Firestore → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only owner can access own coach document
    match /coaches/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Only coaches in the team can access
    match /teams/{teamId} {
      allow read: if request.auth.uid in resource.data.coaches;
      allow write: if request.auth.uid in resource.data.coaches;
    }
    
    // Only inviter and invitee can see invites
    match /invites/{inviteId} {
      allow read: if request.auth.token.email == resource.data.email || 
                     request.auth.uid == resource.data.invitedBy;
      allow write: if request.auth != null;
    }
  }
}
```

**Test:** In Firebase Console, try to read team of another coach → should get "Permission Denied"

---

### STEP 2: Update Types (src/types/index.ts)

Add to Coach interface:
```typescript
export interface Coach {
  uid: string;
  email: string;
  naam: string;
  teamId: string;                    // Backward compat
  teams?: string[];                  // ⭐ NEW: All team IDs
  currentTeamId?: string;            // ⭐ NEW: Active team
  rol: 'admin' | 'coach' | 'viewer';
  createdAt: string;
}
```

Update Team.coaches to be array:
```typescript
export interface Team {
  teamId: string;
  clubNaam: string;
  teamNaam: string;
  coaches: string[];                 // ⭐ CHANGED from string to array
  spelers?: any[];
  wedstrijden?: any[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;               // ⭐ NEW
}
```

---

### STEP 3: Firebase Service Updates

**File:** src/firebase/firebaseService.ts

**3.1 Add imports:**
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
```

**3.2 Update getCurrentCoach():**
```typescript
export const getCurrentCoach = (callback: (coach: Coach | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const coachDoc = await getDoc(doc(db, 'coaches', user.uid));
        if (coachDoc.exists()) {
          const coach = coachDoc.data() as Coach;
          
          // ⭐ Load all teams for this coach
          const teams = await getCoachTeams(user.uid);
          
          callback({
            ...coach,
            teams: teams.map(t => t.teamId),
            currentTeamId: coach.currentTeamId || coach.teamId
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};
```

**3.3 Add new functions:**
```typescript
// Create new team
export const createNewTeam = async (
  adminUid: string,
  clubNaam: string,
  teamNaam: string
): Promise<string> => {
  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
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

  await setDoc(doc(db, 'teams', teamId), newTeam);

  // Add to coach's teams
  const coachRef = doc(db, 'coaches', adminUid);
  const coachDoc = await getDoc(coachRef);
  
  if (coachDoc.exists()) {
    const coach = coachDoc.data() as Coach;
    const teams = coach.teams || [coach.teamId];
    
    await updateDoc(coachRef, {
      teams: [...new Set([...teams, teamId])],
      currentTeamId: teamId
    });
  }

  return teamId;
};

// Get all teams for a coach
export const getCoachTeams = async (coachUid: string): Promise<Team[]> => {
  const q = query(
    collection(db, 'teams'),
    where('coaches', 'array-contains', coachUid)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Team);
};

// Switch to different team
export const switchTeam = async (coachUid: string, newTeamId: string): Promise<void> => {
  const team = await getTeam(newTeamId);
  
  if (!team?.coaches.includes(coachUid)) {
    throw new Error('You are not a member of this team');
  }

  await updateDoc(doc(db, 'coaches', coachUid), {
    currentTeamId: newTeamId,
    teamId: newTeamId
  });
};
```

**3.4 Update save functions (add coachUid parameter and security check):**

```typescript
export const saveSpelers = async (
  teamId: string,
  coachUid: string,
  spelers: any[]
): Promise<void> => {
  const team = await getTeam(teamId);
  
  if (!team?.coaches.includes(coachUid)) {
    throw new Error('Permission denied');
  }

  await updateDoc(doc(db, 'teams', teamId), {
    spelers: spelers,
    updatedAt: new Date().toISOString()
  });
};

// (Same pattern for saveWedstrijden, saveTeamInfo, getTeamData)
```

---

### STEP 4: App.tsx Updates

**4.1 Add state:**
```typescript
const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
const [coachTeams, setCoachTeams] = useState<Team[]>([]);
```

**4.2 Update auth effect:**
```typescript
useEffect(() => {
  const unsubscribe = getCurrentCoach(async (coach) => {
    setCurrentCoach(coach);
    setAuthLoading(false);

    if (coach) {
      // ⭐ Load all teams
      const teams = await getCoachTeams(coach.uid);
      setCoachTeams(teams);
      
      const activeTeamId = coach.currentTeamId || coach.teamId || teams[0]?.teamId;
      if (activeTeamId) {
        setSelectedTeamId(activeTeamId);
        await loadTeamData(activeTeamId, coach.uid);
      }
    }
  });

  return () => unsubscribe();
}, []);
```

**4.3 Update auto-save effects (example):**
```typescript
// FROM:
useEffect(() => {
  if (currentCoach && spelers.length > 0) {
    const saveTimeout = setTimeout(() => {
      saveSpelers(currentCoach.teamId, spelers).catch(console.error);
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }
}, [spelers, currentCoach]);

// TO:
useEffect(() => {
  if (currentCoach && selectedTeamId && spelers.length > 0) {
    const saveTimeout = setTimeout(() => {
      saveSpelers(selectedTeamId, currentCoach.uid, spelers).catch(console.error);
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }
}, [spelers, currentCoach, selectedTeamId]);
```

**4.4 Add handlers:**
```typescript
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
  if (!currentCoach) return;
  
  try {
    const teams = await getCoachTeams(currentCoach.uid);
    setCoachTeams(teams);
  } catch (error) {
    console.error('Error refreshing teams:', error);
  }
};
```

---

### STEP 5: Add TeamSelector Component

Create: `src/components/TeamSelector.tsx`

[Component code provided separately - it's ~300 lines]

Usage in App:
```tsx
<TeamSelector
  currentCoach={currentCoach}
  teams={coachTeams}
  selectedTeamId={selectedTeamId}
  onTeamChange={handleTeamSwitch}
  onNewTeam={handleNewTeam}
/>
```

---

## ✅ TESTING CHECKLIST

### Test 1: Teams Are Separate
- [ ] Create Team A with Admin
- [ ] Add spelers to Team A
- [ ] Switch to Team B
- [ ] Verify Team B is EMPTY
- [ ] Switch back to Team A
- [ ] Verify spelers are still there

### Test 2: Admin Can Create Teams
- [ ] Login as admin (rol: 'admin')
- [ ] See "Nieuw Team" button
- [ ] Click and create team
- [ ] Verify it appears in selector

### Test 3: Non-Admin Can't Create
- [ ] Login as coach (rol: 'coach')
- [ ] DON'T see "Nieuw Team" button
- [ ] Can only see assigned teams

### Test 4: Firebase Rules Block Access
- [ ] Open browser console
- [ ] Try query team of other coach
- [ ] Should get "Permission denied" error ❌

### Test 5: Data Syncs Correctly
- [ ] Add wedstrijd to Team A
- [ ] Switch to Team B
- [ ] Switch back to Team A
- [ ] Wedstrijd still there ✅

---

## 🔒 Security Verification

Run these tests to verify security:

```javascript
// In Firebase Console Shell:

// Test 1: Try to read other coach's team
db.collection('teams').doc('other_team_id').get()
// Result: "Permission denied" ❌ GOOD!

// Test 2: Try to write to other coach's team
db.collection('teams').doc('other_team_id').update({spelers: []})
// Result: "Permission denied" ❌ GOOD!

// Test 3: Valid coach can read own team
db.collection('teams').doc('own_team_id').get()
// Result: {teamId, spelers, wedstrijden, ...} ✅ GOOD!
```

---

## 🚨 COMMON MISTAKES

### ❌ Mistake 1: Firebase Rules Not Updated
**Symptom:** Teams still see each other's data
**Solution:** Make sure rules are PUBLISHED in Console

### ❌ Mistake 2: Forgot coachUid in save calls
**Symptom:** Security errors on save
**Solution:** Update all saveSpelers/saveWedstrijden calls with coachUid

### ❌ Mistake 3: selectedTeamId not set
**Symptom:** Data doesn't load on switch
**Solution:** Verify selectedTeamId updates in handleTeamSwitch

### ❌ Mistake 4: Mixed up Coach.teamId vs currentTeamId
**Symptom:** Wrong team loads
**Solution:** Use currentTeamId for UI, teamId for backward compat

---

## 📊 WHAT CHANGES IN YOUR APP

| Component | Before | After |
|-----------|--------|-------|
| WedstrijdOverzicht | Uses teamId | Uses selectedTeamId |
| TeamBeheer | Uses teamId | Uses selectedTeamId |
| Statistieken | Uses teamId | Uses selectedTeamId |
| All saves | Pass teamId | Pass selectedTeamId + coachUid |
| Navigation | No team selector | Has team selector |
| Login flow | Load 1 team | Load all teams |

---

## 🎯 SUCCESS CRITERIA

You're done when:
- ✅ Firebase rules are published
- ✅ Can create multiple teams
- ✅ Can switch between teams
- ✅ Each team has isolated data
- ✅ Other coaches can't see your team data
- ✅ All tests pass

---

## 💡 NEXT FEATURES (Later)

Once teams are working:
- [ ] Invite coaches by email
- [ ] Coach permissions per team
- [ ] Team settings (logo, colors, etc)
- [ ] Cross-team statistics
- [ ] Team dashboard
- [ ] Export per team

---

## 🆘 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Permission denied" on save | Check Firebase rules + coachUid |
| Team data not loading | Check selectedTeamId is set |
| Can't create team | Check currentCoach.rol == 'admin' |
| See other team's data | Check Firebase rules are published |
| selectedTeamId undefined | Check auth useEffect runs |

---

## 📞 RESOURCES

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-overview)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Array Queries](https://firebase.google.com/docs/firestore/query-data/queries)

---

## ⏱️ TIME ESTIMATE

- Firebase Rules: 5 min
- Type updates: 2 min
- Firebase Service: 10 min
- App.tsx updates: 5 min
- TeamSelector component: 3 min
- Testing: 10 min
- **Total: ~35 minutes**

---

## ✨ RESULT

✅ Multi-tenant architecture implemented
✅ Complete data isolation per team
✅ Firebase rules enforce security
✅ Coaches can manage multiple teams
✅ Scales to unlimited teams
✅ Professional, production-ready

---

**Ready to implement?** Start with STEP 1! 🚀
