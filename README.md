# Joegie - Formation Manager

Een moderne web applicatie voor het beheren van team opstellingen, speeltijd tracking en statistieken. Gebouwd voor jeugdvoetbal met focus op eerlijke speeltijdverdeling en systematische evaluatie.

## 🎯 Features

### Team Management
- Spelers toevoegen (vaste leden en gasten)
- Club- en teamnaam instellen
- **Multi-coach support** met Firebase synchronisatie
- **Coach invitatie systeem** voor samenwerking op hetzelfde team
- Team-based access control (coaches zien alleen hun team)

### Wedstrijd Planning
- Datum en tegenstander registreren
- Wedstrijdtype selecteren (Competitie of Oefenwedstrijd)
- Formatie kiezen: 6x6 (Vliegtuig/Dobbelsteen) of 8x8
- Thuis/Uit onderscheiding
- **Wedstrijdnotities** (inklapbaar)
- Kopieerfunctie voor wedstrijdoverzicht (met datum/tegenstander modal)

### Opstellingen per Wedstrijd
- **4 kwarten à 12,5 minuten** elk (totaal 50 minuten)
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
- Top scorers overzicht met medailles (🥇🥈🥉)
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
  - Keeper-wissel regel: Keeper moet vóór of na keeper-beurt spelen (niet direct achter)
  - Dubbele bank regel: Speler mag max 1 kwart achter elkaar op de bank
  - Invaller-bank regel: Invaller mag niet direct daarna op de bank

## 📐 Formaties

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

## 📱 UI/UX Highlights

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

## 🔐 Authentication & Multi-Tenant

- Firebase Authentication (Email/wachtwoord)
- Team-based access control
- Multiple coaches per team
- Coach invitatie systeem
- Firestore Security Rules enforcing team isolation
- Real-time sync across all coaches

## 💾 Database & Opslag

### Cloud Storage
- Automatische synchronisatie naar Firebase
- Real-time updates tussen coaches
- Spelers, wedstrijden, team info

### Offline Support
- Cached data beschikbaar offline
- Sync wanneer verbinding hersteld

### Data Structure
```
- teams/{teamId}
  - Teaminfo (naam, club, coaches)
  - Spelers
  - Wedstrijden
  - Statistieken
```

## 📊 Statistieken Berekening

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
- Top 3 krijgt medailles (🥇🥈🥉)

### Team Prestaties
- Doelpunten voor/tegen
- Doelsaldo
- Wins/draws/losses
- Winst percentage

## 🎮 Workflow

### 1. Team Inrichten
1. Navigeer naar Team tab
2. Stel club- en teamnaam in
3. Voeg spelers toe (vaste spelers of gasten)
4. Nodig coaches uit (optioneel voor meerdere coaches)

### 2. Wedstrijd Aanmaken
1. Klik "Nieuwe Wedstrijd"
2. Vul in:
   - Datum
   - Tegenstander
   - Thuis/Uit
   - Wedstrijdtype (Competitie/Oefenwedstrijd)
3. Selecteer formatie (6x6 of 8x8)
4. Klik "Maak Wedstrijd"

### 3. Opstelling Samenstellen (Per Kwart)
1. Selecteer spelers voor elke positie
2. Kijk regelchecks onderaan kwart
3. Voeg wissels toe (na 6,25 min)
4. Markeer afwezige spelers
5. Herhaal voor kwart 2, 3, 4

### 4. Score Bijhouden (Live)
1. Klik "Wij scoren" of "Zij scoren"
2. Selecteer doelpuntenmaker (optioneel)
3. Score update automatisch
4. Doelpunten verschijnen in live tracker

### 5. Wedstrijd Evalueren
1. Selecteer relevante wedstrijdthema's
2. Per kwart: evalueer thema's (Goed/Kan beter)
3. Voeg observaties toe
4. Optioneel: vrije notities

### 6. Statistieken Bekijken
1. Ga naar Statistieken tab
2. Bekijk:
   - Wedstrijdoverzicht met filters
   - Speeltijd per speler
   - Topscorers
   - Team prestaties

## 🚀 Installatie & Deployment

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

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/{teamId} {
      allow read, write: if request.auth.uid in resource.data.coaches;
    }
    match /teams/{teamId}/spelers/{doc=**} {
      allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
    }
    match /teams/{teamId}/wedstrijden/{doc=**} {
      allow read, write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.coaches;
    }
  }
}
```

## 🛠️ Utilities & Helper Functions

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
  - Keeper-wissel regel: Keeper moet vóór of na keeper-beurt spelen
  - Dubbele bank regel: Max 1 kwart achter elkaar op bank
  - Invaller-bank regel: Invaller mag niet direct daarna op bank
- `checkAfwezigeInOpstelling()` - Controleer afwezige spelers niet in opstelling

### Formatters (`utils/formatters/`)

**`display.ts`** - Display helpers voor consistent UI
- `getFormatieNaam(formatie)` - "6x6 Vliegtuig", "8x8", etc. → Gebruikt in WedstrijdOverzicht, App
- `getTypeNaam(type)` - "Competitie" of "Oefenwedstrijd" → Gebruikt in WedstrijdOverzicht
- `formatResultaat(eigenDoelpunten, tegenstanderDoelpunten)` - Match result met emoji → Kan gebruikt worden in WedstrijdSamenvatting

**Opmerking:** Nieuwe formatters worden ALLEEN toegevoegd als we ze nodig hebben in de code, niet preemptief.

## 🚀 Phase-Based Development

### ✅ Phase 1 & 2: Compleet (Oktober 2025)
- ✅ Folder herstructurering (screens/ + components/)
- ✅ Utilities geextraheerd (calculations, validators, formatters)
- ✅ Imports bijgewerkt

### 🔮 Phase 3: Custom Hooks (Toekomst)
Wanneer je later meer complexe state nodig hebt:
- `useWedstrijd()` - Wedstrijd data & state
- `useStatistieken()` - Statistic calculations & filtering
- `useTeamData()` - Team management logic
- `useAuth()` - Authentication state

### 🎯 Phase 4: Componenten Splitsen (Later)
Als componenten te groot worden:
- `WisselForm.tsx` - Wissel formulier geextraheerd
- `OpstellingGrid.tsx` - Opstelling grid component
- `SpelerSelectieModal.tsx` - Speler selectie modal
- `RegelChecks.tsx` - Regelchecks display

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Firebase (Auth + Firestore)
- **Hosting:** Vercel
- **Version Control:** Git/GitHub

## 📁 Project Structuur

```
src/
├── screens/                     # Alle main pagina's/schermen
│   ├── AuthScreen.tsx           # Login/Register
│   ├── WedstrijdOverzicht.tsx   # Wedstrijdenlijst
│   ├── WedstrijdOpstelling.tsx  # Opstelling editor (Phase: kan gesplitst worden)
│   ├── Statistieken.tsx         # Statistieken overzicht
│   ├── TeamBeheer.tsx           # Spelers beheer
│   └── Instellingen.tsx         # Settings & admin
│
├── components/                  # Feature-specifieke componenten
│   ├── Navigation.tsx           # Header & menu
│   ├── WedstrijdHeader.tsx      # Header in wedstrijd
│   ├── WedstrijdSamenvatting.tsx # Wedstrijd samenvatting
│   ├── ScoreTracking.tsx        # Score bijhouden component
│   ├── VoetbalVeld.tsx          # Interactief veld
│   ├── WedstrijdContext.tsx     # Context provider
│   └── InviteCoaches.tsx        # Coach invitatie
│
├── utils/                       # Herbruikbare helper functies
│   ├── calculations/            # Berekeningen
│   │   ├── speelminuten.ts      # Speeltijd berekeningen
│   │   ├── keeper.ts            # Keeper statistieken
│   │   └── doelpunten.ts        # Doelpunten en scoring
│   ├── validators/              # Validatie logica
│   │   └── opstelling.ts        # Regelchecks (keeper, wissels, etc)
│   └── formatters/              # Gegevens formatting
│       └── display.ts           # Display helpers (formatNaam, getMedal, etc)
│
├── hooks/                       # Custom React hooks (voor toekomst)
│   # Later: useWedstrijd(), useStatistieken(), useTeamData(), etc.
│
├── types/
│   └── index.ts                 # Type definitions (Speler, Wedstrijd, etc)
│
├── firebase/
│   └── firebaseService.ts       # Firebase auth & Firestore
│
├── App.tsx                      # Hoofd component (routing/navigation)
├── main.tsx                     # Entry point
└── index.css                    # Globale CSS
```

### Structuur Logica

- **`screens/`**: Volledige pagina's die navigeerbaar zijn (via App.tsx router)
- **`components/`**: Herbruikbare UI componenten en sub-features voor wedstrijden, team, etc.
- **`utils/`**: Herbruikbare business logic
  - **`calculations/`**: Berekeningen (speelminuten, keeper stats, doelpunten)
  - **`validators/`**: Regelchecks en validaties
  - **`formatters/`**: Gegevens formatting voor display
- **`hooks/`**: Custom React hooks (placeholder voor toekomstige expansie)
- **`types/`**: TypeScript interfaces en types
- **`firebase/`**: Backend service voor auth en database
- **`App.tsx`**: Router en state management

## 📊 Data Types

### Speler
```typescript
interface Speler {
  id: number
  naam: string
  minutenGespeeld: number
  keeperBeurten: number
  doelpunten: number
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
  kwarten: Kwart[]
  afwezigeSpelers?: number[]
  notities?: string
  themaFocus?: string[]
}
```

### Kwart
```typescript
interface Kwart {
  opstelling: { [positie: string]: string }
  wissels?: Wissel[]
  doelpunten?: Doelpunt[]
  evaluatie?: Evaluatie
  aantekeningen?: string
}
```

## ⚙️ Configuratie

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

## 🔒 Veiligheid & Privacy

- Gegevens versleuteld in Firebase
- Team-based access control
- Coaches kunnen alleen hun eigen team zien
- Email-based authentication
- Secure coach invitatie systeem

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## ⚡ Performance

- Lazy loading componenten
- Optimized render performance
- Firebase real-time updates
- Efficient state management
- Offline caching

## 🎓 Regels & Logica

### Wedstrijdtype
- **Competitie:** Officiële wedstrijden
- **Oefenwedstrijd:** Training matches

### Formatie Keuze
- **6x6:** Kleinere teams (U12-U14)
- **8x8:** Grotere teams (U15+)

### Wissel Timing
- Automatisch na 6,25 minuten per kwart
- Spelers kunnen meerdere keren wisselen
- Positie verandering = nieuwe wissel

### Regelchecks
1. **Keeper-wissel regel:** Keeper moet vóór OF na keeper-beurt spelen (niet direct eropvolgend)
2. **Dubbele bank regel:** Speler mag max 1 kwart achter elkaar op de bank zitten
3. **Invaller-bank regel:** Invaller mag niet direct in volgende kwart op bank

## 🐛 Troubleshooting

### Data wordt niet gesynchroniseerd
- Check internet verbinding
- Controleer Firebase configuratie
- Logout en login opnieuw
- Check browser console op errors

### Filter werkt niet
- Refresh de pagina
- Clear browser cache
- Check of wedstrijdtype correct is ingesteld

### Spelers verschijnen niet
- Voeg spelers toe in Team tab
- Zorg dat ze niet als "afwezig" staan
- Refresh de pagina

### Wissels dropdown leeg
- Zorg dat spelers op de bank staan
- Check of veld volledig is ingevuld
- Refresh en probeer opnieuw

### Coach invitatie werkt niet
- Zorg dat email adres juist is
- Coach moet accepteren invitatie
- Check spam folder voor invitatie email

## 📝 Development

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

## 🚀 Toekomstige Features

- PDF/Excel export van statistieken
- Assist tracking
- Kaarten systeem (geel/rood)
- Man of the Match voting
- Live score sharing (URL)
- Seizoensstatistieken
- Video integratieïon
- Mobile app versie

## 📜 Licentie

MIT License

## 🤝 Contact & Support

Voor vragen of bugs:
1. Check Help scherm in app
2. Controleer README & FAQ
3. Open een issue op GitHub

## 👏 Credits

Gebouwd voor coaches die:
- Hun tijd willen besparen op administratie
- Eerlijk speeltijd willen verdelen
- Speler prestaties willen tracken
- Hun team willen optimaliseren
- Gestructureerd wedstrijden willen evalueren

---

**Gemaakt met ❤️ voor jeugdvoetbaltrainers**

Versie: 2.5 (Oktober 2025)
