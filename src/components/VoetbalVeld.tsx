import React from 'react';

interface Speler {
  id: number;
  naam: string;
}

interface VoetbalVeldProps {
  formatie: string; // '6x6-vliegtuig', '6x6-dobbelsteen', '8x8'
  opstelling: Record<string, string>; // positie -> spelerId mapping
  spelers: Speler[];
  onSelectSpeler?: (positie: string) => void;
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
      { positie: 'Keeper', top: '8%', left: '50%', rol: 'Keeper' },
      { positie: 'Achter', top: '28%', left: '50%', rol: 'Achter' },
      { positie: 'Links', top: '50%', left: '25%', rol: 'Links' },
      { positie: 'Midden', top: '50%', left: '50%', rol: 'Midden' },
      { positie: 'Rechts', top: '50%', left: '75%', rol: 'Rechts' },
      { positie: 'Voor', top: '75%', left: '50%', rol: 'Voor' },
    ];
    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  // 6x6 Dobbelsteen Formatie
  const render6x6Dobbelsteen = () => {
    const positions = [
      { positie: 'Keeper', top: '8%', left: '50%', rol: 'Keeper' },
      { positie: 'Links achter', top: '28%', left: '30%', rol: 'Links Achter' },
      { positie: 'Rechts achter', top: '28%', left: '70%', rol: 'Rechts Achter' },
      { positie: 'Midden', top: '50%', left: '50%', rol: 'Midden' },
      { positie: 'Links voor', top: '75%', left: '30%', rol: 'Links Voor' },
      { positie: 'Rechts voor', top: '75%', left: '70%', rol: 'Rechts Voor' },
    ];
    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  // 8x8 Formatie
  const render8x8 = () => {
    const positions = [
      { positie: 'Keeper', top: '8%', left: '50%', rol: 'Keeper' },
      { positie: 'Links achter', top: '25%', left: '30%', rol: 'Links Achter' },
      { positie: 'Rechts achter', top: '25%', left: '70%', rol: 'Rechts Achter' },
      { positie: 'Links midden', top: '48%', left: '18%', rol: 'Links Midden' },
      { positie: 'Midden', top: '48%', left: '50%', rol: 'Midden' },
      { positie: 'Rechts midden', top: '48%', left: '82%', rol: 'Rechts Midden' },
      { positie: 'Links voor', top: '72%', left: '30%', rol: 'Links Voor' },
      { positie: 'Rechts voor', top: '72%', left: '70%', rol: 'Rechts Voor' },
    ];
    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  const PlayerSlot = ({ 
    positie, 
    top, 
    left, 
    rol, 
    spelerId, 
    isEditable,
    onSelectSpeler
  }: any) => {
    const spelerNaam = spelerId ? getSpelerNaam(spelerId) : '';
    const displayNaam = spelerNaam ? spelerNaam.split(' ')[0] : '+';
    
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ top, left }}
      >
        <div
          className={`
            w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer
            transition-all duration-200 relative border-2 font-bold text-sm
            ${spelerId 
              ? positie === 'Keeper'
                ? 'bg-yellow-400 border-yellow-600 text-gray-900 hover:shadow-lg hover:scale-110'
                : 'bg-blue-500 border-blue-700 text-white hover:shadow-lg hover:scale-110'
              : 'bg-gray-200 border-gray-400 text-gray-500 hover:bg-gray-300'
            }
            ${isEditable ? 'cursor-pointer hover:ring-2 ring-offset-1 ring-yellow-400' : 'cursor-default'}
          `}
          onClick={() => isEditable && onSelectSpeler?.(positie)}
          title={`${rol}: ${spelerNaam}`}
        >
          <span className="text-center line-clamp-2 leading-tight">
            {displayNaam}
          </span>
        </div>
        <p className="text-xs text-gray-600 text-center mt-1 whitespace-nowrap font-medium">{rol}</p>
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-green-600 to-green-500 rounded-lg p-4 shadow-lg">
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-bold text-white">{teamNaam}</h3>
        <p className="text-xs text-green-100">Opstelling {formatie}</p>
      </div>

      {/* HALF VELD - Van achterlijn tot middenlijn */}
      <div className="relative w-full bg-green-400 rounded-lg overflow-hidden" style={{ aspectRatio: '1/0.5' }}>
        {/* Veldmarkering - HALF VELD (achterlijn tot middenlijn) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 50"
          style={{ pointerEvents: 'none' }}
        >
          {/* Buitenlijnen */}
          <rect x="5" y="5" width="90" height="40" fill="none" stroke="white" strokeWidth="0.6" />
          
          {/* Middellijn (bovenkant = doelmidde) */}
          <line x1="5" y1="45" x2="95" y2="45" stroke="white" strokeWidth="0.6" />
          
          {/* Strafschopgebied */}
          <rect x="25" y="30" width="50" height="15" fill="none" stroke="white" strokeWidth="0.6" />
          
          {/* Doelgebied */}
          <rect x="35" y="40" width="30" height="5" fill="none" stroke="white" strokeWidth="0.6" />
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
        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-gray-600 text-center">
          💡 Klik op een speler om te wijzigen
        </div>
      )}
    </div>
  );
}
