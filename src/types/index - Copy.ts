export interface Speler {
  id: number;
  naam: string;
  type?: 'vast' | 'gast';
  team?: string;
}

export interface Wissel {
  id: number;
  positie: string;
  wisselSpelerId: string;
}

// ✅ GECORRIGEERDE Doelpunt
export interface Doelpunt {
  id: number;
  thuisOf: 'thuis' | 'uit';      // ✅ CORRECT VELD NAAM
  doelpuntenmaker?: string;      // ✅ String (speler id), niet number
}

export interface Kwart {
  nummer: number;
  opstelling: Record<string, string>;
  wissels: Wissel[];
  minuten: number;
  aantekeningen?: string;
  doelpunten?: Doelpunt[];
  themaBeoordelingen?: Record<string, 'goed' | 'beter' | null>;
  observaties?: string[];
}

export interface Wedstrijd {
  id: number;
  datum: string;
  tegenstander: string;
  thuisUit: 'thuis' | 'uit';
  type?: 'competitie' | 'oefenwedstrijd';
  formatie: '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8';
  kwarten: Kwart[];
  afwezigeSpelers?: number[];
  notities?: string;
  themas?: string[];
  isAfgelast?: boolean;
}

export const formaties: Record<'6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8', string[]> = {
  '6x6-vliegtuig': ['Keeper', 'Achter', 'Links', 'Midden', 'Rechts', 'Voor'],
  '6x6-dobbelsteen': ['Keeper', 'Links achter', 'Rechts achter', 'Midden', 'Links voor', 'Rechts voor'],
  '8x8': ['Keeper', 'Links achter', 'Rechts achter', 'Links midden', 'Midden', 'Rechts midden', 'Links voor', 'Rechts voor']
};

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

export const ALLE_THEMAS = [
  ...WEDSTRIJD_THEMAS.aanvallend,
  ...WEDSTRIJD_THEMAS.verdedigend,
  ...WEDSTRIJD_THEMAS.algemeen
];

export const KWART_OBSERVATIES = [
  'Sterk kwart',
  'Zwaar kwart',
  'Veel kansen',
  'Goed verdedigd',
  'Goede inzet'
];
