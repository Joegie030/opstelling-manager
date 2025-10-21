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
      { positie: 'Voor', top: '20%', left: '50%', rol: 'Voor' },
      { positie: 'Links', top: '42%', left: '25%', rol: 'Links' },
      { positie: 'Midden', top: '42%', left: '50%', rol: 'Midden' },
      { positie: 'Rechts', top: '42%', left: '75%', rol: 'Rechts' },
      { positie: 'Achter', top: '62%', left: '50%', rol: 'Achter' },
      { positie: 'Keeper', top: '82%', left: '50%', rol: 'Keeper' },
    ];
    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  // 6x6 Dobbelsteen Formatie
  const render6x6Dobbelsteen = () => {
    const positions = [
      { positie: 'Links voor', top: '18%', left: '30%', rol: 'Links Voor' },
      { positie: 'Rechts voor', top: '18%', left: '70%', rol: 'Rechts Voor' },
      { positie: 'Midden', top: '42%', left: '50%', rol: 'Midden' },
      { positie: 'Links achter', top: '65%', left: '30%', rol: 'Links Achter' },
      { positie: 'Rechts achter', top: '65%', left: '70%', rol: 'Rechts Achter' },
      { positie: 'Keeper', top: '82%', left: '50%', rol: 'Keeper' },
    ];
    return positions.map(pos => (
      <PlayerSlot key={pos.positie} {...pos} spelerId={opstelling[pos.positie]} isEditable={isEditable} onSelectSpeler={onSelectSpeler} />
    ));
  };

  // 8x8 Formatie
  const render8x8 = () => {
    const positions = [
      { positie: 'Links voor', top: '16%', left: '28%', rol: 'Links Voor' },
      { positie: 'Rechts voor', top: '16%', left: '72%', rol: 'Rechts Voor' },
      { positie: 'Links midden', top: '40%', left: '15%', rol: 'Links Midden' },
      { positie: 'Midden', top: '40%', left: '50%', rol: 'Midden' },
      { positie: 'Rechts midden', top: '40%', left: '85%', rol: 'Rechts Midden' },
      { positie: 'Links achter', top: '65%', left: '30%', rol: 'Links Achter' },
      { positie: 'Rechts achter', top: '65%', left: '70%', rol: 'Rechts Achter' },
      { positie: 'Keeper', top: '82%', left: '50%', rol: 'Keeper' },
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
    const isKeeper = positie === 'Keeper';
    
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ top, left }}
      >
        {/* Alleen tonen als geselecteerd */}
        {spelerId ? (
          <>
            <div
              className={`
                rounded-full flex flex-col items-center justify-center cursor-pointer
                transition-all duration-200 relative border-2 font-bold
                w-10 h-10 sm:w-16 sm:h-16 text-[0.65rem] sm:text-sm
                ${isKeeper
                  ? 'bg-yellow-300 border-yellow-500 text-gray-900 hover:shadow-lg hover:scale-110'
                  : 'bg-green-200 border-green-600 text-gray-800 hover:shadow-lg hover:scale-110'
                }
                ${isEditable ? 'cursor-pointer hover:ring-2 ring-offset-1 ring-gray-400' : 'cursor-default'}
              `}
              onClick={() => isEditable && onSelectSpeler?.(positie)}
              title={`${rol}: ${spelerNaam}`}
            >
              <span className="text-center line-clamp-2 leading-tight px-0.5">
                {displayNaam}
              </span>
            </div>
            {/* Labels alleen op desktop */}
            <p className="hidden sm:block text-xs text-gray-600 text-center mt-0.5 sm:mt-1 whitespace-nowrap font-medium">{rol}</p>
          </>
        ) : (
          /* Leeg positie - alleen + tonen als klikbaar */
          <>
            <div
              className={`
                rounded-full flex flex-col items-center justify-center cursor-pointer
                transition-all duration-200 relative border-2 font-bold
                w-10 h-10 sm:w-16 sm:h-16 text-xs sm:text-sm
                bg-transparent border-gray-300 text-gray-400
                ${isEditable ? 'hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50' : 'cursor-default'}
              `}
              onClick={() => isEditable && onSelectSpeler?.(positie)}
              title={`${rol}: Selecteer speler`}
            >
              <span className="text-center leading-tight">+</span>
            </div>
            {/* Labels alleen op desktop */}
            <p className="hidden sm:block text-xs text-gray-600 text-center mt-0.5 sm:mt-1 whitespace-nowrap font-medium">{rol}</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-green-600 to-green-500 rounded-lg p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="text-center mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-bold text-white">{teamNaam}</h3>
        <p className="text-xs text-green-100">Opstelling {formatie}</p>
      </div>

      {/* HALF VELD - Van middenlijn tot achterlijn */}
      <div className="relative w-full bg-green-400 rounded-lg overflow-hidden mx-auto" style={{ aspectRatio: '2/1.8', maxWidth: '600px', margin: '0 auto' }}>
        {/* Veldmarkering */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 90"
          style={{ pointerEvents: 'none' }}
        >
          {/* Buitenlijnen */}
          <rect x="5" y="5" width="90" height="80" fill="none" stroke="white" strokeWidth="0.8" />
          
          {/* Middellijn (bovenkant) */}
          <line x1="5" y1="5" x2="95" y2="5" stroke="white" strokeWidth="0.8" />
          
          {/* Halve cirkel rond middenstip */}
          <circle cx="50" cy="5" r="10" fill="none" stroke="white" strokeWidth="0.8" />
          
          {/* Middenstip */}
          <circle cx="50" cy="5" r="1" fill="white" />
          
          {/* 16-meter gebied (strafschopgebied) - VAN ACHTERLIJN */}
          <rect x="20" y="55" width="60" height="30" fill="none" stroke="white" strokeWidth="0.8" />
          
          {/* Doelgebied - VAN ACHTERLIJN */}
          <rect x="35" y="75" width="30" height="10" fill="none" stroke="white" strokeWidth="0.8" />
          
          {/* Achterlijn (benedenkant) */}
          <line x1="5" y1="85" x2="95" y2="85" stroke="white" strokeWidth="0.8" />
          
          {/* Doel markering op achterlijn */}
          <line x1="40" y1="85" x2="60" y2="85" stroke="yellow" strokeWidth="1.5" />
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
        <div className="mt-2 sm:mt-3 p-2 bg-green-50 rounded text-xs text-gray-600 text-center">
          💡 Klik op een speler om te wijzigen
        </div>
      )}
    </div>
  );
}
