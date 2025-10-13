export interface Speler {
  id: number;
  naam: string;
}

export interface Wissel {
  id: number;
  positie: string;
  wisselSpelerId: string;
}

export interface Kwart {
  nummer: number;
  opstelling: Record<string, string>;
  wissels: Wissel[];
  minuten: number;
}

export interface Wedstrijd {
  id: number;
  datum: string;
  tegenstander: string;
  formatie: '6x6' | '8x8';
  kwarten: Kwart[];
}

export const formaties: Record<'6x6' | '8x8', string[]> = {
  '6x6': ['Keeper', 'Achter', 'Links', 'Midden', 'Rechts', 'Voor'],
  '8x8': ['Keeper', 'Links achter', 'Rechts achter', 'Links midden', 'Midden', 'Rechts midden', 'Links voor', 'Rechts voor']
};