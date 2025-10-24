import React from 'react';
import { FileText } from 'lucide-react';
import { useWedstrijd } from './WedstrijdContext';
import { ALLE_THEMAS } from '../types';

interface WedstrijdSamenvattingProps {
  wedstrijd: any;
  spelers: any[];
  teamNaam: string;
  onUpdateNotities: (notities: string) => void;
  onUpdateThemas: (themas: string[]) => void;
}

export function WedstrijdSamenvatting({
  wedstrijd,
  spelers,
  teamNaam,
  onUpdateNotities,
  onUpdateThemas,
}: WedstrijdSamenvattingProps) {
  const [expandNotities, setExpandNotities] = React.useState(false);

  const toggleThema = (themaId: string) => {
    const themas = wedstrijd.themas || [];
    if (themas.includes(themaId)) {
      onUpdateThemas(themas.filter((t: string) => t !== themaId));
    } else {
      onUpdateThemas([...themas, themaId]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold">Wedstrijd Samenvatting</h2>

      {/* Thema's */}
      <div>
        <h3 className="font-bold mb-2">Wedstrijd Thema's</h3>
        <div className="space-y-2">
          {Object.entries(ALLE_THEMAS).map(([categorie, themas]: any) => (
            <div key={categorie}>
              <p className="text-sm font-semibold text-gray-600 capitalize mb-1">{categorie}</p>
              <div className="flex flex-wrap gap-2">
                {themas.map((thema: string) => (
                  <button
                    key={thema}
                    onClick={() => toggleThema(thema)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      (wedstrijd.themas || []).includes(thema)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {thema}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notities */}
      <div>
        <button
          onClick={() => setExpandNotities(!expandNotities)}
          className="flex items-center gap-2 font-bold text-lg"
        >
          <FileText className="w-5 h-5" />
          Wedstrijd Notities
        </button>
        
        {expandNotities && (
          <textarea
            value={wedstrijd.notities || ''}
            onChange={(e) => onUpdateNotities(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-2"
            placeholder="Algemene notities over deze wedstrijd..."
            rows={4}
          />
        )}
      </div>

      {/* Stats Preview */}
      <div className="bg-gray-50 p-4 rounded mt-4">
        <h3 className="font-bold mb-2">Stats Overzicht</h3>
        <div className="space-y-1 text-sm">
          <p>📅 Datum: {wedstrijd.datum}</p>
          <p>⚽ Tegenstander: {wedstrijd.tegenstander || '-'}</p>
          <p>🏠/✈️ {wedstrijd.thuisUit === 'thuis' ? 'THUIS' : 'UIT'}</p>
          <p>🎯 Formatie: {wedstrijd.formatie}</p>
          <p>👥 Spelers: {spelers.length}</p>
        </div>
      </div>
    </div>
  );
}
