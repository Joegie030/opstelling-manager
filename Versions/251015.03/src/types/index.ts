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
  aantekeningen?: string;  // NIEUW: Notities per kwart
  doelpunten?: Doelpunt[];  // NIEUW: Doelpunten in dit kwart
}

export interface Wedstrijd {
  id: number;
  datum: string;
  tegenstander: string;
  thuisUit: 'thuis' | 'uit';
  formatie: '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8';
  kwarten: Kwart[];
  afwezigeSpelers?: number[];  // Array van speler IDs die afwezig zijn
  notities?: string;  // NIEUW: Algemene wedstrijd notities
}

export const formaties: Record<'6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8', string[]> = {
  '6x6-vliegtuig': ['Keeper', 'Achter', 'Links', 'Midden', 'Rechts', 'Voor'],
  '6x6-dobbelsteen': ['Keeper', 'Links achter', 'Rechts achter', 'Midden', 'Links voor', 'Rechts voor'],
  '8x8': ['Keeper', 'Links achter', 'Rechts achter', 'Links midden', 'Midden', 'Rechts midden', 'Links voor', 'Rechts voor']
};
