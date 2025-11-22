# QUICK REFERENCE - Props & Functions Overview

## 🔥 MOST USED FILES & THEIR "EXPORTS"

### firebaseService.ts - DATABASE LAYER
What you IMPORT from here:

**Auth:**
- getCurrentCoach(callback)
- loginCoach(email, password)
- registerCoach(email, password, naam)
- logoutCoach()

**Teams:**
- getTeam(teamId)
- createTeam(clubNaam, teamNaam)
- updateTeamInfo(teamId, clubNaam, teamNaam)
- deleteTeam(teamId)

**Players (use with teamId ONLY):**
- getSpelers(teamId)
- addSpeler(teamId, speler)
- updateSpeler(teamId, spelerId, updates)
- deleteSpeler(teamId, spelerId)
- saveSpelers(teamId, spelers)

**Matches (use with teamId ONLY):**
- getWedstrijden(teamId)
- addWedstrijd(teamId, wedstrijd)
- updateWedstrijd(teamId, wedstrijdId, updates)
- deleteWedstrijd(teamId, wedstrijdId)
- saveWedstrijden(teamId, wedstrijden)

**Quarters:**
- updateKwart(teamId, wedstrijdId, kwartNum, updates)

**Types:**
- Coach (interface)
- Team (interface)
- CoachInvite (interface)

---

### calculations.ts - CALCULATION LAYER
What you IMPORT from here:

**Main functions:**
- berekenWedstrijdStats(wedstrijd, spelers) → per-match stats
- berekenTotaalKeeperBeurten(wedstrijden, spelers) → keeper times total
- berekenSpeelminutenDetail(wedstrijden, spelers) → detailed minutes
- berekenTeamPrestaties(wedstrijden) → team overall stats
- berekenTopscorers(wedstrijden, spelers) → sorted top scorers

---

### formatters.ts - DISPLAY LAYER
What you IMPORT from here:

- getFormatieNaam(formatie) → "6x6 Vliegtuig"
- getTypeNaam(type) → "Competitie"
- getThuisUitBadge(thuisUit) → "🏠 Thuis"
- formatResultaat(eigenGoals, tegGoals) → { emoji, text, color }
- formatMinuten(minuten) → "12:30"
- formatDatum(datum) → "26-10-2024"
- formatScore(eigen, teg) → "3 - 2"
- getMedalEmoji(position) → "🥇"

---

### types/index.ts - DATA MODELS
What you IMPORT from here:

**Interfaces:**
- Speler
- Wissel
- Doelpunt
- Kwart
- Wedstrijd
- Coach
- Statistieken
- TeamInfo

**Constants:**
- formaties (object with position arrays)
- WEDSTRIJD_THEMAS
- ALLE_THEMAS
- KWART_OBSERVATIES

---

## 🎯 COMPONENT PROP FLOWS

### App.tsx → passes to other components

```
TeamBeheer receives:
├── teamId: string | null
├── clubNaam: string
├── teamNaam: string
├── spelers: Speler[]
├── currentCoach: Coach
├── teams: TeamInfo[]
├── onSelectTeam: (teamId) => void
├── onCreateTeam: (clubNaam, teamNaam) => Promise<void>
└── onDeleteTeam: (teamId) => Promise<void>

WedstrijdOverzicht receives:
├── wedstrijden: Wedstrijd[]
├── spelers: Speler[]
├── onSelectWedstrijd: (wedstrijd) => void
└── onDeleteWedstrijd: (id) => void

WedstrijdOpstelling receives:
├── wedstrijd: Wedstrijd
├── spelers: Speler[]
├── wedstrijden: Wedstrijd[]
├── onUpdateWedstrijd: (wedstrijd) => void
├── onVoegWisselToe: (kwartIndex) => void
├── onUpdateKwart: (kwartIndex, updates) => void
├── onUpdateKwartThemas: (kwartIndex, themas) => void
├── onUpdateKwartObservaties: (kwartIndex, observaties) => void
├── onVoegDoelpuntToe: (kwartIndex, doelpunt) => void
├── onVerwijderDoelpunt: (kwartIndex, doelpuntId) => void
└── onSluiten: () => void

Statistieken receives:
├── wedstrijden: Wedstrijd[]
└── spelers: Speler[]
```

---

## 🔄 STATE FLOW IN APP.TSX

```
Effect 1: Check auth on mount
└─> getCurrentCoach() → sets currentCoach
    └─> if teams: setSelectedTeamId(first team)

Effect 2: When coach changes
└─> laadTeamInfo(coach.teamIds) → sets teams (dropdown list)

Effect 3: When selectedTeamId changes
└─> loadTeamData(selectedTeamId) → fetches spelers + wedstrijden

Effect 4: When spelers change (debounced 1s)
└─> saveSpelers(selectedTeamId, spelers)

Effect 5: When wedstrijden change (debounced 1s)
└─> saveWedstrijden(selectedTeamId, wedstrijden)

Effect 6: When clubNaam/teamNaam change (debounced 1s)
└─> saveTeamInfo(selectedTeamId, clubNaam, teamNaam)
```

---

## 📊 DATA PERSISTENCE

```
Memory (React State)
    ↓ (onChange)
Debounce 1 second
    ↓ (auto-save)
Firebase Firestore
    ↓ (real-time listener)
All coaches see update
```

---

## 🚨 CRITICAL PROPS TO NOT FORGET

| Component | MUST HAVE | Will Break If Missing |
|-----------|-----------|----------------------|
| TeamBeheer | `teamId` | Can't identify team |
| WedstrijdOpstelling | `wedstrijd`, `spelers` | Can't show match or players |
| Statistieken | `wedstrijden`, `spelers` | Can't calculate anything |
| App.tsx | `selectedTeamId` | Can't load team data |

---

## 🔗 WHERE DATA FLOWS

```
Browser (Component State)
    ↓ onChange
App.tsx State Update
    ↓ Dependencies trigger
Effects run
    ↓
Firebase Functions called
    ↓
Data persisted to Firestore
    ↓
Real-time listeners notify
    ↓
Other coaches' apps update
```

---

## 📌 NAMING CONVENTIONS

| Pattern | Meaning | Example |
|---------|---------|---------|
| `on*` | Callback prop | `onSelectTeam`, `onVoegSpelerToe` |
| `handle*` | Internal handler | `handleCreateTeam`, `handleVoegWisselToe` |
| `berekenXxx` | Calculation function | `berekenTeamPrestaties` |
| `get*` | Fetch/retrieve | `getTeam`, `getSpelers` |
| `xxx*` | State setter | `setCurrentCoach`, `setSelectedTeamId` |
| `huidigeXxx` | Current/active | `huidigScherm`, `huidgeWedstrijd` |

---

## ⚡ PERFORMANCE NOTES

- `saveSpelers()`, `saveWedstrijden()` use 1-second debounce
- No pagination - loads ALL matches/players at once
- Firebase onSnapshot listeners available but not used actively
- Calculations run on every render (consider memoization)

---

## 🐛 DEBUG TIPS

If something's not working, check:

1. Is `selectedTeamId` set? → Check App console
2. Are `spelers` loaded? → Check App state
3. Are `wedstrijden` loaded? → Check App state
4. Is the right `teamId` being passed? → Check console logs
5. Did Firebase save? → Check Firestore console
6. Is coach authenticated? → Check `currentCoach`

---

## 📋 IMPORT TEMPLATES

**For a new component:**

```typescript
// Firebase
import { getTeam, getSpelers, getWedstrijden, saveXxx } from '../firebase/firebaseService'

// Calculations
import { berekenTeamPrestaties, berekenTopscorers } from '../utils/calculations'

// Formatters
import { getFormatieNaam, formatDatum } from '../utils/formatters'

// Types
import { Speler, Wedstrijd, Kwart } from '../types'
```

---

## 🔍 QUICK LOOKUP

**Q: I need to add a new prop to Component X**
A: 1) Add to interface, 2) Pass from parent, 3) Add to function signature

**Q: I need to call a new Firebase function**
A: 1) Check if it exists in firebaseService.ts, 2) Import it, 3) Call with right params (check teamId!)

**Q: I need to calculate something new**
A: 1) Add function to calculations.ts, 2) Export it, 3) Import in component, 4) Call it

**Q: Data not saving?**
A: Check 1) selectedTeamId, 2) useEffect dependencies, 3) Firebase console, 4) Network tab

**Q: Component not updating?**
A: Check 1) Props being passed, 2) State dependencies, 3) useEffect triggers

---

Generated: Quick Reference v1.0
For: Joegie Formation Manager
Date: November 2025
