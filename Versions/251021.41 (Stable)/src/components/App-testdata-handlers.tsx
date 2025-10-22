// Voeg deze functies toe aan je App.tsx, binnen je App component:

// Testdata definitie
const TESTDATA_SPELERS = [
  'Jan Jansen',
  'Piet Pietersen',
  'Klaas de Vries',
  'Henk van Dam',
  'Dirk Bakker',
  'Sven Visser',
  'Lars de Jong',
  'Tim Peters',
  'Tom de Boer',
  'Mike van Dijk',
  'Max Smit',
  'Bob de Groot'
];

// Handler: Testdata laden
const laadTestdata = () => {
  const nieuweSpelers: Speler[] = TESTDATA_SPELERS.map((naam, index) => ({
    id: Date.now() + index,
    naam: naam
  }));
  
  setSpelers(nieuweSpelers);
  setClubNaam('VV Testteam');
  setTeamNaam('F1 - Oranje');
  
  // Optioneel: maak ook een test wedstrijd aan
  // maakTestWedstrijd(nieuweSpelers);
};

// Handler: Alles wissen
const wisAlles = () => {
  setSpelers([]);
  setWedstrijden([]);
  setClubNaam('Mijn Club');
  setTeamNaam('Team A');
};

// Optionele functie: Test wedstrijd aanmaken
const maakTestWedstrijd = (testSpelers: Speler[]) => {
  if (testSpelers.length < 8) return;
  
  const testWedstrijd: Wedstrijd = {
    id: Date.now(),
    datum: new Date().toISOString().split('T')[0],
    tegenstander: 'Tegenstander FC',
    formatie: '8x8',
    kwarten: [
      {
        nummer: 1,
        opstelling: {
          'Keeper': testSpelers[0].id.toString(),
          'Links achter': testSpelers[1].id.toString(),
          'Rechts achter': testSpelers[2].id.toString(),
          'Links midden': testSpelers[3].id.toString(),
          'Midden': testSpelers[4].id.toString(),
          'Rechts midden': testSpelers[5].id.toString(),
          'Links voor': testSpelers[6].id.toString(),
          'Rechts voor': testSpelers[7].id.toString()
        },
        wissels: [],
        minuten: 12.5
      },
      {
        nummer: 2,
        opstelling: {},
        wissels: [],
        minuten: 12.5
      },
      {
        nummer: 3,
        opstelling: {},
        wissels: [],
        minuten: 12.5
      },
      {
        nummer: 4,
        opstelling: {},
        wissels: [],
        minuten: 12.5
      }
    ]
  };
  
  setWedstrijden([testWedstrijd]);
};

// Dan in je return statement, update de TeamBeheer component:
<TeamBeheer
  clubNaam={clubNaam}
  teamNaam={teamNaam}
  spelers={spelers}
  onUpdateClubNaam={setClubNaam}
  onUpdateTeamNaam={setTeamNaam}
  onVoegSpelerToe={voegSpelerToe}
  onVerwijderSpeler={verwijderSpeler}
  onLaadTestdata={laadTestdata}
  onWisAlles={wisAlles}
/>
