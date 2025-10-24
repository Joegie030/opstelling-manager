import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Speler } from '../types';
import InviteCoaches from '../components/InviteCoaches';

interface TeamBeheerProps {
  // Team Data
  teamId: string | null;
  clubNaam: string;
  teamNaam: string;
  onUpdateClubNaam: (naam: string) => void;
  onUpdateTeamNaam: (naam: string) => void;

  // Spelers
  spelers: Speler[];
  onVoegSpelerToe: (naam: string, type?: 'vast' | 'gast', team?: string) => void;
  onVerwijderSpeler: (id: number) => void;

  // Coach & Team Creation
  currentCoach?: any;
  onCreateTeam?: (clubNaam: string, teamNaam: string) => Promise<void>;
}

export default function TeamBeheer({
  teamId,
  clubNaam,
  teamNaam,
  onUpdateClubNaam,
  onUpdateTeamNaam,
  spelers,
  onVoegSpelerToe,
  onVerwijderSpeler,
  currentCoach,
  onCreateTeam
}: TeamBeheerProps) {
  const [activeTab, setActiveTab] = useState<'vast' | 'gast'>('vast');
  const [nieuwSpelerNaam, setNieuwSpelerNaam] = useState('');
  const [nieuwGastTeam, setNieuwGastTeam] = useState('');
  
  // Modal voor nieuw team
  const [createTeamModal, setCreateTeamModal] = useState(!teamId);
  const [newClubNaam, setNewClubNaam] = useState('');
  const [newTeamNaam, setNewTeamNaam] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Filter spelers
  const vasteSpelers = spelers.filter(s => s.type !== 'gast');
  const gastSpelers = spelers.filter(s => s.type === 'gast');

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

  const handleCreateTeam = async () => {
    if (!newClubNaam.trim() || !newTeamNaam.trim()) {
      alert('Voer zowel club naam als team naam in');
      return;
    }

    if (!onCreateTeam) {
      alert('Fout: createTeam functie niet beschikbaar');
      return;
    }

    try {
      setIsCreating(true);
      await onCreateTeam(newClubNaam, newTeamNaam);
      setCreateTeamModal(false);
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Fout bij aanmaken team: ' + error);
    } finally {
      setIsCreating(false);
    }
  };

  // Toon modal als geen team
  if (createTeamModal && !teamId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="bg-blue-50 border-b-2 border-blue-300 p-6">
            <h2 className="text-2xl font-bold text-blue-800">🏟️ Maak Je Team Aan</h2>
            <p className="text-sm text-blue-600 mt-2">Begin met het aanmaken van je eerste team</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Club Naam</label>
              <input
                type="text"
                value={newClubNaam}
                onChange={(e) => setNewClubNaam(e.target.value)}
                placeholder="Bijv: VV Amsterdam"
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Team Naam</label>
              <input
                type="text"
                value={newTeamNaam}
                onChange={(e) => setNewTeamNaam(e.target.value)}
                placeholder="Bijv: Team A"
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              <p>💡 Je kan later altijd meer teams aanmaken en spelers beheren.</p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex gap-2">
            <button
              onClick={handleCreateTeam}
              disabled={isCreating}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '⏳ Aanmaken...' : '✅ Maak Team'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========== 1. TEAM AANMAKEN / BEHEER ========== */}
      <div className="border-2 border-blue-400 rounded-lg p-6 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold">🏟️ Team</h2>
          {teamId && (
            <button
              onClick={() => setCreateTeamModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nieuw Team
            </button>
          )}
        </div>

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

          {/* Team Info Display */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Club</p>
                <p className="text-lg font-bold text-blue-600">{clubNaam || 'Niet ingesteld'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Team</p>
                <p className="text-lg font-bold text-blue-600">{teamNaam || 'Niet ingesteld'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Spelers</p>
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
            ⚽ Vaste Spelers ({vasteSpelers.length})
          </button>
          <button
            onClick={() => setActiveTab('gast')}
            className={`px-6 py-3 font-bold text-lg transition-colors ${
              activeTab === 'gast'
                ? 'border-b-4 border-orange-600 text-orange-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👤 Gastspelers ({gastSpelers.length})
          </button>
        </div>

        {/* INPUT FORM */}
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-green-200">
          {activeTab === 'vast' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Speler Naam</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gastspeler Naam</label>
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

        {/* SPELERSLIJST DISPLAY */}
        <div className="space-y-2">
          {activeTab === 'vast' ? (
            <>
              {vasteSpelers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Nog geen vaste spelers</p>
                  <p className="text-sm">Voeg hierboven je eerste speler toe!</p>
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
                        <p className="text-xs text-gray-500">Vaste speler</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onVerwijderSpeler(speler.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Verwijder speler"
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
                  <p className="text-lg">Nog geen gastspelers</p>
                  <p className="text-sm">Voeg hierboven je eerste gastspeler toe!</p>
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
                      title="Verwijder gastspeler"
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
      {teamId && currentCoach && (
        <InviteCoaches teamId={teamId} currentCoach={currentCoach} />
      )}
    </div>
  );
}
