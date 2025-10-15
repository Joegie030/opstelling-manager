import { useState } from 'react';
import { Plus, Trash2, TestTube, AlertCircle } from 'lucide-react';
import { Speler } from '../types';

interface Props {
  clubNaam: string;
  teamNaam: string;
  spelers: Speler[];
  onUpdateClubNaam: (naam: string) => void;
  onUpdateTeamNaam: (naam: string) => void;
  onVoegSpelerToe: (naam: string) => void;
  onVerwijderSpeler: (id: number) => void;
  onLaadTestdata: () => void;
  onWisAlles: () => void;
}

export default function TeamBeheer({
  clubNaam,
  teamNaam,
  spelers,
  onUpdateClubNaam,
  onUpdateTeamNaam,
  onVoegSpelerToe,
  onVerwijderSpeler,
  onLaadTestdata,
  onWisAlles
}: Props) {
  const [nieuweSpeler, setNieuweSpeler] = useState('');
  const [toonBevestiging, setToonBevestiging] = useState(false);

  const handleVoegToe = () => {
    if (nieuweSpeler.trim()) {
      onVoegSpelerToe(nieuweSpeler.trim());
      setNieuweSpeler('');
    }
  };

  const handleTestdata = () => {
    if (spelers.length > 0) {
      setToonBevestiging(true);
    } else {
      onLaadTestdata();
    }
  };

  const bevestigTestdata = () => {
    onLaadTestdata();
    setToonBevestiging(false);
  };

  return (
    <div className="space-y-6">
      {/* Club en Team info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-lg">Club & Team Info</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Club Naam</label>
            <input
              type="text"
              value={clubNaam}
              onChange={(e) => onUpdateClubNaam(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Bijv. VV Amsterdam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team Naam</label>
            <input
              type="text"
              value={teamNaam}
              onChange={(e) => onUpdateTeamNaam(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Bijv. F1 - Blauw"
            />
          </div>
        </div>
      </div>

      {/* Testdata sectie */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <TestTube className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Testdata</h3>
            <p className="text-sm text-gray-600 mb-3">
              Laad snel een testteam met 12 spelers om de app uit te proberen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleTestdata}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Testdata laden
              </button>
              {spelers.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Weet je zeker dat je alle spelers wilt verwijderen?')) {
                      onWisAlles();
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Alles wissen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bevestigingsmelding */}
        {toonBevestiging && (
          <div className="mt-3 p-3 bg-white border border-yellow-300 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  Je hebt al {spelers.length} speler(s). Testdata laden vervangt deze spelers.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={bevestigTestdata}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                Ja, vervang spelers
              </button>
              <button
                onClick={() => setToonBevestiging(false)}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spelers beheer */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-lg">
          Spelers ({spelers.length})
        </h3>
        
        {/* Speler toevoegen */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={nieuweSpeler}
            onChange={(e) => setNieuweSpeler(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVoegToe()}
            placeholder="Naam nieuwe speler"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            onClick={handleVoegToe}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Toevoegen
          </button>
        </div>

        {/* Spelers lijst */}
        {spelers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Nog geen spelers toegevoegd</p>
            <p className="text-sm">Voeg spelers toe of laad testdata</p>
          </div>
        ) : (
          <div className="space-y-2">
            {spelers.map((speler) => (
              <div
                key={speler.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
              >
                <span className="font-medium">{speler.naam}</span>
                <button
                  onClick={() => {
                    if (confirm(`Weet je zeker dat je ${speler.naam} wilt verwijderen?`)) {
                      onVerwijderSpeler(speler.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info sectie */}
      {spelers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-sm">💡 Tips</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Je hebt {spelers.length} spelers in je team</li>
            <li>• Voor 6x6: minimaal 6 spelers nodig</li>
            <li>• Voor 8x8: minimaal 8 spelers nodig</li>
            <li>• Meer spelers = meer wisselmogelijkheden</li>
          </ul>
        </div>
      )}
    </div>
  );
}
