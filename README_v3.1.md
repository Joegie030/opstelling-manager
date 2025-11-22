# Joegie - Formation Manager

Een moderne web applicatie voor het beheren van team opstellingen, speeltijd tracking en statistieken. Gebouwd voor jeugdvoetbal met focus op eerlijke speeltijdverdeling en systematische evaluatie.

## ðŸŽ¯ Features

### Team Management
- Spelers toevoegen (vaste leden en gasten)
- Club- en teamnaam instellen
- **Multi-coach support** met Firebase synchronisatie
- **Coach invitatie systeem v3.1** voor samenwerking op hetzelfde team
  - Invite links genereren (7 dagen geldig)
  - Coaches registreren via invite link
  - Auto-accept na login
  - Wachtende invites beheren
  - Actieve coaches tonen
  - Invites intrekken
- Team-based access control (coaches zien alleen hun team)
- **Seizoenen beheren** (actief/gearchiveerd)

### Seizoen Management
- Meerdere seizoenen per team
- Seizoen status: actief of gearchiveerd
- Start- en einddatum per seizoen
- Automatische wedstrijdorganisatie per seizoen

### Wedstrijd Planning
- Datum en tegenstander registreren
- Wedstrijdtype selecteren (Competitie of Oefenwedstrijd)
- Formatie kiezen: 6x6 (Vliegtuig/Dobbelsteen) of 8x8
- Thuis/Uit onderscheiding
- **Wedstrijdnotities** (inklapbaar)
- Kopieerfunctie voor wedstrijdoverzicht (met datum/tegenstander modal)
- Afgelast markering

### Opstellingen per Wedstrijd
- **4 kwarten Ã  12,5 minuten** elk (totaal 50 minuten)
- **Interactief voetbalveld** met visuele positieplaatsing
- **Wissels systeem** (na 6,25 minuten per kwart)
- Automatische speelminuten tracking
- **Slimme wissels dropdown:**
  - Minuten tonen per speler
  - Gesorteerd op minst gespeeld (eerlijk verdelen)
  - Keepers onderaan (extra bescherming)
- Afwezige spelers markeren
- Gesplitste wedstrijdoverzicht (komende en gespeelde wedstrijden)

### Score Tracking
- **Real-time doelpunten registreren**
- Thuis/Uit omgedraaid voor juiste weergave (Zij - Wij voor uitwedstrijden)
- Doelpuntenmakers bijhouden
- Eindstand automatisch berekenen
- **Responsief design** (compacter op mobiel)

### Statistieken & Rapportage
- **Speeltijd per speler in minuten** (per wedstrijd)
- **Keeper-beurten bijhouden** per speler (totaal en per wedstrijd)
- Top scorers overzicht met medailles (ðŸ¥‡ðŸ¥ˆðŸ¥‰)
- Team prestaties (gewonnen/verloren/gelijkspel)
- Doelsaldo berekening
- **Wedstrijd filters** (competitie/oefenwedstrijd)
- Wedstrijdkaarten met compacte informatie

### Wedstrijdevaluatie & Regelchecks
- **Wedstrijd thema's selectie** (12 voorgedefinieerde thema's)
  - Aanvallend: Aanvallen, Kansen afmaken, Vrijlopen, Touwtjes
  - Verdedigend: Verdedigen, Druk zetten, Compact blijven
  - Algemeen: Omschakelen, Balbezit, Communicatie, Positiespel, Inzet
- **Kwart-per-kwart evaluatie** per thema
- Observaties tags (sterk kwart, zwaar kwart, veel kansen, goed verdedigd, goede inzet)
- **Regelchecks per kwart** met waarschuwingen:
  - Keeper-wissel regel: Keeper moet vÃ³Ã³r of na keeper-beurt spelen (niet direct achter)
  - Dubbele bank regel: Speler mag max 1 kwart achter elkaar op de bank
  - Invaller-bank regel: Invaller mag niet direct daarna op de bank

## ðŸ“ Formaties

### 6x6 Vliegtuig (Standaard)
```
     Keeper
     Achter
Links Midden Rechts
     Voor
```

### 6x6 Dobbelsteen (Gemengde groepen)
```
     Keeper
Links  Rechts
   Midden
Links  Rechts
```

### 8x8 Pyramide
```
        Keeper
Links achter  Rechts achter
Links midden Midden Rechts midden
Links voor    Rechts voor
```

## ðŸ“± UI/UX Highlights

### Design
- Moderner, sport-agnostisch branding met "Joegie" als brand name
- "Formation Manager" als subtitel
- **Responsive design** voor mobiel en desktop
- Compacte wedstrijdkaarten
- Visueel voetbalveld met duidelijke positieaanduiding
- Kleurcodes per kwart (blauw voor kwart 1, etc.)

### Navigation
- Blauwe header met Joegie logo
- **Horizontaal menu** (desktop)
- **Hamburger menu** (mobiel)
- User profiel dropdown
- Help scherm in menu

### Wedstrijdoverzicht
- **Filter op type** (Competitie/Oefenwedstrijd)
- **Gesplitst overzicht:**
  - Komende wedstrijden (chronologisch)
  - Gespeelde wedstrijden (nieuwste eerst)
- Compacte kaarten met:
  - Datum + Thuis/Uit badge
  - Matchup (wie tegen wie)
  - Type + Formatie
  - Bekijk/Kopieer/Verwijder buttons

### Veld & Opstelling
- Visueel halfveld met duidelijke markering
- Spelers in kringen met nummers
- Inklapbare teams (Op het Veld / Op de Bank)
- Slimme selectie tooltips bij hover/click

## ðŸ” Authentication & Multi-Tenant

- Firebase Authentication (Email/wachtwoord)
- Team-based access control
- Multiple coaches per team
- Coach invitatie systeem
- Firestore Security Rules enforcing team isolation
- Real-time sync across all coaches

## ðŸ’¾ Database & Opslag (v2 Structuur)

### Cloud Storage
- Automatische synchronisatie naar Firebase
- Real-time updates tussen coaches
- Spelers, seizoenen, wedstrijden, team info

### Offline Support
- Cached data beschikbaar offline
- Sync wanneer verbinding hersteld

### Data Structure v2

```
firestore/
â”‚
â”œâ”€â”€ teams/{teamId}
â”‚   â”œâ”€â”€ teamId: string
â”‚   â”œâ”€â”€ clubNaam: string
â”‚   â”œâ”€â”€ teamNaam: string
â”‚   â”œâ”€â”€ coaches: string[]
â”‚   â”œâ”€â”€ createdAt: timestamp
â”‚   â”œâ”€â”€ updatedAt: timestamp
â”‚   â”‚
â”‚   â”œâ”€â”€ spelers/{spelerId}
â”‚   â”‚   â”œâ”€â”€ id: number
â”‚   â”‚   â”œâ”€â”€ naam: string
â”‚   â”‚   â”œâ”€â”€ type: 'vast' | 'gast'
â”‚   â”‚   â”œâ”€â”€ team?: string
â”‚   â”‚   â”œâ”€â”€ createdAt: timestamp
â”‚   â”‚   â””â”€â”€ updatedAt: timestamp
â”‚   â”‚
â”‚   â””â”€â”€ seizoenen/{seizoenId}
â”‚       â”œâ”€â”€ naam: string
â”‚       â”œâ”€â”€ startDatum: string
â”‚       â”œâ”€â”€ eindDatum: string
â”‚       â”œâ”€â”€ status: 'actief' | 'gearchiveerd'
â”‚       â”œâ”€â”€ createdAt: timestamp
â”‚       â”œâ”€â”€ updatedAt: timestamp
â”‚       â”‚
â”‚       â”œâ”€â”€ wedstrijden/{wedstrijdId}
â”‚       â”‚   â”œâ”€â”€ id: number
â”‚       â”‚   â”œâ”€â”€ datum: string
â”‚       â”‚   â”œâ”€â”€ tegenstander: string
â”‚       â”‚   â”œâ”€â”€ thuisUit: 'thuis' | 'uit'
â”‚       â”‚   â”œâ”€â”€ type?: 'competitie' | 'oefenwedstrijd'
â”‚       â”‚   â”œâ”€â”€ formatie: string
â”‚       â”‚   â”œâ”€â”€ afwezigeSpelers: number[]
â”‚       â”‚   â”œâ”€â”€ notities: string
â”‚       â”‚   â”œâ”€â”€ themas: string[]
â”‚       â”‚   â”œâ”€â”€ isAfgelast: boolean
â”‚       â”‚   â”œâ”€â”€ createdAt: timestamp
â”‚       â”‚   â”œâ”€â”€ updatedAt: timestamp
â”‚       â”‚   â”‚
â”‚       â”‚   â””â”€â”€ kwarten/{kwartNum}
â”‚       â”‚       â”œâ”€â”€ nummer: number (1-4)
â”‚       â”‚       â”œâ”€â”€ opstelling: { [positie]: spelerIdStr }
â”‚       â”‚       â”œâ”€â”€ wissels: Wissel[]
â”‚       â”‚       â”œâ”€â”€ minuten: number
â”‚       â”‚       â”œâ”€â”€ aantekeningen: string
â”‚       â”‚       â”œâ”€â”€ doelpunten: Doelpunt[]
â”‚       â”‚       â”œâ”€â”€ themaBeoordelingen: { [themaId]: 'goed' | 'beter' | null }
â”‚       â”‚       â”œâ”€â”€ observaties: string[]
â”‚       â”‚       â””â”€â”€ updatedAt: timestamp
â”‚       â”‚
â”‚       â””â”€â”€ statistieken/
â”‚           â”œâ”€â”€ doelpuntenMakers: { [spelerId]: aantal }
â”‚           â”œâ”€â”€ speelminuten: { [spelerId]: aantal }
â”‚           â”œâ”€â”€ keeperBeurten: { [spelerId]: aantal }
â”‚           â””â”€â”€ teamStats: { won, lost, draw, doelsaldo }
â”‚
â”œâ”€â”€ coaches/{uid}
â”‚   â”œâ”€â”€ uid: string
â”‚   â”œâ”€â”€ email: string
â”‚   â”œâ”€â”€ naam: string
â”‚   â”œâ”€â”€ teamIds: string[]
â”‚   â”œâ”€â”€ rol: 'admin' | 'coach' | 'viewer'
â”‚   â””â”€â”€ createdAt: timestamp
â”‚
â””â”€â”€ invites/{inviteId}
    â”œâ”€â”€ inviteId: string
    â”œâ”€â”€ teamId: string
    â”œâ”€â”€ email: string
    â”œâ”€â”€ invitedBy: string
    â”œâ”€â”€ createdAt: timestamp
    â””â”€â”€ status: 'pending' | 'accepted' | 'rejected'
```

## ðŸ“Š Statistieken Berekening

### Speeltijd
- Volledige kwart: 12,5 minuten
- Met wissel: 6,25 minuten
- Op bank: 0 minuten (telt als wissel)

### Keeper-beurten
- Tellen per speler totaal
- Ook per wedstrijd zichtbaar
- Nuttig voor eerlijke verdeling keeper rotatie

### Topscorers
- Totale doelpunten over alle wedstrijden
- Gesorteerd descending
- Top 3 krijgt medailles (ðŸ¥‡ðŸ¥ˆðŸ¥‰)

### Team Prestaties
- Doelpunten voor/tegen
- Doelsaldo
- Wins/draws/losses
- Winst percentage

## ðŸŽ® Workflow

### 1. Team Inrichten
1. Navigeer naar Team tab
2. Stel club- en teamnaam in
3. Voeg spelers toe (vaste spelers of gasten)
4. Nodig coaches uit (optioneel voor meerdere coaches)

### 2. Seizoen Aanmaken
1. Navigeer naar Seizoen beheer
2. Klik "Nieuw Seizoen"
3. Vul in:
   - Naam (bv. "2024/2025")
   - Start datum
   - Eind datum
4. Klik "Maak Seizoen"
5. Selecteer seizoen als actief

### 3. Wedstrijd Aanmaken
1. Klik "Nieuwe Wedstrijd"
2. Vul in:
   - Datum
   - Tegenstander
   - Thuis/Uit
   - Wedstrijdtype (Competitie/Oefenwedstrijd)
3. Selecteer formatie (6x6 of 8x8)
4. Klik "Maak Wedstrijd"

### 4. Opstelling Samenstellen (Per Kwart)
1. Selecteer spelers voor elke positie
2. Kijk regelchecks onderaan kwart
3. Voeg wissels toe (na 6,25 min)
4. Markeer afwezige spelers
5. Herhaal voor kwart 2, 3, 4

### 5. Score Bijhouden (Live)
1. Klik "Wij scoren" of "Zij scoren"
2. Selecteer doelpuntenmaker (optioneel)
3. Score update automatisch
4. Doelpunten verschijnen in live tracker

### 6. Wedstrijd Evalueren
1. Selecteer relevante wedstrijdthema's
2. Per kwart: evalueer thema's (Goed/Kan beter)
3. Voeg observaties toe
4. Optioneel: vrije notities

### 7. Statistieken Bekijken
1. Ga naar Statistieken tab
2. Bekijk:
   - Wedstrijdoverzicht met filters
   - Speeltijd per speler
   - Topscorers
   - Team prestaties

## ðŸš€ Installatie & Deployment

### Vereisten
- Node.js 18+
- npm of yarn
- Firebase account

### Setup

```bash
# Clone repository
git clone https://github.com/Joegie030/opstelling-manager.git
cd opstelling-manager

# Installeer dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

### Firebase Setup
1. Maak Firebase project aan op firebase.google.com
2. Enable Email/Password Authentication
3. Create Firestore Database (production mode)
4. Copy Firebase config naar `src/firebase/firebaseService.ts`
5. Deploy Firestore Security Rules (zie deployment sectie)

### Deployment op Vercel
1. Push code naar GitHub
2. Verbind repo met Vercel
3. Vercel detecteert automatisch Vite project
4. Deploy! (Automatische updates bij push naar main)

**Handmatig:**
```bash
npm run build
vercel deploy --prod
```

### Firestore Security Rules (v2)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teams: coaches kunnen hun team zien
    match /teams/{teamId} {
      allow read, write: if request.auth.uid in resource.data.coaches;
      
      // Spelers onder team
      match /spelers/{doc=**} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
      }
      
      // Seizoenen onder team
      match /seizoenen/{seizoenId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
        
        // Wedstrijden onder seizoen
        match /wedstrijden/{doc=**} {
          allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
        }
        
        // Statistieken onder seizoen
        match /statistieken/{doc=**} {
          allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
        }
      }
    }
    
    // Coaches: coaches kunnen hun eigen profiel zien
    match /coaches/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }
    
    // Invites: iedereen kan pending invites zien
    match /invites/{inviteId} {
      allow read, write: if request.auth.email == resource.data.email || request.auth.uid == resource.data.invitedBy;
    }
  }
}
```

## ðŸ› ï¸ Utilities & Helper Functions

### Calculations (`utils/calculations/`)

**`speelminuten.ts`**
- `berekenTotaalSpeelminuten()` - Totale speelminuten per speler per wedstrijd
- `berekenSpeelminutenStats()` - Statistieken over meerdere wedstrijden
- `getGemiddeldePerWedstrijd()` - Gemiddelde speelminuten per wedstrijd

**`keeper.ts`**
- `detecteerKeepers()` - Wie is keeper in een kwart
- `berekenKeeperBeurten()` - Hoe vaak is elke speler keeper geweest
- `berekenKeeperMinuten()` - Totale keeper-minuten per speler
- `getKeeperStats()` - Alle keeper statistieken

**`doelpunten.ts`**
- `berekenTopscorers()` - Ranglijst van topscorers
- `berekenWedstrijdResultaat()` - Gewonnen/verloren/gelijkspel bepalen
- `berekenDoelpuntenPerKwart()` - Doelpunten per kwart

### Validators (`utils/validators/`)

**`opstelling.ts`**
- `checkKwartRegels()` - Regelchecks per kwart
  - Keeper-wissel regel: Keeper moet vÃ³Ã³r of na keeper-beurt spelen
  - Dubbele bank regel: Max 1 kwart achter elkaar op bank
  - Invaller-bank regel: Invaller mag niet direct daarna op bank
- `checkAfwezigeInOpstelling()` - Controleer afwezige spelers niet in opstelling

### Formatters (`utils/formatters/`)

**`display.ts`** - Display helpers voor consistent UI
- `getFormatieNaam(formatie)` - "6x6 Vliegtuig", "8x8", etc.
- `getTypeNaam(type)` - "Competitie" of "Oefenwedstrijd"
- `formatResultaat(eigenDoelpunten, tegenstanderDoelpunten)` - Match result met emoji

**Opmerking:** Nieuwe formatters worden ALLEEN toegevoegd als we ze nodig hebben in de code, niet preemptief.

## ðŸš€ Phase-Based Development

### âœ… Phase 1 & 2: Compleet (Oktober 2025)
- âœ… Folder herstructurering (screens/ + components/)
- âœ… Utilities geextraheerd (calculations, validators, formatters)
- âœ… Imports bijgewerkt
- âœ… Database v2 structuur geimplementeerd (seizoenen support)

### ðŸ”„ Phase 3: TSX Validation (ACTUEEL)
- ðŸ”„ Alle TSX bestanden controleren op database v2 compatibility
- ðŸ”„ seizoenId parameter overal toevoegen waar nodig
- ðŸ”„ Real-time listeners updaten (onWedstrijdenChange, etc.)
- ðŸ”„ State management voor seizoen selectie

### ðŸ“‹ Phase 4: Custom Hooks (Toekomst)
Wanneer je later meer complexe state nodig hebt:
- `useWedstrijd()` - Wedstrijd data & state
- `useStatistieken()` - Statistic calculations & filtering
- `useTeamData()` - Team management logic
- `useAuth()` - Authentication state
- `useSeizoenen()` - Seizoen management

### ðŸŽ¯ Phase 5: Componenten Splitsen (Later)
Als componenten te groot worden:
- `WisselForm.tsx` - Wissel formulier geextraheerd
- `OpstellingGrid.tsx` - Opstelling grid component
- `SpelerSelectieModal.tsx` - Speler selectie modal
- `RegelChecks.tsx` - Regelchecks display

## ðŸ“¦ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Firebase (Auth + Firestore)
- **Hosting:** Vercel
- **Version Control:** Git/GitHub

## ðŸ“ Project Structuur

```
src/
â”œâ”€â”€ screens/                     # Alle main pagina's/schermen
â”‚   â”œâ”€â”€ AuthScreen.tsx           # Login/Register
â”‚   â”œâ”€â”€ WedstrijdOverzicht.tsx   # Wedstrijdenlijst (per seizoen)
â”‚   â”œâ”€â”€ WedstrijdOpstelling.tsx  # Opstelling editor (Phase: kan gesplitst worden)
â”‚   â”œâ”€â”€ Statistieken.tsx         # Statistieken overzicht (per seizoen)
â”‚   â”œâ”€â”€ TeamBeheer.tsx           # Spelers beheer
â”‚   â”œâ”€â”€ SeizoenenBeheer.tsx      # Seizoen management
â”‚   â””â”€â”€ Instellingen.tsx         # Settings & admin
â”‚
â”œâ”€â”€ components/                  # Feature-specifieke componenten
â”‚   â”œâ”€â”€ Navigation.tsx           # Header & menu
â”‚   â”œâ”€â”€ WedstrijdHeader.tsx      # Header in wedstrijd
â”‚   â”œâ”€â”€ WedstrijdSamenvatting.tsx # Wedstrijd samenvatting
â”‚   â”œâ”€â”€ ScoreTracking.tsx        # Score bijhouden component
â”‚   â”œâ”€â”€ VoetbalVeld.tsx          # Interactief veld
â”‚   â”œâ”€â”€ WedstrijdContext.tsx     # Context provider
â”‚   â””â”€â”€ InviteCoaches.tsx        # Coach invitatie
â”‚
â”œâ”€â”€ utils/                       # Herbruikbare helper functies
â”‚   â”œâ”€â”€ calculations/            # Berekeningen
â”‚   â”‚   â”œâ”€â”€ speelminuten.ts      # Speeltijd berekeningen
â”‚   â”‚   â”œâ”€â”€ keeper.ts            # Keeper statistieken
â”‚   â”‚   â””â”€â”€ doelpunten.ts        # Doelpunten en scoring
â”‚   â”œâ”€â”€ validators/              # Validatie logica
â”‚   â”‚   â””â”€â”€ opstelling.ts        # Regelchecks (keeper, wissels, etc)
â”‚   â””â”€â”€ formatters/              # Gegevens formatting
â”‚       â””â”€â”€ display.ts           # Display helpers (formatNaam, getMedal, etc)
â”‚
â”œâ”€â”€ hooks/                       # Custom React hooks (voor toekomst)
â”‚   # Later: useWedstrijd(), useStatistieken(), useTeamData(), etc.
â”‚
â”œâ”€â”€ types/
â”‚   â””â”€â”€ index.ts                 # Type definitions (Speler, Wedstrijd, Seizoen, etc)
â”‚
â”œâ”€â”€ firebase/
â”‚   â””â”€â”€ firebaseService.ts       # Firebase auth & Firestore (v2 structuur)
â”‚
â”œâ”€â”€ App.tsx                      # Hoofd component (routing/navigation)
â”œâ”€â”€ main.tsx                     # Entry point
â””â”€â”€ index.css                    # Globale CSS
```

### Structuur Logica v2

- **`screens/`**: Volledige pagina's die navigeerbaar zijn (via App.tsx router)
  - **BELANGRIJK**: Elke screen die wedstrijden/statistieken gebruikt, moet `seizoenId` doorvragen/selecteren
- **`components/`**: Herbruikbare UI componenten en sub-features voor wedstrijden, team, etc.
- **`utils/`**: Herbruikbare business logic
  - **`calculations/`**: Berekeningen (speelminuten, keeper stats, doelpunten)
  - **`validators/`**: Regelchecks en validaties
  - **`formatters/`**: Gegevens formatting voor display
- **`hooks/`**: Custom React hooks (placeholder voor toekomstige expansie)
- **`types/`**: TypeScript interfaces en types
- **`firebase/`**: Backend service voor auth en database (met v2 structuur)
- **`App.tsx`**: Router en state management

## ðŸ“Š Data Types

### Speler
```typescript
interface Speler {
  id: number
  naam: string
  type: 'vast' | 'gast'
  team?: string
  createdAt: string
  updatedAt: string
}
```

### Seizoen
```typescript
interface Seizoen {
  seizoenId: string
  naam: string
  startDatum: string
  eindDatum: string
  status: 'actief' | 'gearchiveerd'
  createdAt: string
  updatedAt: string
}
```

### Wedstrijd
```typescript
interface Wedstrijd {
  id: number
  datum: string
  tegenstander: string
  thuisUit: 'thuis' | 'uit'
  formatie: string
  type?: 'competitie' | 'oefenwedstrijd'
  afwezigeSpelers?: number[]
  notities?: string
  themas?: string[]
  isAfgelast?: boolean
  createdAt: string
  updatedAt: string
}
```

### Kwart
```typescript
interface Kwart {
  nummer: number (1-4)
  opstelling: { [positie: string]: string }
  wissels?: Wissel[]
  minuten?: number
  aantekeningen?: string
  doelpunten?: Doelpunt[]
  themaBeoordelingen?: { [themaId: string]: 'goed' | 'beter' | null }
  observaties?: string[]
  updatedAt: string
}
```

### Coach
```typescript
interface Coach {
  uid: string
  email: string
  naam: string
  teamIds: string[]
  rol: 'admin' | 'coach' | 'viewer'
  createdAt: string
}
```

## âš™ï¸ Configuratie

### Wedstrijdthema's
```typescript
const WEDSTRIJD_THEMAS = {
  aanvallend: ['Aanvallen', 'Kansen afmaken', 'Vrijlopen', 'Touwtjes'],
  verdedigend: ['Verdedigen', 'Druk zetten', 'Compact blijven'],
  algemeen: ['Omschakelen', 'Balbezit', 'Communicatie', 'Positiespel', 'Inzet']
}
```

### Kwart Timing
- Minuten per kwart: 12,5
- Wissel timing: 6,25 minuten
- Aantal kwarten: 4
- Totale wedstrijdduur: 50 minuten

## ðŸ”‘ Veiligheid & Privacy

- Gegevens versleuteld in Firebase
- Team-based access control (v2: multi-team per coach)
- Coaches kunnen alleen hun eigen teams zien (via `coach.teamIds`)
- Email-based authentication
- Secure coach invitatie systeem
- Seizoen-level data isolation

## ðŸ“± Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## âš¡ Performance

- Lazy loading componenten
- Optimized render performance
- Firebase real-time updates (onSnapshot)
- Efficient state management
- Offline caching
- Batch operations voor bulk updates

## ðŸŽ“ Regels & Logica

### Wedstrijdtype
- **Competitie:** OfficiÃ«le wedstrijden
- **Oefenwedstrijd:** Training matches

### Formatie Keuze
- **6x6:** Kleinere teams (U12-U14)
- **8x8:** Grotere teams (U15+)

### Wissel Timing
- Automatisch na 6,25 minuten per kwart
- Spelers kunnen meerdere keren wisselen
- Positie verandering = nieuwe wissel

### Regelchecks
1. **Keeper-wissel regel:** Keeper moet vÃ³Ã³r OF na keeper-beurt spelen (niet direct eropvolgend)
2. **Dubbele bank regel:** Speler mag max 1 kwart achter elkaar op de bank zitten
3. **Invaller-bank regel:** Invaller mag niet direct in volgende kwart op bank

## ðŸ›  Troubleshooting

### Data wordt niet gesynchroniseerd
- Check internet verbinding
- Controleer Firebase configuratie
- Logout en login opnieuw
- Check browser console op errors
- Controleer seizoenId in state

### Filter werkt niet
- Refresh de pagina
- Clear browser cache
- Check of wedstrijdtype correct is ingesteld
- Check of seizoen geselecteerd is

### Spelers verschijnen niet
- Voeg spelers toe in Team tab
- Zorg dat ze niet als "afwezig" staan
- Refresh de pagina
- Check of speler type correct is (vast/gast)

### Wissels dropdown leeg
- Zorg dat spelers op de bank staan
- Check of veld volledig is ingevuld
- Refresh en probeer opnieuw
- Controleer afwezigeSpelers array

### Seizoen functies breken
- Zorg dat seizoenId wordt doorgegeven
- Check of seizoen status 'actief' is
- Controleer startDatum en eindDatum

### Coach invitatie werkt niet (v3.1)
- Zorg dat email adres juist is
- Coach moet accepteren invitatie via link
- Invite links zijn 7 dagen geldig
- Check FirebaseError: "Missing or insufficient permissions" → Update Firebase rules
- Zorg dat coach document in Firestore bestaat
- Invite wordt automatisch geaccepteerd na login
- Zorg dat coach niet al in team zit

## ðŸ“ Development

```bash
# Watch mode
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Type check
npx tsc --noEmit
```

## ðŸ“‹ API Reference - Firebase Service Functions

### Team Functions
- `getTeam(teamId)` - Get team data
- `updateTeam(teamId, updates)` - Update team info
- `updateTeamInfo(teamId, clubNaam, teamNaam)` - Update club/team names

### Speler Functions (geen seizoenId nodig)
- `getSpelers(teamId)` - Get all players
- `addSpeler(teamId, speler)` - Add new player
- `updateSpeler(teamId, spelerId, updates)` - Update player
- `deleteSpeler(teamId, spelerId)` - Delete player
- `onSpelersChange(teamId, callback)` - Real-time speler updates

### Seizoen Functions
- `getSeizoenen(teamId)` - Get all seasons
- `addSeizoenen(teamId, seizoen)` - Add new season
- `updateSeizoenen(teamId, seizoenId, updates)` - Update season
- `deleteSeizoenen(teamId, seizoenId)` - Delete season

### Wedstrijd Functions (REQUIRES seizoenId!)
- `getWedstrijden(teamId, seizoenId, type?, sortOrder?)` - Get matches
- `addWedstrijd(teamId, seizoenId, wedstrijd)` - Add new match
- `updateWedstrijd(teamId, seizoenId, wedstrijdId, updates)` - Update match
- `deleteWedstrijd(teamId, seizoenId, wedstrijdId)` - Delete match
- `onWedstrijdenChange(teamId, seizoenId, callback)` - Real-time match updates
- `saveWedstrijdenInBatch(teamId, seizoenId, wedstrijden)` - Batch save

### Kwart Functions (REQUIRES seizoenId + wedstrijdId!)
- `updateKwart(teamId, seizoenId, wedstrijdId, kwartNum, updates)` - Update quarter

### Statistieken Functions (REQUIRES seizoenId!)
- `getStatistieken(teamId, seizoenId)` - Get season stats
- `updateStatistieken(teamId, seizoenId, statistieken)` - Update stats

### Coach Functions
- `registerCoach(email, password, naam)` - Register new coach
- `loginCoach(email, password)` - Login coach
- `logoutCoach()` - Logout coach
- `getCurrentCoach(callback)` - Get current logged-in coach

### Coach Invite Functions (v3.1)
- `inviteCoach(teamId, email, invitedByUid)` - Create invite link (7-day expiry)
- `getInviteById(inviteId)` - Get invite details and check expiration
- `acceptInvite(inviteId, userUid, teamId)` - Accept invitation and add coach to team
- `revokeInvite(inviteId)` - Revoke pending invite
- `getTeamCoaches(teamId)` - Get all coaches for a team
- `removeCoachFromTeam(teamId, coachUid, currentUserUid)` - Remove coach from team
- `getPendingInvitesByTeam(teamId)` - Get all pending invites for a team

## ðŸš€ Toekomstige Features

- **Phase 2 v3.1 - Coach Beheer (COMPLEET)**
  - ✅ Invite links genereren
  - ✅ Coaches registreren via link
  - ✅ Auto-accept na login
  - ✅ Wachtende invites tonen
  - ✅ Actieve coaches tonen
  - ✅ Invites intrekken
  - ⏳ Email invite sturen (TODO)
  - ⏳ Coaches verwijderen (permission issue - TODO)

- **Phase 3 - Rollen & Permissions (PLANNED)**
  - Admin vs Coach roles
  - Role-based access control
  - Coach removal restrictions
  - Permission management UI

- **Toekomstige uitbreidingen:**
- PDF/Excel export van statistieken
- Assist tracking
- Kaarten systeem (geel/rood)
- Man of the Match voting
- Live score sharing (URL)
- Seizoensstatistieken (top scorers per seizoen)
- Video integratie
- Mobile app versie
- Push notifications
- Team charts en grafische statistieken

## ðŸ“œ Licentie

MIT License

## ðŸ¤ Contact & Support

Voor vragen of bugs:
1. Check Help scherm in app
2. Controleer README & FAQ
3. Open een issue op GitHub

## ðŸŽ–ï¸ Credits

Gebouwd voor coaches die:
- Hun tijd willen besparen op administratie
- Eerlijk speeltijd willen verdelen
- Speler prestaties willen tracken
- Hun team willen optimaliseren
- Gestructureerd wedstrijden willen evalueren
- Meerdere seizoenen willen beheren
- Met meerdere coaches willen samenwerken

---

**Gemaakt met â¤ï¸ voor jeugdvoetbaltrainers**

Versie: 3.1 (November 2025 - Coach Beheer v3.1)
**Status:** Phase 2 Complete - Coach Invite System Working
