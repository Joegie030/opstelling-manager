import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Speler, Seizoen } from '../types';

interface Props {
  spelers: Speler[];
  onVoegSpelerToe: (naam: string, type?: 'vast' | 'gast', team?: string) => void;
  onVerwijderSpeler: (id: number) => void;
  clubNaam: string;
  teamNaam: string;
  onUpdateClubNaam: (naam: string) => void;
  onUpdateTeamNaam: (naam: string) => void;
  onLaadTestdata: () => void;
  onWisAlles: () => void;
  // SEIZOEN PROPS - TOEGEVOEGD
  teamId?: string;
  seizoenen?: Seizoen[];
  selectedSeizoenId?: string | null;
  onSeizoenChange?: (seizoenId: string) => void;
  onSeizoenUpdate?: () => void;
}

export default function TeamBeheer({
  spelers,
  onVoegSpelerToe,
  onVerwijderSpeler,
  clubNaam,
  teamNaam,
  onUpdateClubNaam,
  onUpdateTeamNaam,
  onLaadTestdata,
  onWisAlles,
  // SEIZOEN PROPS
  teamId,
  seizoenen = [],
  selectedSeizoenId,
  onSeizoenChange,
  onSeizoenUpdate
}: Props) {
  const [activeTab, setActiveTab] = useState<'vast' | 'gast'>('vast');
  const [nieuwSpelerNaam, setNieuwSpelerNaam] = useState('');
  const [nieuwGastTeam, setNieuwGastTeam] = useState('');

  // Filter spelers
  const vasteSpelers = spelers.filter(s => s.type !== 'gast');
  const gastSpelers = spelers.filter(s => s.type === 'gast');

  const handleVoegSpelerToe = () => {
    if (!nieuwSpelerNaam.trim()) return;

    if (activeTab === 'vast') {
      onVoegSpelerToe(nieuwSpelerNaam, 'vast');
    } else {
      if (!nieuwGastTeam.trim()) {
        alert('Voer team naam in voor gastspeaker');
        return;
      }
      onVoegSpelerToe(nieuwSpelerNaam, 'gast', nieuwGastTeam);
    }

    setNieuwSpelerNaam('');
    setNieuwGastTeam('');
  };

  return (
    <div className="space-y-6">
      {/* ========== TEAM INFO ========== */}
      <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
        <h2 className="text-2xl font-bold mb-4">🏟️ Team Instellingen</h2>
        
        <div className="space-y-4">
          {/* Club Naam */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Club Naam</label>
            <input
              type="text"
              value={clubNaam}
              onChange={(e) => onUpdateClubNaam(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-medium"
              placeholder="Bijv: VV Amsterdam"
            />
          </div>

          {/* Team Naam */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Team Naam</label>
            <input
              type="text"
              value={teamNaam}
              onChange={(e) => onUpdateTeamNaam(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-medium"
              placeholder="Bijv: Team A"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onLaadTestdata}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"
            >
              📋 Testdata Laden
            </button>
            <button
              onClick={onWisAlles}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm"
            >
              🗑️ Alles Wissen
            </button>
          </div>
        </div>
      </div>

      {/* ========== SPELAERSLIJST MET TABS ========== */}
      <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
        <h2 className="text-2xl font-bold mb-4">👥 Spelaerslijst</h2>

        {/* TABS */}
        <div className="flex gap-2 mb-4 border-b-2 border-green-300">
          <button
            onClick={() => setActiveTab('vast')}
            className={`px-4 py-2 font-bold transition-colors ${
              activeTab === 'vast'
                ? 'border-b-4 border-green-600 text-green-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚽ Vaste Spelers ({vasteSpelers.length})
          </button>
          <button
            onClick={() => setActiveTab('gast')}
            className={`px-4 py-2 font-bold transition-colors ${
              activeTab === 'gast'
                ? 'border-b-4 border-orange-600 text-orange-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👤 Gastspeakers ({gastSpelers.length})
          </button>
        </div>

        {/* INPUT FORM */}
        <div className="mb-4 space-y-3">
          {activeTab === 'vast' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Spelaer Naam</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nieuwSpelerNaam}
                    onChange={(e) => setNieuwSpelerNaam(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVoegSpelerToe()}
                    placeholder="Bijv: Jan de Vries"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleVoegSpelerToe}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Toevoegen
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gastspeaker Naam</label>
                <input
                  type="text"
                  value={nieuwSpelerNaam}
                  onChange={(e) => setNieuwSpelerNaam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVoegSpelerToe()}
                  placeholder="Bijv: Jeroen van Berg"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Team/Club</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nieuwGastTeam}
                    onChange={(e) => setNieuwGastTeam(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVoegSpelerToe()}
                    placeholder="Bijv: VV Ajax"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleVoegSpelerToe}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Toevoegen
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* SPELAERSLIJST */}
        <div className="space-y-2">
          {activeTab === 'vast' ? (
            <>
              {vasteSpelers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nog geen vaste spelers</p>
              ) : (
                vasteSpelers.map(speler => (
                  <div
                    key={speler.id}
                    className="flex items-center justify-between p-3 bg-white border-2 border-green-300 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚽</span>
                      <span className="font-medium">{speler.naam}</span>
                    </div>
                    <button
                      onClick={() => onVerwijderSpeler(speler.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Verwijder spelaer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {gastSpelers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nog geen gastspeakers</p>
              ) : (
                gastSpelers.map(speler => (
                  <div
                    key={speler.id}
                    className="flex items-center justify-between p-3 bg-orange-100 border-2 border-orange-400 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      <div>
                        <div className="font-medium">{speler.naam}</div>
                        <div className="text-xs text-gray-600">Gast uit: {speler.team || 'Onbekend'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onVerwijderSpeler(speler.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Verwijder gastspeaker"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* SAMENVATTING */}
        <div className="mt-4 p-3 bg-blue-100 border-2 border-blue-300 rounded-lg">
          <p className="text-sm text-gray-800">
            <strong>Totaal:</strong> {spelers.length} spelaers ({vasteSpelers.length} vast, {gastSpelers.length} gast)
          </p>
        </div>
      </div>
    </div>
  );
}
