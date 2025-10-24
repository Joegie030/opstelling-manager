import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useWedstrijd } from './WedstrijdContext';

interface WedstrijdHeaderProps {
  wedstrijd: any;
  teamNaam: string;
  onUpdateThuisUit: (thuisUit: 'thuis' | 'uit') => void;
  onUpdateWedstrijdType: (type: 'competitie' | 'oefenwedstrijd' | '') => void;
  onUpdateWedstrijdFormatie: (formatie: string) => void;
  onUpdateWedstrijdAfgelast: (isAfgelast: boolean) => void;
  onClose: () => void;
}

export function WedstrijdHeader({
  wedstrijd,
  teamNaam,
  onUpdateThuisUit,
  onUpdateWedstrijdType,
  onUpdateWedstrijdFormatie,
  onUpdateWedstrijdAfgelast,
  onClose,
}: WedstrijdHeaderProps) {
  const [expandDetails, setExpandDetails] = React.useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      {/* Top Row - Datum en Status */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Datum</label>
          <input
            type="date"
            value={wedstrijd.datum}
            className="w-full border rounded px-3 py-2 mt-1"
            readOnly
          />
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tegenstander */}
      <div>
        <label className="text-sm font-medium">Tegenstander</label>
        <input
          type="text"
          value={wedstrijd.tegenstander || ''}
          className="w-full border rounded px-3 py-2 mt-1"
          readOnly
        />
      </div>

      {/* Thuis/Uit + Wedstrijdtype */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Thuis/Uit</label>
          <select
            value={wedstrijd.thuisUit || 'thuis'}
            onChange={(e) => onUpdateThuisUit(e.target.value as 'thuis' | 'uit')}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="thuis">🏠 Thuis</option>
            <option value="uit">✈️ Uit</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select
            value={wedstrijd.type || ''}
            onChange={(e) => onUpdateWedstrijdType(e.target.value as 'competitie' | 'oefenwedstrijd' | '')}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="">Kies type...</option>
            <option value="competitie">🏆 Competitie</option>
            <option value="oefenwedstrijd">⚽ Oefenwedstrijd</option>
          </select>
        </div>
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setExpandDetails(!expandDetails)}
        className="w-full flex items-center justify-between px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
      >
        <span className="font-medium">Meer Details</span>
        {expandDetails ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Details Section */}
      {expandDetails && (
        <div className="space-y-4 bg-gray-50 p-4 rounded">
          <div>
            <label className="text-sm font-medium">Formatie</label>
            <select
              value={wedstrijd.formatie || '6x6-vliegtuig'}
              onChange={(e) => onUpdateWedstrijdFormatie(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="6x6-vliegtuig">6x6 Vliegtuig</option>
              <option value="6x6-dobbelsteen">6x6 Dobbelsteen</option>
              <option value="8x8">8x8</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={wedstrijd.isAfgelast || false}
              onChange={(e) => onUpdateWedstrijdAfgelast(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Afgelast</label>
          </div>
        </div>
      )}
    </div>
  );
}
