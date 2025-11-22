/**
 * formatieMapping.ts
 * 
 * Logica voor het slim remappen van spelers wanneer je van 
 * 6x6 Vliegtuig naar 6x6 Dobbelsteen gaat (of omgekeerd)
 */

/**
 * Mapping: 6x6 Vliegtuig → 6x6 Dobbelsteen
 * 
 * Vliegtuig posities → Dobbelsteen posities
 * - Keeper → Keeper (blijft)
 * - Achter → Links achter (vergelijkbare defensieve positie)
 * - Links → Links voor (zijkant naar voorkant)
 * - Rechts → Rechts voor (zijkant naar voorkant)
 * - Midden → Rechts achter (centraal naar rechts achter)
 * - Voor → Midden (aanvaller naar centraal)
 */
const MAPPING_VLIEGTUIG_TO_DOBBELSTEEN: Record<string, string> = {
  'Keeper': 'Keeper',
  'Achter': 'Links achter',
  'Links': 'Links voor',
  'Rechts': 'Rechts voor',
  'Midden': 'Rechts achter',
  'Voor': 'Midden'
};

/**
 * Mapping: 6x6 Dobbelsteen → 6x6 Vliegtuig
 * 
 * Dobbelsteen posities → Vliegtuig posities
 * - Keeper → Keeper (blijft)
 * - Links achter → Achter (defensief terug)
 * - Rechts achter → Midden (rechts naar centraal)
 * - Links voor → Links (voorkant naar zijkant)
 * - Rechts voor → Rechts (voorkant naar zijkant)
 * - Midden → Voor (centraal naar aanvaller)
 */
const MAPPING_DOBBELSTEEN_TO_VLIEGTUIG: Record<string, string> = {
  'Keeper': 'Keeper',
  'Links achter': 'Achter',
  'Rechts achter': 'Midden',
  'Links voor': 'Links',
  'Rechts voor': 'Rechts',
  'Midden': 'Voor'
};

/**
 * Map opstelling van Vliegtuig naar Dobbelsteen
 * 
 * @param huidigOpstelling - Huidge opstelling in Vliegtuig format
 * @returns Nieuwe opstelling in Dobbelsteen format met gemapt spelers
 */
export function mapOpstelling6x6VliegtuigNaarDobbelsteen(
  huidigOpstelling: Record<string, string>
): Record<string, string> {
  const nieuweOpstelling: Record<string, string> = {
    'Keeper': '',
    'Links achter': '',
    'Rechts achter': '',
    'Midden': '',
    'Links voor': '',
    'Rechts voor': ''
  };

  // Loop door huidge opstelling en map naar nieuwe posities
  Object.entries(huidigOpstelling).forEach(([positie, spelerId]) => {
    if (spelerId && MAPPING_VLIEGTUIG_TO_DOBBELSTEEN[positie]) {
      const nieuwePosit = MAPPING_VLIEGTUIG_TO_DOBBELSTEEN[positie];
      nieuweOpstelling[nieuwePosit] = spelerId;
    }
  });

  return nieuweOpstelling;
}

/**
 * Map opstelling van Dobbelsteen naar Vliegtuig
 * 
 * @param huidigOpstelling - Huidge opstelling in Dobbelsteen format
 * @returns Nieuwe opstelling in Vliegtuig format met gemapt spelers
 */
export function mapOpstelling6x6DobbelssteenNaarVliegtuig(
  huidigOpstelling: Record<string, string>
): Record<string, string> {
  const nieuweOpstelling: Record<string, string> = {
    'Keeper': '',
    'Achter': '',
    'Links': '',
    'Midden': '',
    'Rechts': '',
    'Voor': ''
  };

  // Loop door huidge opstelling en map naar nieuwe posities
  Object.entries(huidigOpstelling).forEach(([positie, spelerId]) => {
    if (spelerId && MAPPING_DOBBELSTEEN_TO_VLIEGTUIG[positie]) {
      const nieuwePosit = MAPPING_DOBBELSTEEN_TO_VLIEGTUIG[positie];
      nieuweOpstelling[nieuwePosit] = spelerId;
    }
  });

  return nieuweOpstelling;
}

/**
 * Reset opstelling - behoud alleen Keeper
 * 
 * @param huidigOpstelling - Huidge opstelling
 * @returns Leeg opstelling met alleen Keeper behouden
 */
export function resetOpstellingBehalveKeeper(
  huidigOpstelling: Record<string, string>,
  doelFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen'
): Record<string, string> {
  // Bepaal welke posities nodig zijn voor doel formatie
  const doelPosities = doelFormatie === '6x6-vliegtuig'
    ? ['Keeper', 'Achter', 'Links', 'Midden', 'Rechts', 'Voor']
    : ['Keeper', 'Links achter', 'Rechts achter', 'Midden', 'Links voor', 'Rechts voor'];

  // Maak lege opstelling met Keeper behouden
  const nieuweOpstelling: Record<string, string> = {};
  doelPosities.forEach(pos => {
    if (pos === 'Keeper') {
      nieuweOpstelling[pos] = huidigOpstelling['Keeper'] || '';
    } else {
      nieuweOpstelling[pos] = '';
    }
  });

  return nieuweOpstelling;
}

/**
 * Bepaal welke mapping functie te gebruiken op basis van van/naar formatie
 * 
 * @param vanFormatie - Huidge formatie variant
 * @param naarFormatie - Doelformatie variant
 * @param huidigOpstelling - Huidge opstelling
 * @param strategie - 'smartmap' of 'reset'
 * @returns Nieuwe mapped/reset opstelling
 */
export function bepaalNieuweOpstelling(
  vanFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen',
  naarFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen',
  huidigOpstelling: Record<string, string>,
  strategie: 'smartmap' | 'reset'
): Record<string, string> {
  // Reset strategie
  if (strategie === 'reset') {
    return resetOpstellingBehalveKeeper(huidigOpstelling, naarFormatie);
  }

  // Smartmap strategie
  if (vanFormatie === '6x6-vliegtuig' && naarFormatie === '6x6-dobbelsteen') {
    return mapOpstelling6x6VliegtuigNaarDobbelsteen(huidigOpstelling);
  }

  if (vanFormatie === '6x6-dobbelsteen' && naarFormatie === '6x6-vliegtuig') {
    return mapOpstelling6x6DobbelssteenNaarVliegtuig(huidigOpstelling);
  }

  // Fallback: return as-is (mocht beide hetzelfde zijn)
  return huidigOpstelling;
}

/**
 * Debug helper: toon mapping visually
 */
export function debugMappingVisualize(
  vanFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen',
  naarFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen'
): void {
  const mapping = vanFormatie === '6x6-vliegtuig' && naarFormatie === '6x6-dobbelsteen'
    ? MAPPING_VLIEGTUIG_TO_DOBBELSTEEN
    : MAPPING_DOBBELSTEEN_TO_VLIEGTUIG;

  console.log(`📍 Mapping ${vanFormatie} → ${naarFormatie}:`);
  Object.entries(mapping).forEach(([van, naar]) => {
    console.log(`  ${van} → ${naar}`);
  });
}
