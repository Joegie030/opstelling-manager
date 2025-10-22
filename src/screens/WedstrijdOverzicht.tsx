import { Plus, Trash2, Eye, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { Wedstrijd } from '..types';

interface WedstrijdOverzichtProps {
  wedstrijden: Wedstrijd[];
  teamNaam: string;
  onNieuweWedstrijd: () => void;
  onBekijk: (wedstrijd: Wedstrijd) => void;
  onKopieer: (wedstrijd: Wedstrijd) => void;
  onVerwijder: (id: number) => void;
}

export default function WedstrijdOverzicht({
  wedstrijden,
  teamNaam,
  onNieuweWedstrijd,
  onBekijk,
  onKopieer,
  onVerwijder,
}: WedstrijdOverzichtProps) {
  const [verwijderModal, setVerwijderModal] = useState<{ open: boolean; wedstrijd: Wedstrijd | null }>({
    open: false,
    wedstrijd: null
  });

  // Filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'competitie' | 'oefenwedstrijd'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  // Helper functie om formatie naam mooi weer te geven
  const getFormatieNaam = (formatie: string): string => {
    const namen: Record<string, string> = {
      '6x6': '✈️ 6x6 Vliegtuig',
      '6x6-vliegtuig': '✈️ 6x6 Vliegtuig',
      '6x6-dobbelsteen': '🎲 6x6 Dobbelsteen',
      '8x8': '⚽ 8x8'
    };
    return namen[formatie] || formatie;
  };

  // Helper functie voor wedstrijdtype
  const getTypeNaam = (type?: string): string => {
    const namen: Record<string, string> = {
      'competitie': '🏆 Competitie',
      'oefenwedstrijd': '🎯 Oefenwedstrijd'
    };
    return type ? namen[type] : '📋 Overig';
  };

  // Filter wedstrijden op type
  const gefilterdWedstrijden = wedstrijden.filter(w => {
    if (typeFilter === 'all') return true;
    return w.type === typeFilter;
  });

  const komendWedstrijden = gefilterdWedstrijden
    .filter(w => new Date(w.datum) >= new Date())
    .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

  const gespeeldeWedstrijden = gefilterdWedstrijden
    .filter(w => new Date(w.datum) < new Date())
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());

  const openVerwijderModal = (wedstrijd: Wedstrijd) => {
    setVerwijderModal({ open: true, wedstrijd });
  };

  const closeVerwijderModal = () => {
    setVerwijderModal({ open: false, wedstrijd: null });
  };

  const bevestigVerwijderen = () => {
    if (verwijderModal.wedstrijd) {
      onVerwijder(verwijderModal.wedstrijd.id);
      closeVerwijderModal();
    }
  };

  const WedstrijdCard = ({ wedstrijd, isKomend }: { wedstrijd: Wedstrijd; isKomend: boolean }) => {
    const isThuis = wedstrijd.thuisUit !== 'uit';
    const badge = isThuis ? '🏠' : '✈️';
    const badgeBg = isThuis ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
    const cardBg = isKomend ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300';

    return (
      <div className={`${cardBg} border-2 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow`}>
        {/* Rij 1: Datum - Thuis/Uit (klein) */}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs sm:text-sm font-semibold text-gray-700">{wedstrijd.datum}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
            {badge}
          </span>
        </div>

        {/* Rij 2: Wie tegen wie - Type */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
            <span className="font-bold text-blue-600 text-xs sm:text-sm truncate">{teamNaam}</span>
            <span className="text-gray-400 text-xs font-medium">vs</span>
            <span className="font-bold text-gray-700 text-xs sm:text-sm truncate">
              {wedstrijd.tegenstander || '(Tegenstander)'}
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap flex-shrink-0">
            {getTypeNaam(wedstrijd.type)}
          </span>
        </div>

        {/* Rij 3: Formatie (klein) */}
        <div className="text-xs text-gray-600 mb-2">
          {getFormatieNaam(wedstrijd.formatie)}
        </div>

        {/* Rij 4: Buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onBekijk(wedstrijd)}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-xs transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Bekijk</span>
            <span className="sm:hidden">Bekijk</span>
          </button>
          <button
            onClick={() => onKopieer(wedstrijd)}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-xs transition-colors flex items-center justify-center gap-1"
          >
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Kopieer</span>
            <span className="sm:hidden">Kopieer</span>
          </button>
          <button
            onClick={() => openVerwijderModal(wedstrijd)}
            className="px-1.5 sm:px-3 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* FILTER SECTION - COLLAPSIBLE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Wedstrijden</h2>
        </div>
        {/* Filter toggle button - compact */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded border border-gray-300 transition-colors flex items-center gap-1"
        >
          <span>🔍</span>
          <span className="hidden sm:inline">Filter</span>
          <span className="text-xs">{filterOpen ? '▼' : '▶'}</span>
        </button>
      </div>

      {/* Filter options - expandable */}
      {filterOpen && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-600">Type:</span>
          <button
            onClick={() => setTypeFilter('all')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              typeFilter === 'all'
                ? 'bg-gray-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setTypeFilter('competitie')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              typeFilter === 'competitie'
                ? 'bg-gray-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            🏆 Competitie
          </button>
          <button
            onClick={() => setTypeFilter('oefenwedstrijd')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              typeFilter === 'oefenwedstrijd'
                ? 'bg-gray-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            🎯 Oefenwedstrijd
          </button>
        </div>
      )}

      {/* Nieuwe Wedstrijd Knop */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <button
          onClick={onNieuweWedstrijd}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nieuwe Wedstrijd
        </button>
      </div>
      {komendWedstrijden.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📅</span>
            <h3 className="text-xl font-bold">Komende Wedstrijden</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              {komendWedstrijden.length}
            </span>
          </div>
          <div className="grid gap-4 mb-8">
            {komendWedstrijden.map((wedstrijd) => (
              <WedstrijdCard key={wedstrijd.id} wedstrijd={wedstrijd} isKomend={true} />
            ))}
          </div>
        </div>
      )}

      {/* GESPEELDE WEDSTRIJDEN */}
      {gespeeldeWedstrijden.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏁</span>
            <h3 className="text-xl font-bold">Gespeelde Wedstrijden</h3>
            <span className="bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
              {gespeeldeWedstrijden.length}
            </span>
          </div>
          <div className="grid gap-4">
            {gespeeldeWedstrijden.map((wedstrijd) => (
              <WedstrijdCard key={wedstrijd.id} wedstrijd={wedstrijd} isKomend={false} />
            ))}
          </div>
        </div>
      )}

      {/* Geen wedstrijden na filter */}
      {gefilterdWedstrijden.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Geen wedstrijden gevonden</p>
          <p className="text-gray-400 text-sm">
            {typeFilter === 'all' 
              ? 'Maak je eerste wedstrijd aan om te beginnen!' 
              : 'Geen wedstrijden met dit type. Probeer een ander filter.'}
          </p>
        </div>
      )}

      {/* BEVESTIGING MODAL - VERWIJDER WEDSTRIJD */}
      {verwijderModal.open && verwijderModal.wedstrijd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="bg-red-50 border-b-2 border-red-300 p-4 flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold text-red-800">Wedstrijd verwijderen?</h3>
                <p className="text-sm text-red-700 mt-1">Dit kan niet ongedaan gemaakt worden!</p>
              </div>
            </div>

            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Formatie:</span> {getFormatieNaam(verwijderModal.wedstrijd.formatie)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Datum:</span> {verwijderModal.wedstrijd.datum}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Type:</span> {getTypeNaam(verwijderModal.wedstrijd.type)}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Tegenstander:</span> {verwijderModal.wedstrijd.tegenstander || '(Geen naam)'}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Weet je zeker dat je deze wedstrijd wilt verwijderen?
              </p>
            </div>

            <div className="p-4 bg-gray-50 border-t-2 border-gray-200 flex gap-2">
              <button
                onClick={closeVerwijderModal}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={bevestigVerwijderen}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Verwijder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
