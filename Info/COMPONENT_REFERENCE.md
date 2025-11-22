# 📚 JOEGIE - Component & Function Reference Guide

## 🎯 Quick Navigation
- [App.tsx](#apptsx) - Main router
- [TeamBeheer.tsx](#teambeheer) - Team management
- [Statistieken.tsx](#statistieken) - Statistics dashboard
- [Firebase Service](#firebase-service) - Database functions
- [Calculations](#calculations) - Utility calculations
- [Types & Interfaces](#types--interfaces) - Data models

---

## App.tsx

### State Management
| State | Type | Purpose |
|-------|------|---------|
| `currentCoach` | `Coach \| null` | Logged-in coach data |
| `selectedTeamId` | `string \| null` | Currently selected team |
| `teams` | `TeamInfo[]` | List of coach's teams (with names) |
| `spelers` | `Speler[]` | Team players |
| `wedstrijden` | `Wedstrijd[]` | Team matches |
| `clubNaam` | `string` | Club name |
| `teamNaam` | `string` | Team name |
| `huidigScherm` | `string` | Current screen ('wedstrijden', 'team', 'statistieken', etc) |
| `huidgeWedstrijd` | `Wedstrijd \| null` | Currently edited match |

### Props Passed Down
| To Component | Props | Type |
|--------------|-------|------|
| **Statistieken** | `wedstrijden`, `spelers` | `Wedstrijd[]`, `Speler[]` |
| **TeamBeheer** | `teamId`, `clubNaam`, `teamNaam`, `spelers`, `currentCoach`, `teamIds`, `teams`, `onSelectTeam`, `onCreateTeam`, `onDeleteTeam` | Various (see TeamBeheer section) |
| **WedstrijdOpstelling** | `wedstrijd`, `spelers`, `wedstrijden`, `onUpdateWedstrijd`, `onVoegWisselToe`, etc | Various (11 props) |
| **WedstrijdOverzicht** | `wedstrijden`, `spelers`, `onSelectWedstrijd`, `onDeleteWedstrijd`, etc | Various |

### Key Functions
| Function | Called By | Purpose |
|----------|-----------|---------|
| `getCurrentCoach()` | Effect | Get logged-in coach from Firebase |
| `getTeam()` | `laadTeamInfo()` | Fetch team data |
| `getSpelers()` | `loadTeamData()` | Fetch players |
| `getWedstrijden()` | `loadTeamData()` | Fetch matches |
| `saveSpelers()` | Effect (auto-save) | Save players to Firebase |
| `saveWedstrijden()` | Effect (auto-save) | Save matches to Firebase |
| `saveTeamInfo()` | Effect (auto-save) | Save club/team names |
| `laadTeamInfo()` | Effect | Load team names for dropdown |
| `addSpeler()` | Button click | Add new player locally |
| `removeSpeler()` | Button click | Remove player locally |
| `handleVoegWisselToe()` | WedstrijdOpstelling | Add substitution |
| `handleUpdateKwart()` | WedstrijdOpstelling | Update quarter data |
| `handleVoegDoelpuntToe()` | WedstrijdOpstelling | Add goal |
| `handleVerwijderDoelpunt()` | WedstrijdOpstelling | Remove goal |
| `kopieerWedstrijd()` | Button click | Open copy match modal |
| `bevestigKopieerWedstrijd()` | Modal confirm | Copy match |
| `verwijderWedstrijd()` | Button click | Delete match |
| `handleCreateTeam()` | TeamBeheer | Create new team |
| `handleDeleteTeam()` | TeamBeheer | Delete team |
| `logoutCoach()` | Button click | Logout |

### Firebase Imports
```typescript
import { 
  getCurrentCoach, logoutCoach, Coach, getTeam, getSpelers, getWedstrijden,
  saveSpelers, saveWedstrijden, saveTeamInfo, createTeam, deleteTeam,
  deleteWedstrijd, deleteSpeler
} from './firebase/firebaseService'
```

### Utility Imports
```typescript
import { getFormatieNaam } from './utils/formatters'
import { laadTeamInfo, TeamInfo } from './utils/teamData'
```

---

## TeamBeheer.tsx

### Props (Interface: TeamBeheerProps)
| Prop | Type | Required | Purpose |
|------|------|----------|---------|
| `teamId` | `string \| null` | Yes | Current team ID |
| `clubNaam` | `string` | Yes | Club name |
| `teamNaam` | `string` | Yes | Team name |
| `onUpdateClubNaam` | `(naam: string) => void` | Yes | Update club name |
| `onUpdateTeamNaam` | `(naam: string) => void` | Yes | Update team name |
| `spelers` | `Speler[]` | Yes | List of players |
| `onVoegSpelerToe` | `(naam, type?, team?) => void` | Yes | Add player callback |
| `onVerwijderSpeler` | `(id: number) => void` | Yes | Remove player callback |
| `currentCoach` | `any` | Optional | Current coach data |
| `teamIds` | `string[]` | Optional | Coach's team IDs |
| `teams` | `TeamInfo[]` | Optional | Team names (from App) |
| `onSelectTeam` | `(teamId: string) => void` | Optional | Team selection callback |
| `onCreateTeam` | `(clubNaam, teamNaam) => Promise<void>` | Optional | Create team callback |
| `onDeleteTeam` | `(teamId: string) => Promise<void>` | Optional | Delete team callback |

### State
| State | Type | Purpose |
|-------|------|---------|
| `activeTab` | `'vast' \| 'gast'` | Player type filter (fixed/guest) |
| `nieuwSpelerNaam` | `string` | New player name input |
| `nieuwGastTeam` | `string` | Guest player's team |
| `createTeamModal` | `boolean` | Show create team modal |
| `newClubNaam` | `string` | New club name input |
| `newTeamNaam` | `string` | New team name input |
| `isCreating` | `boolean` | Loading state for team creation |

### Key Functions
| Function | Purpose |
|----------|---------|
| `handleVoegSpelerToe()` | Validate and add player |
| `handleCreateTeam()` | Create new team |
| `handleDeleteTeam()` | Delete team with confirmation |
| `handleSelectTeam()` | Switch to different team |

---

## Statistieken.tsx

### Props
| Prop | Type | Purpose |
|------|------|---------|
| `spelers` | `Speler[]` | List of players |
| `wedstrijden` | `Wedstrijd[]` | List of matches |

### Calculation Functions (Internal)
| Function | Returns | Purpose |
|----------|---------|---------|
| `berekenPositieSuccessRate()` | `Array` | Position success % per player |
| `berekenThemaSucces()` | `Array` | Theme success % |
| `berekenDoelpuntenPerKwart()` | `Array` | Goals per quarter |
| `berekenThuisUitTrend()` | `Object` | Home/away statistics |
| `berekenLaatste3()` | `Object` | Last 3 matches trend |
| `berekenTopscorers()` | `Array` | Top scorers ranking |
| `berekenTeamPrestaties()` | `Object` | Team overall stats |

### Imported Calculations
| Function | From | Purpose |
|----------|------|---------|
| `berekenTeamPrestaties()` | `calculations.ts` | Overall team stats |
| `berekenTopscorers()` | `calculations.ts` | Top scorers |
| `berekenSpeelminutenDetail()` | `calculations.ts` | **NOT USED YET!** |
| `berekenTotaalKeeperBeurten()` | `calculations.ts` | **NOT USED YET!** |

### UI Sections
| Section | Emoji | Data Shown |
|---------|-------|-----------|
| Team Overview | 🏆 | Wins/losses/draws, points |
| Top Scorers | 🥅 | Top 3 with medals 🥇🥈🥉 |
| Position Success Rate | 📍 | Best position per player |
| Theme Success % | 🎯 | Theme performance |
| Goals per Quarter | 📊 | Average per quarter |
| Home vs Away | 🏠✈️ | Home/away comparison |
| Last 3 Matches | 📋 | Recent trend |

### Missing Features ⚠️
- ❌ Speelminuten tabel (using `berekenSpeelminutenDetail()`)
- ❌ Keeper-beurten detail (using `berekenTotaalKeeperBeurten()`)
- ❌ Per-match speelminuten breakdown

---

## Firebase Service

### Authentication Functions
| Function | Params | Returns | Purpose |
|----------|--------|---------|---------|
| `registerCoach()` | `email, password, naam` | `Promise<Coach>` | Register new coach |
| `loginCoach()` | `email, password` | `Promise<Coach>` | Login coach |
| `logoutCoach()` | - | `Promise<void>` | Logout |
| `getCurrentCoach()` | `callback` | `Unsubscribe` | Get current coach (listener) |

### Team Functions
| Function | Params | Returns | Purpose |
|----------|--------|---------|---------|
| `getTeam()` | `teamId` | `Promise<Team \| null>` | Get team data |
| `updateTeam()` | `teamId, updates` | `Promise<void>` | Update team |
| `updateTeamInfo()` | `teamId, clubNaam, teamNaam` | `Promise<void>` | Update club/team names |
| `createTeam()` | `clubNaam, teamNaam` | `Promise<string>` | Create new team |
| `deleteTeam()` | `teamId` | `Promise<void>` | Delete team |

### Player Functions (NO seizoenId needed!)
| Function | Params | Returns | Purpose |
|----------|--------|---------|---------|
| `addSpeler()` | `teamId, speler` | `Promise<string>` | Add player |
| `getSpelers()` | `teamId` | `Promise<Speler[]>` | Get all players |
| `updateSpeler()` | `teamId, spelerId, updates` | `Promise<void>` | Update player |
| `deleteSpeler()` | `teamId, spelerId` | `Promise<void>` | Delete player |
| `saveSpelers()` | `teamId, spelers` | `Promise<void>` | Batch save players |
| `onSpelersChange()` | `teamId, callback` | `Unsubscribe` | Listen to player changes |
| `saveSpelersInBatch()` | `teamId, spelers` | `Promise<void>` | Batch update players |

### Match Functions (NO seizoenId needed!)
| Function | Params | Returns | Purpose |
|----------|--------|---------|---------|
| `addWedstrijd()` | `teamId, wedstrijd` | `Promise<string>` | Add match |
| `getWedstrijden()` | `teamId, type?, sortOrder?` | `Promise<Wedstrijd[]>` | Get matches |
| `updateWedstrijd()` | `teamId, wedstrijdId, updates` | `Promise<void>` | Update match |
| `deleteWedstrijd()` | `teamId, wedstrijdId` | `Promise<void>` | Delete match |
| `saveWedstrijden()` | `teamId, wedstrijden` | `Promise<void>` | Batch save matches |
| `onWedstrijdenChange()` | `teamId, seizoenId, callback` | `Unsubscribe` | Listen to match changes |
| `saveWedstrijdenInBatch()` | `teamId, wedstrijden` | `Promise<void>` | Batch update matches |

### Quarter Functions
| Function | Params | Returns | Purpose |
|----------|--------|---------|---------|
| `updateKwart()` | `teamId, wedstrijdId, kwartNum, updates` | `Promise<void>` | Update quarter data |

### Database Paths
| Type | Path | Example |
|------|------|---------|
| Team | `/teams/{teamId}` | `/teams/team_1234567890` |
| Players | `/teams/{teamId}/spelers/{spelerId}` | `/teams/team_123/spelers/speler_456` |
| Matches | `/teams/{teamId}/wedstrijden/{wedstrijdId}` | `/teams/team_123/wedstrijden/wed_789` |
| Quarters | `/teams/{teamId}/wedstrijden/{wedstrijdId}/kwarten/{kwartNum}` | `/teams/team_123/wedstrijden/wed_789/kwarten/1` |
| Coach | `/coaches/{uid}` | `/coaches/firebase_uid_123` |
| Invites | `/invites/{inviteId}` | `/invites/invite_abc123` |

---

## Calculations.ts

### Functions

#### 1. berekenWedstrijdStats()
```typescript
berekenWedstrijdStats(wedstrijd: Wedstrijd, spelers: Speler[]): Array
```
**Returns:** Array with `{ naam, minuten, keeperBeurten, wisselMinuten }` per player

**Used In:**
- WedstrijdOpstelling.tsx (for display in wissels dropdown)

**Purpose:** Calculate speelminuten per player for ONE match

---

#### 2. berekenTotaalKeeperBeurten()
```typescript
berekenTotaalKeeperBeurten(wedstrijden: Wedstrijd[], spelers: Speler[]): Record<number, number>
```
**Returns:** `{ spelerId: aantal }` - keeper times per player across ALL matches

**Used In:**
- WedstrijdOpstelling.tsx (to sort keepers)
- **NOT USED in Statistieken.tsx** ⚠️

**Purpose:** Count how many times each player was keeper across season

---

#### 3. berekenSpeelminutenDetail()
```typescript
berekenSpeelminutenDetail(wedstrijden: Wedstrijd[], spelers: Speler[]): Array
```
**Returns:** Array with detailed stats:
```typescript
{
  naam: string
  regeliarMinuten: number       // Full quarter (12.5)
  wisselMinuten: number         // Substitution (6.25)
  bankMinuten: number           // Bench (0)
  totaalMinuten: number         // Total
  gemiddeldePerWedstrijd: number // Average per match
  wedstrijden: number           // Match count
}[]
```

**Used In:**
- **NOT USED anywhere!** ⚠️

**Purpose:** Detailed speelminuten breakdown per player

---

#### 4. berekenTeamPrestaties()
```typescript
berekenTeamPrestaties(wedstrijden: Wedstrijd[]): Object
```
**Returns:**
```typescript
{
  totaalEigenDoelpunten: number
  totaalTegenstanderDoelpunten: number
  doelsaldo: number
  gewonnen: number
  gelijkspel: number
  verloren: number
  totaalWedstrijden: number
  winstPercentage: number
}
```

**Used In:**
- Statistieken.tsx (Team Overview section)

---

#### 5. berekenTopscorers()
```typescript
berekenTopscorers(wedstrijden: Wedstrijd[], spelers: Speler[]): Array
```
**Returns:** Sorted array `{ naam, doelpunten }[]` (descending)

**Used In:**
- Statistieken.tsx (Top Scorers section)

---

### Teamdata.ts

#### laadTeamInfo()
```typescript
laadTeamInfo(teamIds: string[], getTeamFunction): Promise<TeamInfo[]>
```
**Returns:** `Promise<{ teamId, teamNaam }[]>`

**Used In:**
- App.tsx (Effect to load team dropdown)

**Purpose:** Load team names for team selector dropdown

---

## Types & Interfaces

### Speler
```typescript
{
  id: number
  naam: string
  type?: 'vast' | 'gast'
  team?: string
}
```

### Wissel
```typescript
{
  id: number
  positie: string
  wisselSpelerId: string
  minuten?: number
}
```

### Doelpunt
```typescript
{
  id: number
  type: 'eigen' | 'tegenstander'
  spelerId?: number
}
```

### Kwart
```typescript
{
  nummer: number (1-4)
  opstelling: Record<string, string>  // positie -> spelerId
  wissels: Wissel[]
  minuten: number  // 12.5
  doelpunten?: Doelpunt[]
  themaBeoordelingen?: Record<string, 'goed' | 'beter' | null>
  observaties?: string[]
  regelCheckWarnings?: string[]
}
```

### Wedstrijd
```typescript
{
  id: number
  datum: string
  tegenstander: string
  thuisUit: 'thuis' | 'uit'
  type?: 'competitie' | 'oefenwedstrijd'
  formatie: '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8'
  kwarten: Kwart[]
  afwezigeSpelers?: number[]
  notities?: string
  themas?: string[]
  isAfgelast?: boolean
  createdAt?: string
  updatedAt?: string
}
```

### Coach
```typescript
{
  uid: string
  email: string
  naam: string
  teamIds: string[]  // ARRAY - multi-team support
  rol: 'admin' | 'coach' | 'viewer'
  createdAt: string
}
```

### Team
```typescript
{
  teamId: string
  clubNaam: string
  teamNaam: string
  coaches: string[]
  createdAt: string
  updatedAt: string
}
```

### TeamInfo
```typescript
{
  teamId: string
  teamNaam: string
}
```

---

## 📊 Data Flow Diagram

```
App.tsx (Main)
├── Gets: currentCoach (Firebase Auth)
├── Loads: selectedTeamId from coach.teamIds
├── Fetches: spelers, wedstrijden, clubNaam, teamNaam
│
├──> TeamBeheer.tsx
│    ├── Props: teamId, spelers, clubNaam, teamNaam, currentCoach, teams
│    └── Functions: addSpeler, removeSpeler, createTeam, deleteTeam
│
├──> WedstrijdOverzicht.tsx
│    ├── Props: wedstrijden, spelers
│    └── Functions: selectWedstrijd, deleteWedstrijd
│
├──> WedstrijdOpstelling.tsx
│    ├── Props: wedstrijd, spelers, wedstrijden
│    ├── Calls: berekenWedstrijdStats(), berekenTotaalKeeperBeurten()
│    └── Functions: updateKwart, addWissel, addGoal
│
└──> Statistieken.tsx
     ├── Props: spelers, wedstrijden
     ├── Calls: berekenTeamPrestaties(), berekenTopscorers()
     ├── SHOULD CALL: berekenSpeelminutenDetail(), berekenTotaalKeeperBeurten()
     └── Sections: 7 different stats views
```

---

## 🔴 Known Issues / TODO

| Issue | Impact | Priority |
|-------|--------|----------|
| `berekenSpeelminutenDetail()` not used | Missing speelminuten table | 🔴 HIGH |
| `berekenTotaalKeeperBeurten()` not used in Statistieken | Missing keeper detail | 🟡 MEDIUM |
| No validators.ts | No regel checks | 🔴 HIGH |
| No per-match breakdown | Can't see match details | 🟡 MEDIUM |

---

## 💡 Quick Reference: "Where is...?"

| Question | Answer |
|----------|--------|
| Where are player props used? | App.tsx → TeamBeheer, WedstrijdOpstelling, Statistieken |
| Where are matches edited? | WedstrijdOpstelling.tsx |
| Where are stats calculated? | calculations.ts |
| Where is coach data? | getCurrentCoach() in firebaseService.ts |
| Where is team data saved? | updateTeamInfo() in firebaseService.ts |
| Where are wissels handled? | WedstrijdOpstelling.tsx |
| Where are doelpunten added? | WedstrijdOpstelling.tsx + Statistieken.tsx |
| Where do I add new calculations? | calculations.ts |
| Where is multi-team support? | coach.teamIds array in firebaseService.ts |
| Where are security rules? | firebaseService.ts (at bottom of file) |

---

## 📝 Notes

- **NO seizoenId** - Code removed seizoenen, all data direct under teams
- **Multi-team support** - Coach has `teamIds` array (can have multiple teams)
- **Auto-save** - App.tsx has useEffects that auto-save to Firebase every 1 second
- **Real-time updates** - onSnapshot listeners available but not actively used
- **Defensive checks** - calculations.ts has console.warn() for missing data

---

Generated: Reference Guide v1.0
Last Updated: November 2025
