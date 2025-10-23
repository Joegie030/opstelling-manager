/**
 * Formatters - Transform raw data into display-friendly formats
 * Used across all components for consistent presentation
 */

/**
 * Formats formation name with emoji and display text
 */
export function getFormatieNaam(formatie: string): string {
  const namen: Record<string, string> = {
    '6x6': '✈️ 6x6 Vliegtuig',
    '6x6-vliegtuig': '✈️ 6x6 Vliegtuig',
    '6x6-dobbelsteen': '🎲 6x6 Dobbelsteen',
    '8x8': '⚽ 8x8'
  };
  return namen[formatie] || formatie;
}

/**
 * Formats match type with emoji and display text
 */
export function getTypeNaam(type?: string): string {
  const namen: Record<string, string> = {
    'competitie': '🏆 Competitie',
    'oefenwedstrijd': '🎯 Oefenwedstrijd'
  };
  return type ? namen[type] : '📋 Overig';
}

/**
 * Formats home/away indicator with emoji
 */
export function getThuisUitBadge(thuisUit: 'thuis' | 'uit'): string {
  return thuisUit === 'thuis' ? '🏠 Thuis' : '✈️ Uit';
}

/**
 * Formats match result with emoji and text
 */
export function formatResultaat(eigenDoelpunten: number, tegenstanderDoelpunten: number) {
  if (eigenDoelpunten > tegenstanderDoelpunten) {
    return { 
      emoji: '✅', 
      text: 'gewonnen',
      color: 'bg-green-100 border-green-400'
    };
  } else if (eigenDoelpunten < tegenstanderDoelpunten) {
    return { 
      emoji: '❌', 
      text: 'verloren',
      color: 'bg-red-100 border-red-400'
    };
  } else {
    return { 
      emoji: '🤝', 
      text: 'gelijkspel',
      color: 'bg-gray-100 border-gray-400'
    };
  }
}

/**
 * Formats time in minutes to readable format
 * e.g. 12.5 → "12:30", 6.25 → "6:15"
 */
export function formatMinuten(minuten: number): string {
  const minutes = Math.floor(minuten);
  const seconds = Math.round((minuten - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats date to Dutch locale
 */
export function formatDatum(datum: string): string {
  try {
    const date = new Date(datum);
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return datum;
  }
}

/**
 * Formats date and time to Dutch locale
 */
export function formatDatumTijd(datum: string): string {
  try {
    const date = new Date(datum);
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return datum;
  }
}

/**
 * Formats player name - capitalize first letter
 */
export function formatSpelerNaam(naam: string): string {
  if (!naam) return '';
  return naam.charAt(0).toUpperCase() + naam.slice(1).toLowerCase();
}

/**
 * Formats percentage with optional decimal places
 */
export function formatPercentage(waarde: number, decimals: number = 0): string {
  return (Math.round(waarde * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals) + '%';
}

/**
 * Formats score like "3 - 2"
 */
export function formatScore(eigenDoelpunten: number, tegenstanderDoelpunten: number): string {
  return `${eigenDoelpunten} - ${tegenstanderDoelpunten}`;
}

/**
 * Formats position names with consistent casing
 */
export function formatPositie(positie: string): string {
  const speciale: Record<string, string> = {
    'keeper': 'Keeper',
    'achter': 'Achter',
    'voor': 'Voor',
    'links': 'Links',
    'rechts': 'Rechts',
    'midden': 'Midden',
    'links achter': 'Links achter',
    'rechts achter': 'Rechts achter',
    'links voor': 'Links voor',
    'rechts voor': 'Rechts voor',
    'links midden': 'Links midden',
    'rechts midden': 'Rechts midden'
  };
  return speciale[positie.toLowerCase()] || positie;
}

/**
 * Formats team name - remove extra spaces and capitalize
 */
export function formatTeamNaam(naam: string): string {
  return naam.trim().split(/\s+/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * Formats medal emoji for rankings
 */
export function getMedalEmoji(position: number): string {
  switch(position) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}

/**
 * Formats goal scorer display
 */
export function formatDoelpuntmaker(naam?: string): string {
  return naam ? `⚽ ${naam}` : '⚽ Eigen doelpunt';
}
