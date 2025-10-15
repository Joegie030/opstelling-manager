# ⚽ Voetbal Opstelling Manager

Een moderne web applicatie voor het beheren van voetbalopstellingen, speeltijd tracking en keeperstatistieken voor jeugdteams.

## 🎯 Features

### Team Beheer
- ➕ Spelers toevoegen en verwijderen
- 📝 Club- en teamnaam instellen
- 💾 Automatisch opslaan in browser (localStorage)

### Wedstrijd Opstelling
- 🎮 **2 formaties**: 6x6 of 8x8
- ⏱️ **4 kwarten** van 12,5 minuten per wedstrijd
- 🔄 **Wissels systeem**: Wissel spelers na 6,25 minuten
- 🧤 **Keeper tracking**: Houd bij wie wanneer keeper staat
- ⚠️ **Intelligente waarschuwingen**:
  - Keeper mag niet direct voor/na zijn beurt op de bank
  - Detectie van spelers die nooit keeper zijn geweest
  - Waarschuwing bij spelers die te vaak op de bank zitten

### Statistieken & Overzichten
- 📊 **Per wedstrijd**: Speelminuten, wisselminuten en keeper-beurten
- 📈 **Totaal overzicht**: Cumulatieve statistieken over alle wedstrijden
- 🎯 **Positie statistieken**: Zie hoe vaak elke speler op welke positie speelt
- 🧤 **Keeper historie**: Volledige keeper statistieken per speler

## 🚀 Quick Start

### Vereisten
- Node.js (versie 18 of hoger)
- npm of yarn

### Installatie

```bash
# Clone de repository
git clone https://github.com/Joegie030/opstelling-manager.git

# Ga naar de project directory
cd opstelling-manager

# Installeer dependencies
npm install

# Start development server
npm run dev
```

De applicatie is nu beschikbaar op `http://localhost:5173`

## 🏗️ Tech Stack

- **Framework**: React 18 met TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Storage**: Browser localStorage

## 📁 Project Structuur

```
src/
├── App.tsx                          # Hoofdcomponent
├── types/
│   └── index.ts                     # TypeScript types & formaties
├── components/
│   ├── teambeheer.tsx              # Spelersbeheer
│   ├── wedstrijdopstelling.tsx     # Opstelling per kwart
│   └── statistieken.tsx            # Statistieken overzichten
└── main.tsx                         # Entry point
```

## 🎮 Gebruik

### 1. Team instellen
1. Ga naar de **👥 Team** tab
2. Voer je club- en teamnaam in
3. Voeg spelers toe aan je team

### 2. Wedstrijd aanmaken
1. Ga naar **➕ Nieuwe Wedstrijd**
2. Kies formatie (6x6 of 8x8)
3. Vul datum en tegenstander in
4. Klik op "Maak Wedstrijd"

### 3. Opstelling maken
1. Voor elk kwart:
   - Selecteer spelers voor elke positie
   - Voeg wissels toe indien nodig (na 6,25 min)
2. Let op de waarschuwingen:
   - ⭐ = Speler heeft voorrang (weinig gespeeld)
   - ⚠️ = Keeper-rust regel geschonden
   - 🪑 = Aantal keer op de bank

### 4. Statistieken bekijken
Ga naar **📊 Statistieken** voor:
- Wedstrijdoverzichten
- Totale speeltijd per speler
- Keeper statistieken
- Positie verdeling

## 🎨 Formaties

### 6x6 Formatie
```
     Keeper
      Achter
Links Midden Rechts
       Voor
```

Posities: Keeper, Achter, Links, Midden, Rechts, Voor

### 8x8 Formatie
```
        Keeper
Links achter  Rechts achter
Links midden Midden Rechts midden
Links voor    Rechts voor
```

Posities: Keeper, Links achter, Rechts achter, Links midden, Midden, Rechts midden, Links voor, Rechts voor

## 🔧 Development

```bash
# Development server met hot reload
npm run dev

# Type checking
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

Het project is geconfigureerd voor automatische deployment op Vercel:

1. Push naar de `main` branch
2. Vercel bouwt en deployt automatisch
3. Live URL: [Je Vercel URL hier]

### Handmatige deployment via Vercel CLI
```bash
# Installeer Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📝 Regels & Logica

### Keeper-rust regel
Een speler die keeper staat, mag **niet** direct in het kwart ervoor of erna op de wisselbank zitten. Dit voorkomt dat keepers te weinig rust krijgen.

### Prioriteit systeem
Spelers krijgen een ⭐ als ze:
- Minder hebben gespeeld dan anderen
- Nog nooit keeper zijn geweest (bij keeper positie)
- Vaak op de wisselbank hebben gezeten

### Speeltijd berekening
- **Hele kwart gespeeld**: 12,5 minuten
- **Met wissel na 6,25 min**: 6,25 minuten per speler
- **Op de bank**: 0 minuten (telt als wisselbeurt)

## 🐛 Bekende Beperkingen

- Data wordt alleen lokaal opgeslagen (geen cloud sync tussen apparaten)
- Browser cache wissen verwijdert alle data
- Geen export functionaliteit naar Excel/PDF (nog niet geïmplementeerd)

## 📋 Toekomstige Features

- [ ] Data export (PDF/Excel)
- [ ] Cloud opslag (Firebase/Supabase)
- [ ] Multi-device sync
- [ ] Seizoensstatistieken
- [ ] Wedstrijdverslagen
- [ ] Print-vriendelijke opstellingen
- [ ] Speler foto's toevoegen

## 🤝 Bijdragen

Suggesties en verbeteringen zijn welkom! Open een issue of pull request.

## 📄 Licentie

Dit project is open source en beschikbaar onder de MIT License.

## 👤 Auteur

**Joegie030**
- GitHub: [@Joegie030](https://github.com/Joegie030)

## 💡 Support

Voor vragen of problemen:
1. Check de [Issues](https://github.com/Joegie030/opstelling-manager/issues)
2. Open een nieuw issue met gedetailleerde beschrijving
3. Deel screenshots indien mogelijk

---

**Gemaakt met ❤️ voor jeugdvoetbal coaches en teammanagers**
