import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Speler, Doelpunt, Wedstrijd } from '../types';

interface Props {
  kwartIndex: number;
  wedstrijd: Wedstrijd;
  spelers: Speler[];
  thuisUit: 'thuis' | 'uit';
  teamNaam: string;
  tegenstander: string;
  onVoegDoelpuntToe: (kwartIndex: number, doelpunt: Omit<Doelpunt, 'id'>) => void;
  onVerwijderDoelpunt: (kwartIndex: number, doelpuntId: number) => void;
}

export default function ScoreTracking({
  kwartIndex,
  wedstrijd,
  spelers,
  thuisUit,
  teamNaam,
  tegenstander,
  onVoegDoelpuntToe,
  onVerwijderDoelpunt
}: Props) {
  const [spelerSelectieModal, setSpelerSelectieModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🛡️ DEFENSIVE: Valideer inputs
  console.log('🔵 ScoreTracking mounted with:', {
    kwartIndex,
    wedstrijdId: wedstrijd?.id,
    kwartenLength: wedstrijd?.kwarten?.length,
    spelersLength: spelers?.length,
    callbacksExist: {
      onVoegDoelpuntToe: typeof onVoegDoelpuntToe,
      onVerwijderDoelpunt: typeof onVerwijderDoelpunt
    }
  });

  // 🛡️ DEFENSIVE: Check of kwarten array bestaat en valid index
  if (!wedstrijd || !Array.isArray(wedstrijd.kwarten)) {
    console.error('❌ ERROR: wedstrijd.kwarten is undefined or not an array', { wedstrijd });
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <h4 className="font-bold text-red-700">⚠️ Fout: Geen kwarten data</h4>
        <p className="text-sm text-red-600">Wedstrijd data is onvolledig geladen</p>
      </div>
    );
  }

  if (kwartIndex < 0 || kwartIndex >= wedstrijd.kwarten.length) {
    console.error('❌ ERROR: kwartIndex out of bounds', { kwartIndex, kwartenLength: wedstrijd.kwarten.length });
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <h4 className="font-bold text-red-700">⚠️ Fout: Ongeldig kwart</h4>
        <p className="text-sm text-red-600">Kwart {kwartIndex + 1} bestaat niet</p>
      </div>
    );
  }

  // 🛡️ DEFENSIVE: Get kwart safely
  const kwart = wedstrijd.kwarten[kwartIndex];
  
  if (!kwart) {
    console.error('❌ ERROR: kwart undefined at index', kwartIndex);
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <h4 className="font-bold text-red-700">⚠️ Fout: Kwart data ontbreekt</h4>
        <p className="text-sm text-red-600">Kwart {kwartIndex + 1} data kon niet geladen worden</p>
      </div>
    );
  }

  // 🛡️ DEFENSIVE: Ensure doelpunten is always an array
  const kwartDoelpunten = (kwart.doelpunten && Array.isArray(kwart.doelpunten)) 
    ? kwart.doelpunten 
    : [];
  
  console.log('📊 Doelpunten in kwart:', { 
    kwartIndex, 
    doelpuntenCount: kwartDoelpunten.length, 
    doelpunten: kwartDoelpunten 
  });

  // 🛡️ DEFENSIVE: Check callbacks are functions
  const isCallbackValid = (callback: any): callback is Function => {
    return typeof callback === 'function';
  };

  if (!isCallbackValid(onVoegDoelpuntToe)) {
    console.error('❌ ERROR: onVoegDoelpuntToe is not a function', { onVoegDoelpuntToe });
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <h4 className="font-bold text-red-700">⚠️ Fout: onVoegDoelpuntToe callback</h4>
        <p className="text-sm text-red-600">Parent component heeft geen geldige callback doorgegeven</p>
      </div>
    );
  }

  if (!isCallbackValid(onVerwijderDoelpunt)) {
    console.error('❌ ERROR: onVerwijderDoelpunt is not a function', { onVerwijderDoelpunt });
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <h4 className="font-bold text-red-700">⚠️ Fout: onVerwijderDoelpunt callback</h4>
        <p className="text-sm text-red-600">Parent component heeft geen geldige callback doorgegeven</p>
      </div>
    );
  }

  // Bereken score voor dit kwart (alleen dit kwart)
  const eigenDoelpuntenKwart = kwartDoelpunten.filter(d => d.type === 'eigen').length;
  const tegenstanderDoelpuntenKwart = kwartDoelpunten.filter(d => d.type === 'tegenstander').length;

  // Bereken totaalstand tot en met dit kwart
  let eigenDoelpuntenTotaal = 0;
  let tegenstanderDoelpuntenTotaal = 0;
  
  try {
    for (let i = 0; i <= kwartIndex; i++) {
      const k = wedstrijd.kwarten[i];
      if (k && k.doelpunten && Array.isArray(k.doelpunten)) {
        eigenDoelpuntenTotaal += k.doelpunten.filter(d => d.type === 'eigen').length;
        tegenstanderDoelpuntenTotaal += k.doelpunten.filter(d => d.type === 'tegenstander').length;
      }
    }
  } catch (error) {
    console.error('❌ ERROR calculating total scores:', error);
    setErrorMessage('Fout bij berekenen totaalscore');
  }

  // Bepaal volgorde op basis van thuis/uit
  const isThuis = thuisUit === 'thuis';
  const linksTeam = isThuis ? teamNaam : (tegenstander || 'Tegenstander');
  const linksTotaalScore = isThuis ? eigenDoelpuntenTotaal : tegenstanderDoelpuntenTotaal;
  const linksKwartScore = isThuis ? eigenDoelpuntenKwart : tegenstanderDoelpuntenKwart;
  const rechtsTeam = isThuis ? (tegenstander || 'Tegenstander') : teamNaam;
  const rechtsTotaalScore = isThuis ? tegenstanderDoelpuntenTotaal : eigenDoelpuntenTotaal;
  const rechtsKwartScore = isThuis ? tegenstanderDoelpuntenKwart : eigenDoelpuntenKwart;

  // Voeg tegenstander doelpunt toe (zonder modal)
  const voegTegenstanderDoelpuntToe = () => {
    try {
      console.log('🔴 Calling onVoegDoelpuntToe for tegenstander doelpunt');
      onVoegDoelpuntToe(kwartIndex, {
        type: 'tegenstander'
      });
    } catch (error) {
      console.error('❌ ERROR in voegTegenstanderDoelpuntToe:', error);
      setErrorMessage(`Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  // Open modal voor speler selectie
  const openSpelerSelectie = () => {
    setSpelerSelectieModal(true);
  };

  // Selecteer speler en voeg doelpunt toe
  const selecteerSpeler = (spelerId: number) => {
    try {
      console.log('🟢 Calling onVoegDoelpuntToe for player goal:', { spelerId });
      onVoegDoelpuntToe(kwartIndex, {
        type: 'eigen',
        spelerId: spelerId
      });
      setSpelerSelectieModal(false);
      setErrorMessage(null);
    } catch (error) {
      console.error('❌ ERROR in selecteerSpeler:', error);
      setErrorMessage(`Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  // Voeg anoniem eigen doelpunt toe
  const voegAnoniemDoelpuntToe = () => {
    try {
      console.log('⚪ Calling onVoegDoelpuntToe for anonymous goal');
      onVoegDoelpuntToe(kwartIndex, {
        type: 'eigen'
      });
      setSpelerSelectieModal(false);
      setErrorMessage(null);
    } catch (error) {
      console.error('❌ ERROR in voegAnoniemDoelpuntToe:', error);
      setErrorMessage(`Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  // Safe delete handler
  const handleDeleteDoelpunt = (doelpuntId: number) => {
    try {
      console.log('🗑️ Calling onVerwijderDoelpunt:', { kwartIndex, doelpuntId });
      onVerwijderDoelpunt(kwartIndex, doelpuntId);
      setErrorMessage(null);
    } catch (error) {
      console.error('❌ ERROR in handleDeleteDoelpunt:', error);
      setErrorMessage(`Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-sm text-red-700 font-medium">⚠️ {errorMessage}</p>
        </div>
      )}

      {/* Score Display */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 text-center">⚽ Stand Wedstrijd</h4>
        
        {/* Totaalstand - GROOT */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-green-600">{linksTotaalScore}</div>
            <div className="text-xs text-gray-600 font-medium truncate max-w-[80px] sm:max-w-none">{linksTeam}</div>
          </div>
          <div className="text-2xl sm:text-3xl text-gray-400 font-bold">-</div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-red-600">{rechtsTotaalScore}</div>
            <div className="text-xs text-gray-600 font-medium truncate max-w-[80px] sm:max-w-none">{rechtsTeam}</div>
          </div>
        </div>
        
        {/* Stand dit kwart - KLEIN */}
        {(linksKwartScore > 0 || rechtsKwartScore > 0) && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-1">Dit kwart</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-semibold text-green-600">{linksKwartScore}</span>
              <span className="text-sm text-gray-400">-</span>
              <span className="text-lg font-semibold text-red-600">{rechtsKwartScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Score Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={openSpelerSelectie}
          className="px-3 sm:px-4 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Wij scoren
        </button>
        <button
          onClick={voegTegenstanderDoelpuntToe}
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
            {kwartDoelpunten.map((doelpunt) => {
              // 🛡️ DEFENSIVE: Check doelpunt has valid id
              if (!doelpunt.id) {
                console.warn('⚠️ Doelpunt missing id:', doelpunt);
                return null;
              }

              const speler = doelpunt.spelerId 
                ? spelers.find(s => s.id === doelpunt.spelerId)
                : null;
              
              return (
                <div
                  key={doelpunt.id}
                  className={`flex items-center justify-between p-2 rounded-lg border-2 ${
                    doelpunt.type === 'eigen'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {doelpunt.type === 'eigen' ? '⚽' : '🔴'}
                    </span>
                    <span className="text-sm font-medium">
                      {doelpunt.type === 'eigen' 
                        ? (speler ? speler.naam : 'Onbekende speler')
                        : 'Tegenstander'
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteDoelpunt(doelpunt.id)}
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

      {/* Speler Selectie Modal */}
      {spelerSelectieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-green-600 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Wie scoorde?</h3>
                <p className="text-sm opacity-90">Selecteer de doelpuntenmaker</p>
              </div>
              <button
                onClick={() => setSpelerSelectieModal(false)}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              <div className="space-y-2">
                {/* Anoniem doelpunt optie */}
                <button
                  onClick={voegAnoniemDoelpuntToe}
                  className="w-full p-3 border-2 border-gray-300 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="font-semibold text-gray-700">❓ Onbekend / Geen specifieke speler</div>
                  <div className="text-xs text-gray-600 mt-1">Voor als je niet zeker weet wie scoorde</div>
                </button>

                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Of kies een speler:</p>
                </div>

                {/* Spelers lijst - alfabetisch */}
                {spelers && spelers.length > 0 ? (
                  spelers
                    .slice()
                    .sort((a, b) => a.naam.localeCompare(b.naam))
                    .map((speler) => (
                      <button
                        key={speler.id}
                        onClick={() => selecteerSpeler(speler.id)}
                        className="w-full p-3 border-2 border-green-300 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                      >
                        <div className="font-semibold text-green-800">⚽ {speler.naam}</div>
                      </button>
                    ))
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">❌ Geen spelers beschikbaar</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={() => setSpelerSelectieModal(false)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
