import React from 'react';

interface Speler {
  id: number;
  naam: string;
}

interface FieldPosition {
  positie: string;
  spelerId: string;
  rol: string; // 'keeper', 'achter', 'midden', 'voor', etc.
}

interface VoetbalVeldProps {
  formatie: string; // '6x6', '8x8', etc.
  opstelling: Record<string, string>; // positie -> spelerId mapping
  spelers: Speler[];
  onSelectSpeler?: (positie: string, spelerId: string) => void;
  isEditable?: boolean;
  teamNaam?: string;
}

export default function VoetbalVeld({
  formatie,
  opstelling,
  spelers,
  onSelectSpeler,
  isEditable = false,
  teamNaam = 'Team'
}: VoetbalVeldProps) {
  
  const getSpelerNaam = (spelerId: string): string => {
    if (!spelerId) return '---';
    const speler = spelers.find(s => s.id.toString() === spelerId);
    return speler?.naam || 'Onbekend';
  };

  // 6x6 Vliegtuig Formatie
  const render6x6Vliegtuig = () => {
    const positions = [
      { positie: 'Keeper', label: '🧤', top: '5%', left: '50%', rol: 'Keeper' },
      { positie: 'Achter', label: '🛡️', top: '25%', left: '50%', rol: 'Achter' },
      { positie: 'Links', label: '⬅️', top: '45%', left: '25%', rol: 'Links' },
      { positie: 'Midden', label: '⏹️', top: '45%', left: '50%', rol: 'Midden' },
      { positie: 'Rechts', label: '➡️', top: '45%', left: '75%', rol: 'Rechts' },
      { positie: 'Voor', label: '⚡', top: '70%', left: '50%', rol: 'Voor' },
    ];
    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  // 6x6 Dobbelsteen Formatie
  const render6x6Dobbelsteen = () => {
    const positions = [
      { positie: 'Keeper', label: '🧤', top: '5%', left: '50%', rol: 'Keeper' },
      { positie: 'Links achter', label: '🛡️', top: '25%', left: '30%', rol: 'Links Achter' },
      { positie: 'Rechts achter', label: '🛡️', top: '25%', left: '70%', rol: 'Rechts Achter' },
      { positie: 'Midden', label: '⏹️', top: '45%', left: '50%', rol: 'Midden' },
      { positie: 'Links voor', label: '⚡', top: '70%', left: '30%', rol: 'Links Voor' },
      { positie: 'Rechts voor', label: '⚡', top: '70%', left: '70%', rol: 'Rechts Voor' },
    ];
    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  // 8x8 Formatie: 1 keeper, 2 achterveld, 3 middenveld, 2 voorveld
  const render8x8 = () => {
    const positions = [
      { positie: 'Keeper', label: '🧤', top: '5%', left: '50%', rol: 'Keeper' },
      { positie: 'Links achter', label: '🛡️', top: '25%', left: '30%', rol: 'Links Achter' },
      { positie: 'Rechts achter', label: '🛡️', top: '25%', left: '70%', rol: 'Rechts Achter' },
      { positie: 'Links midden', label: '⏹️', top: '45%', left: '20%', rol: 'Links Midden' },
      { positie: 'Midden', label: '⏹️', top: '45%', left: '50%', rol: 'Midden' },
      { positie: 'Rechts midden', label: '⏹️', top: '45%', left: '80%', rol: 'Rechts Midden' },
      { positie: 'Links voor', label: '⚡', top: '70%', left: '30%', rol: 'Links Voor' },
      { positie: 'Rechts voor', label: '⚡', top: '70%', left: '70%', rol: 'Rechts Voor' },
    ];

    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  const PlayerSlot = ({ 
    positie, 
    label, 
    top, 
    left, 
    rol, 
    spelerId, 
    isEditable,
    onSelectSpeler
  }: any) => (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ top, left }}
    >
      <div
        className={`
          w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200 relative
          ${spelerId 
            ? 'bg-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-110' 
            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
          }
          ${isEditable ? 'hover:ring-2 ring-yellow-400' : ''}
        `}
        onClick={() => isEditable && onSelectSpeler?.(positie)}
        title={`${rol}: ${getSpelerNaam(spelerId)}`}
      >
        <span className="text-lg">{label}</span>
        <span className="text-xs font-bold text-center line-clamp-2">
          {spelerId ? getSpelerNaam(spelerId).split(' ')[0] : '?'}
        </span>
      </div>
      <p className="text-xs text-gray-600 text-center mt-1 whitespace-nowrap">{rol}</p>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-b from-green-500 to-green-600 rounded-lg p-4 shadow-lg">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white">{teamNaam}</h3>
        <p className="text-xs text-green-100">Opstelling {formatie}</p>
      </div>

      {/* Veld */}
      <div className="relative w-full bg-green-400 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1.4' }}>
        {/* Veldmarkering */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 140"
          style={{ pointerEvents: 'none' }}
        >
          {/* Buitenlijnen */}
          <rect x="5" y="5" width="90" height="130" fill="none" stroke="white" strokeWidth="0.5" />
          
          {/* Middellijn */}
          <line x1="50" y1="5" x2="50" y2="135" stroke="white" strokeWidth="0.5" />
          
          {/* Middencirkel */}
          <circle cx="50" cy="70" r="8" fill="none" stroke="white" strokeWidth="0.5" />
          
          {/* Strafschopgebied (benedenzijde) */}
          <rect x="30" y="115" width="40" height="20" fill="none" stroke="white" strokeWidth="0.5" />
          
          {/* Doelgebied (benedenzijde) */}
          <rect x="40" y="125" width="20" height="10" fill="none" stroke="white" strokeWidth="0.5" />
          
          {/* Strafschopgebied (bovenzijde) */}
          <rect x="30" y="5" width="40" height="20" fill="none" stroke="white" strokeWidth="0.5" />
          
          {/* Doelgebied (bovenzijde) */}
          <rect x="40" y="5" width="20" height="10" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Spelers */}
        <div className="relative w-full h-full">
          {formatie === '8x8' 
            ? render8x8() 
            : formatie === '6x6-dobbelsteen'
            ? render6x6Dobbelsteen()
            : render6x6Vliegtuig()
          }
        </div>
      </div>

      {/* Legend */}
      {isEditable && (
        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-gray-600">
          💡 Klik op een speler om te wijzigen
        </div>
      )}
    </div>
  );
}
