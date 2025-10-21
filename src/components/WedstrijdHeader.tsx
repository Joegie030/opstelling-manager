import { ChevronDown, ChevronUp, ChevronRight, FileText, X } from 'lucide-react';
import { ALLE_THEMAS } from '../types';
import { useWedstrijd } from './WedstrijdContext';
import { useState } from 'react';

interface WedstrijdHeaderProps {
  afwezigeInOpstelling: Array<{
    speler: any;
    kwarten: Array<{ kwart: number; posities: string[] }>;
  }>;
  verwijderAfwezigeUitOpstelling: () => void;
}

export function WedstrijdHeader({ afwezigeInOpstelling, verwijderAfwezigeUitOpstelling }: WedstrijdHeaderProps) {
  const {
    wedstrijd,
    spelers,
    clubNaam,
    teamNaam,
    onUpdateDatum,
    onUpdateTegenstander,
    onUpdateThuisUit,
    onToggleAfwezig,
    onUpdateWedstrijdNotities,
    onUpdateWedstrijdThemas,
    onSluiten
  } = useWedstrijd();

  const [notitiesOpen, setNotitiesOpen] = useState(false);
  const [afwezigheidOpen, setAfwezigheidOpen] = useState(false);
  const [gastspelersOpen, setGastspelersOpen] = useState(false);

  // Split spelers
  const vasteSpelers = spelers.filter(s => s.type !== 'gast');
  const gastSpelers = spelers.filter(s => s.type === 'gast');

  const getFormatieNaam = (formatie: string): string => {
    const namen: Record<string, string> = {
      '6x6': '✈️ 6x6 Vliegtuig',
      '6x6-vliegtuig': '✈️ 6x6 Vliegtuig',
      '6x6-dobbelsteen': '🎲 6x6 Dobbelsteen',
      '8x8': '⚽ 8x8'
    };
    return namen[formatie] || formatie;
  };

  // Bereken aantal afwezig - ALLEEN vaste spelers!
  const afwezigeVasteSpelers = (wedstrijd.afwezigeSpelers || []).filter(id =>
    vasteSpelers.some(s => s.id === id)
  );

  return (
    <div className="w-full border-2 border-green-400 rounded-lg overflow-hidden bg-green-50">
      {/* HEADER */}
      <div className="bg-green-100 border-b-2 border-green-400 p-4">
        <h2 className="font-bold text-sm sm:text-lg text-green-900">
          📋 Wedstrijdinformatie
        </h2>
      </div>

      {/* CONTENT */}
      <div className="p-4 bg-white w-full">
        <div className="space-y-4 w-full">
          {/* Titel en formatie */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-2xl font-bold truncate">
              {clubNaam} {teamNaam}
            </h3>
            <p className="text-xs sm:text-sm text-green-600 font-medium">
              {getFormatieNaam(wedstrijd.formatie)}
            </p>
          </div>
          
          {/* Datum en locatie */}
          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="date" 
              value={wedstrijd.datum} 
              onChange={(e) => onUpdateDatum(e.target.value)} 
              className="px-3 py-2 border-2 border-green-500 rounded-lg font-medium text-sm" 
            />
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateThuisUit('thuis')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                  (wedstrijd.thuisUit || 'thuis') === 'thuis'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🏠 Thuis
              </button>
              <button
                onClick={() => onUpdateThuisUit('uit')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                  (wedstrijd.thuisUit || 'thuis') === 'uit'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✈️ Uit
              </button>
            </div>
          </div>
          
          {/* Tegenstander */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tegenstander:</label>
            <input 
              type="text" 
              value={wedstrijd.tegenstander || ''} 
              onChange={(e) => onUpdateTegenstander(e.target.value)} 
              placeholder="Optioneel" 
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm" 
            />
          </div>

          {/* Wedstrijd Focus & Thema's */}
          <div className="border-2 border-blue-300 bg-blue-50 rounded-lg overflow-hidden">
            <button
              onClick={() => setNotitiesOpen(!notitiesOpen)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-100 transition-colors bg-blue-100 font-semibold text-sm border-b-2 border-blue-300"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-gray-700">
                  🎯 Wedstrijd Focus & Thema's
                </span>
                {wedstrijd.themas && wedstrijd.themas.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">
                    {wedstrijd.themas.length}
                  </span>
                )}
              </div>
              {notitiesOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {notitiesOpen && (
              <div className="px-4 py-3 border-t-2 border-blue-300 bg-white space-y-3">
                {/* Thema selectie */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">
                    🎯 Selecteer thema's om per kwart te evalueren
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALLE_THEMAS.map(thema => {
                      const isSelected = wedstrijd.themas?.includes(thema.id) || false;
                      return (
                        <button
                          key={thema.id}
                          onClick={() => {
                            const current = wedstrijd.themas || [];
                            if (isSelected) {
                              onUpdateWedstrijdThemas(current.filter(t => t !== thema.id));
                            } else {
                              onUpdateWedstrijdThemas([...current, thema.id]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-1">{thema.emoji}</span>
                          {thema.label}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Geselecteerde thema's samenvatting */}
                  {wedstrijd.themas && wedstrijd.themas.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Geselecteerd:</p>
                      <div className="flex flex-wrap gap-1">
                        {wedstrijd.themas.map(themaId => {
                          const thema = ALLE_THEMAS.find(t => t.id === themaId);
                          if (!thema) return null;
                          return (
                            <span key={themaId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {thema.emoji} {thema.label}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const current = wedstrijd.themas || [];
                                  onUpdateWedstrijdThemas(current.filter(t => t !== themaId));
                                }}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Afwezigheid Tracking */}
          <div className="border-2 border-orange-300 bg-orange-50 rounded-lg overflow-hidden">
            <button
              onClick={() => setAfwezigheidOpen(!afwezigheidOpen)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-orange-100 transition-colors bg-orange-100 font-semibold text-sm border-b-2 border-orange-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🚫</span>
                <span className="text-gray-700">
                  Afwezige Spelers
                </span>
                {afwezigeVasteSpelers.length > 0 && (
                  <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs font-bold">
                    {afwezigeVasteSpelers.length}
                  </span>
                )}
              </div>
              {afwezigheidOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {afwezigheidOpen && (
              <div className="px-4 py-3 border-t-2 border-orange-300 bg-white space-y-3">
                <p className="text-xs text-gray-600">
                  Vink aan wie er NIET is bij deze wedstrijd. Ze worden automatisch uitgefilterd bij het maken van de opstelling.
                </p>

                {/* VASTE SPELERS */}
                <div>
                  <h4 className="font-bold text-sm text-gray-800 mb-2">⚽ Vaste Spelers</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {vasteSpelers.map(speler => {
                      const isAfwezig = wedstrijd.afwezigeSpelers?.includes(speler.id) || false;
                      return (
                        <label
                          key={speler.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                            isAfwezig
                              ? 'bg-red-50 border-red-300 text-red-700'
                              : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAfwezig}
                            onChange={() => onToggleAfwezig(speler.id)}
                            className="w-4 h-4 rounded"
                          />
                          <span className={`text-sm font-medium ${isAfwezig ? 'line-through' : ''}`}>
                            {speler.naam}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* GASTSPELERS (INKLAPBAAR) */}
                {gastSpelers.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <button
                      onClick={() => setGastspelersOpen(!gastspelersOpen)}
                      className="w-full bg-orange-100 border-2 border-orange-400 hover:bg-orange-200 rounded-lg p-2 transition-colors flex items-center justify-between text-sm font-bold text-orange-700"
                    >
                      <span>👤 Gastspelers ({gastSpelers.length})</span>
                      {gastspelersOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {gastspelersOpen && (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {gastSpelers.map(speler => {
                          const isAfwezig = wedstrijd.afwezigeSpelers?.includes(speler.id) || false;
                          return (
                            <div
                              key={speler.id}
                              className={`flex flex-col gap-1 p-2 rounded-lg border-2 ${
                                isAfwezig
                                  ? 'bg-red-50 border-red-300'
                                  : 'bg-orange-50 border-orange-300'
                              }`}
                            >
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isAfwezig}
                                  onChange={() => onToggleAfwezig(speler.id)}
                                  className="w-4 h-4 rounded"
                                />
                                <span className={`text-sm font-medium ${isAfwezig ? 'line-through text-red-700' : 'text-orange-700'}`}>
                                  {speler.naam}
                                </span>
                              </label>
                              <span className="text-xs text-gray-600 pl-6">
                                {speler.team}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {wedstrijd.afwezigeSpelers && afwezigeVasteSpelers.length > 0 && (
                  <div className="pt-3 border-t border-orange-200">
                    <p className="text-xs text-gray-600">
                      💡 <strong>Tip:</strong> Afwezige spelers verschijnen niet in de speler selectie bij het maken van de opstelling.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* WAARSCHUWING: Afwezige spelers in opstelling */}
        {afwezigeInOpstelling.length > 0 && (
          <div className="mt-4 bg-red-50 border-2 border-red-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 text-base mb-2">
                  Let op! Je hebt {afwezigeInOpstelling.length} afwezige {afwezigeInOpstelling.length === 1 ? 'speler' : 'spelers'} in de opstelling
                </h3>
                <div className="space-y-2 mb-3">
                  {afwezigeInOpstelling.map(({ speler, kwarten }) => (
                    <div key={speler.id} className="bg-white rounded p-2 border border-red-200">
                      <div className="font-semibold text-red-700">{speler.naam}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {kwarten.map(({ kwart, posities }) => (
                          <div key={kwart}>
                            Kwart {kwart}: {posities.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={verwijderAfwezigeUitOpstelling}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors text-sm"
                  >
                    🗑️ Verwijder automatisch
                  </button>
                  <button
                    onClick={() => {
                      afwezigeInOpstelling.forEach(({ speler }) => {
                        onToggleAfwezig(speler.id);
                      });
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors text-sm"
                  >
                    ✅ Markeer als aanwezig
                  </button>
                </div>
                <p className="text-xs text-red-700 mt-3">
                  💡 <strong>Tip:</strong> Je kunt ze automatisch verwijderen of alsnog aanwezig markeren als ze toch kunnen spelen.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={onSluiten} 
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
