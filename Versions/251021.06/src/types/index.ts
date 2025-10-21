export interface Speler {
  id: number;
  naam: string;
}

export interface Wissel {
  id: number;
  positie: string;
  wisselSpelerId: string;
}

// NIEUW: Doelpunt interface voor score tracking
export interface Doelpunt {
  id: number;
  spelerId?: number;  // Optioneel - alleen voor eigen doelpunten
  type: 'eigen' | 'tegenstander';
  tijdstip?: string;  // Optioneel - voor toekomstige uitbreiding
}

export interface Kwart {
  nummer: number;
  opstelling: Record<string, string>;
  wissels: Wissel[];
  minuten: number;
  aantekeningen?: string;  // Vrije tekst notities per kwart
  doelpunten?: Doelpunt[];  // Doelpunten in dit kwart
  themaBeoordelingen?: Record<string, 'goed' | 'beter' | null>;  // Beoordeling van wedstrijdthema's
  observaties?: string[];  // Algemene observaties (tags)
}

export interface Wedstrijd {
  id: number;
  datum: string;
  tegenstander: string;
  thuisUit: 'thuis' | 'uit';
  formatie: '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8';
  kwarten: Kwart[];
  afwezigeSpelers?: number[];  // Array van speler IDs die afwezig zijn
  notities?: string;  // Vrije tekst notities
  themas?: string[];  // Geselecteerde thema's voor deze wedstrijd
}

export const formaties: Record<'6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8', string[]> = {
  '6x6-vliegtuig': ['Keeper', 'Achter', 'Links', 'Midden', 'Rechts', 'Voor'],
  '6x6-dobbelsteen': ['Keeper', 'Links achter', 'Rechts achter', 'Midden', 'Links voor', 'Rechts voor'],
  '8x8': ['Keeper', 'Links achter', 'Rechts achter', 'Links midden', 'Midden', 'Rechts midden', 'Links voor', 'Rechts voor']
};

// Wedstrijd thema's voor focus/training
export const WEDSTRIJD_THEMAS = {
  aanvallend: [
    { id: 'aanvallen', label: 'Aanvallen opbouwen', emoji: '🎯' },
    { id: 'afmaken', label: 'Kansen afmaken', emoji: '⚽' },
    { id: 'vrijlopen', label: 'Vrijlopen zonder bal', emoji: '🏃' },
    { id: 'touwtjes', label: 'Touwtjes maken', emoji: '🔗' }
  ],
  verdedigend: [
    { id: 'verdedigen', label: 'Verdedigen', emoji: '🛡️' },
    { id: 'drukzetten', label: 'Druk zetten', emoji: '⚡' },
    { id: 'compact', label: 'Compact blijven', emoji: '🧱' }
  ],
  algemeen: [
    { id: 'omschakelen', label: 'Snel omschakelen', emoji: '🔄' },
    { id: 'balbezit', label: 'Balbezit houden', emoji: '🎾' },
    { id: 'communicatie', label: 'Communicatie', emoji: '💬' },
    { id: 'positiespel', label: 'Positiespel', emoji: '📍' },
    { id: 'inzet', label: 'Inzet/Fighting spirit', emoji: '💪' }
  ]
};

// Alle thema's in één platte array
export const ALLE_THEMAS = [
  ...WEDSTRIJD_THEMAS.aanvallend,
  ...WEDSTRIJD_THEMAS.verdedigend,
  ...WEDSTRIJD_THEMAS.algemeen
];

// Algemene observaties per kwart
export const KWART_OBSERVATIES = [
  { id: 'sterk', label: 'Sterk kwart', emoji: '🔥' },
  { id: 'zwaar', label: 'Zwaar kwart', emoji: '😓' },
  { id: 'kansen', label: 'Veel kansen', emoji: '⚽' },
  { id: 'goedverdedigd', label: 'Goed verdedigd', emoji: '🧱' },
  { id: 'goedeinzet', label: 'Goede inzet', emoji: '💪' }
];
