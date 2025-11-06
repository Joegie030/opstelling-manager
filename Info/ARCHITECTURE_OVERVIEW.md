# 🏗️ JOEGIE - ARCHITECTURE OVERVIEW

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     UI LAYER (Components)                    │
├─────────────────────────────────────────────────────────────┤
│  App.tsx          TeamBeheer.tsx    WedstrijdOpstelling.tsx  │
│  ├─ Router         ├─ Team names     ├─ Formatie visual     │
│  ├─ State mgmt     ├─ Player list    ├─ Wissels            │
│  └─ Screen flow    └─ Add/Remove     ├─ Doelpunten         │
│                                      └─ Regelchecks (todo)   │
│  WedstrijdOverzicht.tsx   Statistieken.tsx   Instellingen.tsx│
│  ├─ Match list            ├─ Team stats       ├─ App config  │
│  ├─ Filter/Sort           ├─ Topscorers       ├─ Export      │
│  └─ Match selection        ├─ Position stats   └─ Import      │
│                            ├─ Theme analysis                   │
│                            └─ Trends                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               UTILITY LAYER (Helpers/Utils)                  │
├─────────────────────────────────────────────────────────────┤
│  calculations.ts       formatters.ts        teamData.ts      │
│  ├─ berekenStats       ├─ getFormatieNaam   ├─ laadTeamInfo  │
│  ├─ berekenTopscorers  ├─ formatMinuten     └─ findTeamById  │
│  ├─ berekenKeeperX     ├─ getThuisUitBadge                   │
│  └─ berekenSpeelmin    └─ getMedalEmoji                      │
│                                                               │
│  types/index.ts - Data Models (interfaces)                   │
│  ├─ Speler, Wedstrijd, Kwart, Wissel, Doelpunt             │
│  ├─ Coach, Team, TeamInfo                                    │
│  └─ Constants: formaties, WEDSTRIJD_THEMAS, etc             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           DATABASE LAYER (firebaseService.ts)                │
├─────────────────────────────────────────────────────────────┤
│  Authentication        Teams              Players            │
│  ├─ registerCoach      ├─ getTeam         ├─ getSpelers      │
│  ├─ loginCoach         ├─ createTeam      ├─ addSpeler       │
│  ├─ logoutCoach        ├─ updateTeamInfo  ├─ updateSpeler    │
│  └─ getCurrentCoach    ├─ deleteTeam      ├─ deleteSpeler    │
│                        └─ updateTeam      └─ saveSpelers     │
│                                                               │
│  Matches              Quarters           Coach Invites       │
│  ├─ getWedstrijden    ├─ updateKwart     ├─ inviteCoach     │
│  ├─ addWedstrijd      └─ (via wedstrijd)  ├─ acceptInvite    │
│  ├─ updateWedstrijd                       └─ getPendingXxxx  │
│  ├─ deleteWedstrijd                                          │
│  └─ saveWedstrijden                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE LAYER (Cloud Services)                 │
├─────────────────────────────────────────────────────────────┤
│  Authentication        Firestore Database    Cloud Storage   │
│  ├─ Email/Password     ├─ /teams/{teamId}    ├─ (optional)   │
│  ├─ Real-time auth     ├─ /coaches/{uid}                     │
│  └─ Persistence        ├─ /invites/{id}                      │
│                        └─ Rules: team-based access control   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: From Click to Firestore

```
Coach clicks button (e.g., "Add Player")
        ↓
Component calls: onVoegSpelerToe(naam, type)
        ↓
App.tsx handler: addSpeler()
        ↓
State update: setSpelers([...spelers, newSpeler])
        ↓
useEffect detects change (spelers dependency)
        ↓
Debounce 1 second
        ↓
Firebase call: saveSpelers(selectedTeamId, spelers)
        ↓
Firestore update: /teams/{teamId}/spelers/{spelerId} = spelerData
        ↓
Real-time listener fires
        ↓
Other coaches' apps update (if using onSnapshot)
        ↓
Success ✅
```

---

## Component Hierarchy

```
App.tsx (Root)
│
├─ Navigation (Header + Menu)
│  ├─ Hamburger menu (mobile)
│  ├─ Horizontal menu (desktop)
│  └─ User dropdown
│
├─ AuthScreen (if not logged in)
│
└─ Screen Router (based on huidigScherm state)
   │
   ├─ 'team' → TeamBeheer
   │  ├─ Tab: Vaste Spelers
   │  │  ├─ Add player form
   │  │  └─ Player list (with delete)
   │  │
   │  ├─ Tab: Gast Spelers
   │  │  ├─ Add guest form
   │  │  └─ Guest list (with delete)
   │  │
   │  ├─ Team selection dropdown
   │  ├─ Create team modal
   │  ├─ Delete team modal
   │  └─ InviteCoaches component
   │
   ├─ 'wedstrijden' → WedstrijdOverzicht
   │  ├─ Filter buttons (All/Competitie/Oefenwedstrijd)
   │  ├─ Komende wedstrijden (chronological)
   │  │  └─ Match cards (with View/Copy/Delete)
   │  │
   │  └─ Gespeelde wedstrijden (newest first)
   │     └─ Match cards (with View/Copy/Delete)
   │
   ├─ 'wedstrijd' → WedstrijdOpstelling
   │  ├─ Match header (date, opponent, type)
   │  │
   │  └─ Quarter tabs (Kwart 1, 2, 3, 4)
   │     ├─ Formatie visual (field with player circles)
   │     │  ├─ Veld (On field - 6 or 8 players)
   │     │  └─ Bank (Bench - substitutes)
   │     │
   │     ├─ Wissels dropdown (at 6:15 mark)
   │     ├─ Doelpunten section
   │     │  ├─ Add goal button
   │     │  └─ Goal list (with delete)
   │     │
   │     ├─ Theme evaluation
   │     ├─ Observations
   │     ├─ Regelchecks (warnings)
   │     └─ Notes
   │
   ├─ 'statistieken' → Statistieken
   │  ├─ Team Overview (🏆)
   │  ├─ Top Scorers (🥅)
   │  ├─ Position Success (📍)
   │  ├─ Theme Success (🎯)
   │  ├─ Goals per Quarter (📊)
   │  ├─ Home vs Away (🏠✈️)
   │  └─ Last 3 Matches (📋)
   │
   └─ 'instellingen' → Instellingen
      ├─ Club name edit
      ├─ Team name edit
      ├─ Export data
      └─ Import data
```

---

## State Management Flow

```
App.tsx Central State
│
├─ Authentication
│  └─ currentCoach: Coach | null
│
├─ Team Selection
│  ├─ selectedTeamId: string | null
│  └─ teams: TeamInfo[] (loaded from coach.teamIds)
│
├─ Team Data (loaded via selectedTeamId)
│  ├─ clubNaam: string
│  ├─ teamNaam: string
│  ├─ spelers: Speler[]
│  └─ wedstrijden: Wedstrijd[]
│
├─ UI State
│  ├─ huidigScherm: string ('team', 'wedstrijden', 'wedstrijd', 'statistieken')
│  ├─ huidgeWedstrijd: Wedstrijd | null (for edit)
│  ├─ formatieModal: boolean
│  └─ kopieerModal: { open, wedstrijd, datum, tegenstander }
│
└─ Handlers & Callbacks
   ├─ addSpeler, removeSpeler
   ├─ handleVoegWisselToe, handleUpdateKwart
   ├─ handleVoegDoelpuntToe, handleVerwijderDoelpunt
   ├─ kopieerWedstrijd, verwijderWedstrijd
   ├─ handleCreateTeam, handleDeleteTeam
   └─ logoutCoach

All passed down as Props to Child Components
```

---

## Database Schema (Firestore)

```
firestore/
│
├── /teams/{teamId}
│   ├── teamId: "team_1725000000000"
│   ├── clubNaam: "Ajax Jeugd"
│   ├── teamNaam: "Team U12A"
│   ├── coaches: ["uid_coach1", "uid_coach2"]
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   │
│   ├── /spelers/{spelerId}
│   │   ├── id: 1
│   │   ├── naam: "Jan de Vries"
│   │   ├── type: "vast"
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   └── /wedstrijden/{wedstrijdId}
│       ├── id: 1725000000000
│       ├── datum: "2024-10-26"
│       ├── tegenstander: "FC Ajax"
│       ├── thuisUit: "thuis"
│       ├── type: "competitie"
│       ├── formatie: "6x6-vliegtuig"
│       ├── afwezigeSpelers: [3, 5]
│       ├── notities: "Sterke eerste helft"
│       ├── themas: ["aanvallen", "compact"]
│       ├── isAfgelast: false
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       │
│       └── /kwarten/{kwartNum}
│           ├── nummer: 1
│           ├── opstelling: {
│           │   "Keeper": "1",
│           │   "Achter": "2",
│           │   "Links": "3",
│           │   "Midden": "4",
│           │   "Rechts": "5",
│           │   "Voor": "6"
│           │ }
│           ├── wissels: [
│           │   { id: 1, positie: "Keeper", wisselSpelerId: "7" }
│           │ ]
│           ├── doelpunten: [
│           │   { id: 1, type: "eigen", spelerId: 1 },
│           │   { id: 2, type: "tegenstander" }
│           │ ]
│           ├── minuten: 12.5
│           ├── aantekeningen: "Goed aanvallen"
│           ├── themaBeoordelingen: {
│           │   "aanvallen": "goed",
│           │   "compact": "beter"
│           │ }
│           ├── observaties: ["sterkkwart"]
│           └── updatedAt: timestamp
│
├── /coaches/{uid}
│   ├── uid: "firebase_auth_uid_123"
│   ├── email: "trainer@example.com"
│   ├── naam: "John Doe"
│   ├── teamIds: ["team_123", "team_456"]  ← ARRAY!
│   ├── rol: "admin"
│   └── createdAt: timestamp
│
└── /invites/{inviteId}
    ├── inviteId: "inv_abc123"
    ├── teamId: "team_123"
    ├── email: "newcoach@example.com"
    ├── invitedBy: "uid_coach1"
    ├── createdAt: timestamp
    └── status: "pending"
```

---

## Calculation Sequence (In Statistieken.tsx)

```
Statistieken receives: wedstrijden[], spelers[]
│
├─ berekenTeamPrestaties(wedstrijden)
│  └─> { wins, losses, draws, points, % }
│
├─ berekenTopscorers(wedstrijden, spelers)
│  └─> [{ naam, goals }] sorted descending
│
├─ berekenSpeelminutenDetail(wedstrijden, spelers)
│  └─> [{ naam, regulier_min, wissel_min, bank_min, total, avg }]
│      ⚠️ NOT USED IN UI YET
│
├─ berekenTotaalKeeperBeurten(wedstrijden, spelers)
│  └─> { spelerId: count }
│      ⚠️ NOT USED IN STATISTIEKEN YET
│
├─ berekenPositieSuccessRate()
│  └─> [{ naam, posities: { pos: success% } }]
│
├─ berekenThemaSucces()
│  └─> [{ thema, goed, beter, percentage }]
│
├─ berekenDoelpuntenPerKwart()
│  └─> [{ kwart, avg_eigen, avg_teg }]
│
└─ berekenThuisUitTrend()
   └─> { thuis: {wins, losses}, uit: {wins, losses} }
```

---

## Props Drilling (Deepest Path)

```
App.tsx
  │ passes: wedstrijden, spelers
  ↓
WedstrijdOpstelling.tsx
  │ uses locally: wedstrijd (current match)
  │ displays in: wissels dropdown
  │ calls: berekenWedstrijdStats(wedstrijd, spelers)
  │ calls: berekenTotaalKeeperBeurten(wedstrijden, spelers)
  ↓
Not passed further (leaf component)
```

---

## Firebase Path Pattern

```
✅ CORRECT PATH PATTERNS:

Player: /teams/{teamId}/spelers/{spelerId}
         └─ teamId: "team_123"
         └─ spelerId: "speler_456"

Match: /teams/{teamId}/wedstrijden/{wedstrijdId}
       └─ teamId: "team_123"
       └─ wedstrijdId: "wed_789"

Quarter: /teams/{teamId}/wedstrijden/{wedstrijdId}/kwarten/{kwartNum}
         └─ teamId: "team_123"
         └─ wedstrijdId: "wed_789"
         └─ kwartNum: 1

❌ OLD (NO LONGER USED):
/teams/{teamId}/seizoenen/{seizoenId}/wedstrijden/...
└─ REMOVED! No more seizoenen!
```

---

## Error Handling Pattern

```
Try/Catch Flow:
  try {
    call Firebase function
  } catch (error) {
    console.error('context: error:', error)
    show toast/alert to user
    maybe reload data
  }

Defensive Checks in calculations.ts:
  if (!Array.isArray(wedstrijden)) {
    console.warn('⚠️ not array, returning empty')
    return []
  }
```

---

## Performance Considerations

| Area | Current | Issue | Solution |
|------|---------|-------|----------|
| Auto-save | 1 second debounce | OK for small teams | ✅ Current is fine |
| Calculation | Runs on every render | Expensive for large datasets | Consider React.memo() |
| Data loading | All at once | No pagination | OK for single team |
| Listeners | Not actively used | Missed real-time updates | Enable onSnapshot() |
| Calculations cache | None | Recalculates each render | Memoize results |

---

## Multi-Team Support Flow

```
Coach logs in
  ↓
getCurrentCoach() → coach has teamIds: ["team_1", "team_2", "team_3"]
  ↓
Effect calls laadTeamInfo(coach.teamIds)
  ↓
Fetches all 3 teams in parallel
  ↓
Returns: [
    { teamId: "team_1", teamNaam: "Ajax U12" },
    { teamId: "team_2", teamNaam: "Ajax U14" },
    { teamId: "team_3", teamNaam: "Sparta U10" }
]
  ↓
Teams dropdown populated
  ↓
Coach selects "Ajax U14"
  ↓
App calls loadTeamData("team_2")
  ↓
Loads all spelers, wedstrijden for that team
  ↓
UI updates to show team 2 data
```

---

## 🎯 Key Concepts Summary

| Concept | Meaning | Example |
|---------|---------|---------|
| **Props** | Data passed down from parent | `wedstrijden={wedstrijden}` |
| **State** | Local component data | `const [name, setName] = useState()` |
| **Effect** | Side effect when dependency changes | Auto-save when spelers change |
| **Callback** | Function prop from parent | `onVoegSpelerToe()` |
| **Debounce** | Wait before executing | Save after 1 second idle |
| **Batch** | Multiple DB operations at once | `saveSpelersInBatch()` |
| **Defensive** | Check for errors before use | `if (!Array.isArray()) return` |
| **Listener** | Real-time updates from DB | `onSnapshot()` |
| **Multi-team** | Coach can have multiple teams | `coach.teamIds: ["team_1", "team_2"]` |
| **No seizoenen** | Teams removed, data flat | All under `/teams/{teamId}/` |

---

Generated: Architecture Overview v1.0
For: Joegie Formation Manager
Date: November 2025
