# Joegie - Formation Manager

Een moderne web applicatie voor het beheren van team opstellingen, speeltijd tracking en statistieken. Gebouwd voor voetbal, hockey en andere sporten.

## Features

### Team Management
- Spelers toevoegen (vaste leden en gasten)
- Club- en teamnaam instellen
- Automatische cloud synchronisatie (Firebase)

### Wedstrijd Planning
- Datum en tegenstander registreren
- Wedstrijdtype selecteren (Competitie of Oefenwedstrijd)
- Formatie kiezen: 6x6 (Vliegtuig/Dobbelsteen) of 8x8

### Opstellingen per Wedstrijd
- 4 kwarten à 12,5 minuten
- Spelers positioneren op het veld
- Wissels invoeren (automatisch na 6,25 minuten per kwart)
- Afwezige spelers markeren

### Score Tracking
- Real-time doelpunten registreren
- Doelpuntenmakers bijhouden
- Eindstand automatisch berekenen
- Wedstrijd notities voor context

### Statistieken
- Speeltijd per speler (in minuten)
- Doelpunten per speler
- Keeper-beurten bijhouden
- Top scorers overzicht
- Team prestaties (gewonnen/verloren/gelijkspel)
- Doelsaldo berekening

## Formaties

### 6x6 Formatie
```
     Keeper
     Achter
Links Midden Rechts
     Voor
```

### 6x6 Varianten
- Vliegtuig: Standaard
- Dobbelsteen: Voor gemengde groepen

### 8x8 Formatie
```
        Keeper
Links achter  Rechts achter
Links midden Midden Rechts midden
Links voor    Rechts voor
```

## Installatie

### Vereisten
- Node.js 18+
- npm of yarn

### Setup
```bash
# Clone repository
git clone <url>

# Installeer dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

## Technologie Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- Firebase (authentication & storage)
- Vercel (deployment)

## Project Structuur

```
src/
├── App.tsx                      # Hoofdcomponent
├── types/
│   └── index.ts                 # Type definitions
├── components/
│   ├── Navigation.tsx           # Header & menu
│   ├── WedstrijdOverzicht.tsx   # Wedstrijdenlijst
│   ├── WedstrijdOpstelling.tsx  # Opstelling editor
│   ├── Statistieken.tsx         # Statistieken
│   ├── TeamBeheer.tsx           # Spelers beheer
│   ├── Help.tsx                 # Help scherm
│   ├── teambeheer.tsx           # (Legacy)
│   └── ...
├── firebase/
│   └── firebaseService.ts       # Firebase integratie
└── main.tsx                     # Entry point
```

## Data Types

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
}
```

### Kwart
```typescript
interface Kwart {
  opstelling: { [positie: string]: string }
  wissels?: Wissel[]
  doelpunten?: Doelpunt[]
  aantekeningen?: string
}
```

### Doelpunt
```typescript
interface Doelpunt {
  id: number
  spelerId?: number
  type: 'eigen' | 'tegenstander'
}
```

## Workflow

### 1. Team Inrichten
1. Navigeer naar Team tab
2. Stel club- en teamnaam in
3. Voeg spelers toe (vaste spelers of gasten)

### 2. Wedstrijd Aanmaken
1. Klik "Nieuwe Wedstrijd"
2. Vul in:
   - Datum
   - Tegenstander
   - Thuis/Uit
   - Wedstrijdtype
3. Selecteer formatie (6x6 of 8x8)
4. Klik "Maak Wedstrijd"

### 3. Opstelling Samenstellen
1. Per kwart:
   - Spelers selecteren voor elke positie
   - Voeg wissels toe (na 6,25 min)
   - Markeer afwezige spelers
2. Voeg notities toe per kwart

### 4. Score Bijhouden (Live)
1. Klik "Wij scoren" of "Zij scoren"
2. Selecteer doelpuntenmaker
3. Score update automatisch
4. Doelpunten verschijnen in lijst

### 5. Statistieken Bekijken
1. Ga naar Statistieken tab
2. Bekijk:
   - Wedstrijdoverzicht
   - Speeltijd per speler
   - Topscorers
   - Team prestaties

## UI/UX Highlights

### Design
- Moderner, sport-agnostisch branding
- "Joegie" als brand name
- "Formation Manager" als subtitel
- Responsive design voor mobiel en desktop
- Compact wedstrijdkaarten

### Navigation
- Blauwe header met Joegie logo
- Horizontaal menu (desktop)
- Hamburger menu (mobiel)
- User profiel dropdown
- Help scherm in menu

### Wedstrijdoverzicht
- Filter op type (Competitie/Oefenwedstrijd)
- Compacte kaarten met:
  - Datum + Thuis/Uit badge
  - Matchup (wie tegen wie)
  - Type
  - Formatie
  - Bekijk/Kopieer/Verwijder buttons

### Help Scherm
- Getting Started (hoe app werken)
- Features (wat kan je doen)
- Versie info (over de app)
- Pro Tips (handige hints)

## Automatische Cloud Sync

Data wordt automatisch gesynchroniseerd naar Firebase:
- Spelers
- Wedstrijden
- Team informatie

Geen handmatig opslaan nodig - alles werkt real-time.

## Authentication

- Firebase Authentication
- Email/wachtwoord login
- Team-based access control
- Multiple coaches per team

## Filter & Zoeken

### Wedstrijdfilter
- Alle wedstrijden
- Alleen competitie
- Alleen oefenwedstrijden

### Automatische Sortering
- Komende wedstrijden (chronologisch)
- Gespeelde wedstrijden (nieuwste eerst)

## Statistieken Berekening

### Speeltijd
- Volledige kwart: 12,5 minuten
- Met wissel: 6,25 minuten
- Op bank: 0 minuten (telt als wissel)

### Topscorers
- Totale doelpunten over alle wedstrijden
- Gesorteerd descending
- Top 3 krijgt medailles (🥇🥈🥉)

### Team Prestaties
- Doelpunten voor/tegen
- Doelsaldo
- Wins/draws/losses
- Winst percentage

## Keyboard & Accessibility

- Tab navigatie ondersteund
- Enter om te submitten
- Escape om modals te sluiten
- Mobile-friendly touch targets

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Lazy loading componenten
- Optimized render performance
- Firebase real-time updates
- Efficient state management

## Data Persistence

- Cloud storage via Firebase
- Automatic sync
- Real-time updates across devices
- Offline support (cached)

## Toekomstige Features

- PDF/Excel export
- Video tutorials
- Assist tracking
- Kaarten systeem (geel/rood)
- Man of the Match voting
- Live score sharing
- Multiple teams per coach
- Seizoensstatistieken

## Troubleshooting

### Data wordt niet gesynchroniseerd
- Check internet verbinding
- Controleer Firebase configuratie
- Logout en login opnieuw

### Filter werkt niet
- Refresh de pagina
- Clear browser cache
- Check of wedstrijdtype correct is ingesteld

### Spelers verschijnen niet
- Voeg spelers toe in Team tab
- Zorg dat ze niet als "afwezig" staan
- Refresh de pagina

## Development

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

## Deployment

Automatische deployment op Vercel bij push naar main branch.

Handmatige deployment:
```bash
npm run build
vercel deploy --prod
```

## Regels & Logica

### Wedstrijdtype
- Competitie: Officiële wedstrijden
- Oefenwedstrijd: Training matches

### Formatie Keuze
- 6x6: Kleinere teams (U12-U14)
- 8x8: Grotere teams (U15+)

### Wissel Timing
- Automatisch na 6,25 minuten per kwart
- Spelers kunnen meerdere keren wisselen
- Positie verandering = nieuwe wissel

## Compatibiliteit

### Sporten
- Voetbal (standaard)
- Hockey (opstellingen aanpassen)
- Handball
- Andere teamsporten

### Devices
- Desktop (1024px+)
- Tablet (768px+)
- Mobiel (360px+)

## Licentie

MIT License

## Contact & Support

Voor vragen of bugs:
1. Check Help scherm in app
2. Controleer FAQ in documentation
3. Open een issue op GitHub

## Credits

Gebouwd voor coaches die:
- Hun tijd willen besparen op administratie
- Eerlijk speeltijd willen verdelen
- Speler prestaties willen tracken
- Hun team willen optimaliseren

---

**Gemaakt met ❤️ voor coaches in alle sporten**

Versie: 2.0 (Oktober 2025)
