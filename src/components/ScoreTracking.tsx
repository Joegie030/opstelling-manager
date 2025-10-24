import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Speler, Doelpunt, Wedstrijd } from '../types';
import { useWedstrijd } from './WedstrijdContext';

// ✅ GECORRIGEERDE Props - Simpeler
interface Props {
  kwart: any; // Kwart data
  spelers: Speler[];
  teamNaam: string;
  onVoegThuis: () => void;
  onVoegUit: () => void;
  onVerwijder: (id: number) => void;
  onUpdateDoelpuntenMaker: (id: number, maker: string) => void;
}

export default function ScoreTracking({
  kwart,
  spelers,
  teamNaam,
  onVoegThuis,
  onVoegUit,
  onVerwijder,
  onUpdateDoelpuntenMaker
}: Props) {
  const [spelerSelectieModal, setSpelerSelectieModal] = useState(false);
  const { wedstrijd } = useWedstrijd();

  // Bereken score voor dit kwart
  const kwartDoelpunten = kwart.doelpunten || [];
  const eigenDoelpunten = kwartDoelpunten.filter((d: any) => d.thuisOf === 'thuis').length;
  const tegenstanderDoelpunten = kwartDoelpunten.filter((d: any) => d.thuisOf === 'uit').length;

  // Bereken totaalstand
  let eigenTotaal = 0;
  let tegenstanderTotaal = 0;
  
  wedstrijd.kwarten.forEach((k: any) => {
    if (k.doelpunten) {
      eigenTotaal += k.doelpunten.filter((d: any) => d.thuisOf === 'thuis').length;
      tegenstanderTotaal += k.doelpunten.filter((d: any) => d.thuisOf === 'uit').length;
    }
  });

  // Bepaal volgorde op basis van thuis/uit
  const isThuis = wedstrijd.thuisUit === 'thuis';
  const linksTeam = isThuis ? teamNaam : (wedstrijd.tegenstander || 'Tegenstander');
  const linksTotaal = isThuis ? eigenTotaal : tegenstanderTotaal;
  const linksKwart = isThuis ? eigenDoelpunten : tegenstanderDoelpunten;
  const rechtsTeam = isThuis ? (wedstrijd.tegenstander || 'Tegenstander') : teamNaam;
  const rechtsTotaal = isThuis ? tegenstanderTotaal : eigenTotaal;
  const rechtsKwart = isThuis ? tegenstanderDoelpunten : eigenDoelpunten;

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Score Display */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 text-center">⚽ Stand Wedstrijd</h4>
        
        {/* Totaalstand - GROOT */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-green-600">{linksTotaal}</div>
            <div className="text-xs text-gray-600 font-medium truncate max-w-[80px] sm:max-w-none">{linksTeam}</div>
          </div>
          <div className="text-2xl sm:text-3xl text-gray-400 font-bold">-</div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-red-600">{rechtsTotaal}</div>
            <div className="text-xs text-gray-600 font-medium truncate max-w-[80px] sm:max-w-none">{rechtsTeam}</div>
          </div>
        </div>
        
        {/* Stand dit kwart - KLEIN */}
        {(linksKwart > 0 || rechtsKwart > 0) && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-1">Dit kwart</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-semibold text-green-600">{linksKwart}</span>
              <span className="text-sm text-gray-400">-</span>
              <span className="text-lg font-semibold text-red-600">{rechtsKwart}</span>
            </div>
          </div>
        )}
      </div>

      {/* Score Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={onVoegThuis}
          className="px-3 sm:px-4 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Wij scoren
        </button>
        <button
          onClick={onVoegUit}
          className="px-3 sm:px-4 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Zij scoren
        </button>
      </div>

      {/* Doelpunten Lijst */}
      {kwartDoelpunten && kwartDoelpunten.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-gray-700">Doelpunten dit kwart:</h5>
          <div className="space-y-2">
            {kwartDoelpunten.map((doelpunt: any) => {
              const speler = doelpunt.doelpuntenmaker 
                ? spelers.find(s => s.id.toString() === doelpunt.doelpuntenmaker)
                : null;
              
              return (
                <div
                  key={doelpunt.id}
                  className={`flex items-center justify-between p-2 rounded-lg border-2 ${
                    doelpunt.thuisOf === 'thuis'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {doelpunt.thuisOf === 'thuis' ? '⚽' : '🔴'}
                    </span>
                    <span className="text-sm font-medium">
                      {doelpunt.thuisOf === 'thuis' 
                        ? (speler ? speler.naam : 'Onbekende speler')
                        : 'Tegenstander'
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => onVerwijder(doelpunt.id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                    title="Verwijder doelpunt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
