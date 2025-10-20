import { Plus, Trash2, Eye, Copy } from 'lucide-react';
import { Wedstrijd } from './types';

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

  const komendWedstrijden = wedstrijden
    .filter(w => new Date(w.datum) >= new Date())
    .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

  const gespeeldeWedstrijden = wedstrijden
    .filter(w => new Date(w.datum) < new Date())
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());

  const WedstrijdCard = ({ wedstrijd, isKomend }: { wedstrijd: Wedstrijd; isKomend: boolean }) => {
    const isThuis = wedstrijd.thuisUit !== 'uit';
    const badge = isThuis ? '🏠 Thuis' : '✈️ Uit';
    const badgeBg = isThuis ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
    const cardBg = isKomend ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300';
    const titleColor = isKomend ? 'text-blue-900' : 'text-gray-800';

    return (
      <div className={`${cardBg} border-2 rounded-lg p-4 hover:shadow-md transition-shadow`}>
        {/* Header: Formatie, Datum, Badge */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className={`font-bold text-lg ${titleColor}`}>{getFormatieNaam(wedstrijd.formatie)}</h4>
            <p className="text-sm text-gray-600">{wedstrijd.datum}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeBg}`}>
            {badge}
          </span>
        </div>

        {/* Match-up Display */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          {isThuis ? (
            <>
              <span className="font-bold text-blue-600">{teamNaam}</span>
              <span className="text-gray-400 font-medium">vs</span>
              <span className="font-bold text-gray-700">
                {wedstrijd.tegenstander || '(Tegenstander)'}
              </span>
            </>
          ) : (
            <>
              <span className="font-bold text-gray-700">
                {wedstrijd.tegenstander || '(Tegenstander)'}
              </span>
              <span className="text-gray-400 font-medium">vs</span>
              <span className="font-bold text-blue-600">{teamNaam}</span>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onBekijk(wedstrijd)}
            className="flex-1 min-w-24 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Bekijk</span>
          </button>
          <button
            onClick={() => onKopieer(wedstrijd)}
            className="flex-1 min-w-24 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm transition-colors flex items-center justify-center gap-1"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Kopieer</span>
          </button>
          <button
            onClick={() => onVerwijder(wedstrijd.id)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wedstrijden</h2>
      </div>

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

      {/* KOMENDE WEDSTRIJDEN */}
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

      {/* Geen wedstrijden */}
      {wedstrijden.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Geen wedstrijden gepland</p>
          <p className="text-gray-400 text-sm">Maak je eerste wedstrijd aan om te beginnen!</p>
        </div>
      )}
    </div>
  );
}
