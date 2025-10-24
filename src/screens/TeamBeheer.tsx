import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Check, X, ChevronDown } from 'lucide-react';
import { Speler, Seizoen } from '../types';
import InviteCoaches from './InviteCoaches';

interface TeamBeheerProps {
  // Team Data
  selectedTeamId: string | null;
  clubNaam: string;
  teamNaam: string;
  onUpdateClubNaam: (naam: string) => void;
  onUpdateTeamNaam: (naam: string) => void;

  // Spelers
  spelers: Speler[];
  onVoegSpelerToe: (naam: string, type?: 'vast' | 'gast', team?: string) => void;
  onVerwijderSpeler: (id: number) => void;

  // Seizoenen
  seizoenen: Seizoen[];
  selectedSeizoenId: string | null;
  onSeizoenChange: (seizoenId: string) => void;
  onSeizoenUpdate: () => void;

  // Coach
  currentCoach?: any;
}

export default function TeamBeheer({
  selectedTeamId,
  clubNaam,
  teamNaam,
  onUpdateClubNaam,
  onUpdateTeamNaam,
  spelers,
  onVoegSpelerToe,
  onVerwijderSpeler,
  seizoenen,
  selectedSeizoenId,
  onSeizoenChange,
  onSeizoenUpdate,
  currentCoach
}: TeamBeheerProps) {
  const [activeTab, setActiveTab] = useState<'vast' | 'gast'>('vast');
  const [nieuwSpelerNaam, setNieuwSpelerNaam] = useState('');
  const [nieuwGastTeam, setNieuwGastTeam] = useState('');
  const [selectedSeizoenForTeam, setSelectedSeizoenForTeam] = useState<string>(selectedSeizoenId || '');

  // Filter spelers
  const vasteSpelers = spelers.filter(s => s.type !== 'gast');
  const gastSpelers = spelers.filter(s => s.type === 'gast');

  useEffect(() => {
    if (selectedSeizoenId) {
      setSelectedSeizoenForTeam(selectedSeizoenId);
    }
  }, [selectedSeizoenId]);

  const handleVoegSpelerToe = () => {
    if (!nieuwSpelerNaam.trim()) return;

    if (activeTab === 'vast') {
      onVoegSpelerToe(nieuwSpelerNaam, 'vast');
    } else {
      if (!nieuwGastTeam.trim()) {
        alert('Voer teamnaam in voor gastspeler');
        return;
      }
      onVoegSpelerToe(nieuwSpelerNaam, 'gast', nieuwGastTeam);
    }

    setNieuwSpelerNaam('');
    setNieuwGastTeam('');
  };

  const handleSeizoenChange = (seizoenId: string) => {
    setSelectedSeizoenForTeam(seizoenId);
    onSeizoenChange(seizoenId);
  };

  return (
    <div className="space-y-6">
      {/* ========== 1. TEAM AANMAKEN / BEHEER ========== */}
      <div className="border-2 border-blue-400 rounded-lg p-6 bg-blue-50">
        <h2 className="text-3xl font-bold mb-4">🏟️ Team</h2>

        <div className="space-y-4">
          {/* Club Naam */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Club Naam</label>
            <input
              type="text"
              value={clubNaam}
              onChange={(e) => onUpdateClubNaam(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-medium focus:outline-none focus:border-blue-600"
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
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-medium focus:outline-none focus:border-blue-600"
              placeholder="Bijv: Team A"
            />
          </div>

          {/* Seizoen Selectie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Seizoen</label>
            {seizoenen.length === 0 ? (
              <div className="p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-sm text-yellow-800">
                ⚠️ Geen seizoenen beschikbaar. Maak eerst een seizoen aan.
              </div>
            ) : (
              <select
                value={selectedSeizoenForTeam}
                onChange={(e) => handleSeizoenChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="">-- Selecteer seizoen --</option>
                {seizoenen.map(s => (
                  <option key={s.seizoenId} value={s.seizoenId}>
                    {s.naam} ({s.status === 'actief' ? '✅ Actief' : '📦 Gearchiveerd'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Team Info Display */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Club</p>
                <p className="text-lg font-bold text-blue-600">{clubNaam || 'Niet ingesteld'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Team</p>
                <p className="text-lg font-bold text-blue-600">{teamNaam || 'Niet ingesteld'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Seizoen</p>
                <p className="text-lg font-bold text-blue-600">
                  {seizoenen.find(s => s.seizoenId === selectedSeizoenForTeam)?.naam || 'Niet geselecteerd'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Spelaers</p>
                <p className="text-lg font-bold text-blue-600">{spelers.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 2. SPELERSLIJST ========== */}
      <div className="border-2 border-green-400 rounded-lg p-6 bg-green-50">
        <h2 className="text-3xl font-bold mb-4">👥 Spelerslijst</h2>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b-2 border-green-300">
          <button
            onClick={() => setActiveTab('vast')}
            className={`px-6 py-3 font-bold text-lg transition-colors ${
              activeTab === 'vast'
                ? 'border-b-4 border-green-600 text-green-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚽ Vaste Spelaers ({vasteSpelers.length})
          </button>
          <button
            onClick={() => setActiveTab('gast')}
            className={`px-6 py-3 font-bold text-lg transition-colors ${
              activeTab === 'gast'
                ? 'border-b-4 border-orange-600 text-orange-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👤 Gastspelaers ({gastSpelers.length})
          </button>
        </div>

        {/* INPUT FORM */}
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-green-200">
          {activeTab === 'vast' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Spelaer Naam</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nieuwSpelerNaam}
                  onChange={(e) => setNieuwSpelerNaam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVoegSpelerToe()}
                  placeholder="Bijv: Jan de Vries"
                  className="flex-1 px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600"
                />
                <button
                  onClick={handleVoegSpelerToe}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Toevoegen
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gastspelaer Naam</label>
                <input
                  type="text"
                  value={nieuwSpelerNaam}
                  onChange={(e) => setNieuwSpelerNaam(e.target.value)}
                  placeholder="Bijv: Jeroen van Berg"
                  className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Team/Club</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nieuwGastTeam}
                    onChange={(e) => setNieuwGastTeam(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVoegSpelerToe()}
                    placeholder="Bijv: VV Ajax"
                    className="flex-1 px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-600"
                  />
                  <button
                    onClick={handleVoegSpelerToe}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Toevoegen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SPELAERSLIJST DISPLAY */}
        <div className="space-y-2">
          {activeTab === 'vast' ? (
            <>
              {vasteSpelers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Nog geen vaste spelaers</p>
                  <p className="text-sm">Voeg hierboven je eerste spelaer toe!</p>
                </div>
              ) : (
                vasteSpelers.map(speler => (
                  <div
                    key={speler.id}
                    className="flex items-center justify-between p-4 bg-white border-2 border-green-300 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚽</span>
                      <div>
                        <p className="font-bold text-gray-800">{speler.naam}</p>
                        <p className="text-xs text-gray-500">Vaste spelaer</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onVerwijderSpeler(speler.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Verwijder spelaer"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {gastSpelers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Nog geen gastspelaers</p>
                  <p className="text-sm">Voeg hierboven je eerste gastspelaer toe!</p>
                </div>
              ) : (
                gastSpelers.map(speler => (
                  <div
                    key={speler.id}
                    className="flex items-center justify-between p-4 bg-orange-100 border-2 border-orange-400 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      <div>
                        <p className="font-bold text-gray-800">{speler.naam}</p>
                        <p className="text-xs text-gray-600">Gast uit: {speler.team || 'Onbekend'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onVerwijderSpeler(speler.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Verwijder gastspelaer"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* ========== 3. COACHES BEHEREN ========== */}
      {selectedTeamId && currentCoach && (
        <InviteCoaches teamId={selectedTeamId} currentCoach={currentCoach} />
      )}
    </div>
  );
}
