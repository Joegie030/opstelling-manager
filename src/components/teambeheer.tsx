import { useState } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { Speler } from '../types';
import { createNewTeam } from '../firebase/firebaseService';
import { Coach } from '../firebase/firebaseService';

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
  currentCoach?: Coach | null;
  onNewTeamCreated?: () => void;
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
  currentCoach,
  onNewTeamCreated
}: Props) {
  const [activeTab, setActiveTab] = useState<'vast' | 'gast'>('vast');
  const [nieuwSpelerNaam, setNieuwSpelerNaam] = useState('');
  const [nieuwGastTeam, setNieuwGastTeam] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamClub, setNewTeamClub] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeamLoading, setCreatingTeamLoading] = useState(false);
  const [creatingTeamMessage, setCreatingTeamMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const vasteSpelers = spelers.filter(s => s.type === 'vast');
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCoach) {
      setCreatingTeamMessage({ type: 'error', text: 'Je moet ingelogd zijn' });
      return;
    }

    if (!newTeamClub.trim() || !newTeamName.trim()) {
      setCreatingTeamMessage({ type: 'error', text: 'Voer club en team naam in' });
      return;
    }

    if (currentCoach.rol !== 'admin') {
      setCreatingTeamMessage({ type: 'error', text: 'Alleen admins kunnen teams aanmaken' });
      return;
    }

    setCreatingTeamLoading(true);
    setCreatingTeamMessage(null);

    try {
      const teamId = await createNewTeam(currentCoach.uid, newTeamClub, newTeamName);
      setCreatingTeamMessage({
        type: 'success',
        text: `✅ Team "${newTeamClub} - ${newTeamName}" aangemaakt!`
      });
      setNewTeamClub('');
      setNewTeamName('');
      setIsCreatingTeam(false);
      
      onNewTeamCreated?.();
      
      setTimeout(() => setCreatingTeamMessage(null), 3000);
    } catch (error: any) {
      setCreatingTeamMessage({
        type: 'error',
        text: error.message || 'Fout bij aanmaken team'
      });
    } finally {
      setCreatingTeamLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========== HUIDIG TEAM INFO ========== */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Instellingen</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Club Naam</label>
            <input
              type="text"
              value={clubNaam}
              onChange={(e) => onUpdateClubNaam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              placeholder="Bijv: VV Amsterdam"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Team Naam</label>
            <input
              type="text"
              value={teamNaam}
              onChange={(e) => onUpdateTeamNaam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              placeholder="Bijv: Team A"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onLaadTestdata}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Testdata Laden
            </button>
            <button
              onClick={onWisAlles}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Alles Wissen
            </button>
          </div>
        </div>
      </section>

      {/* ========== SPELAERSLIJST ========== */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Spelaerslijst</h2>

        {/* TABS */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('vast')}
            className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'vast'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚽ Vaste Spelers ({vasteSpelers.length})
          </button>
          <button
            onClick={() => setActiveTab('gast')}
            className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'gast'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🤝 Gastspeakers ({gastSpelers.length})
          </button>
        </div>

        {/* INPUT */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          {activeTab === 'vast' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Speler naam toevoegen</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nieuwSpelerNaam}
                  onChange={(e) => setNieuwSpelerNaam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVoegSpelerToe()}
                  placeholder="Bijv: Jan de Vries"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={handleVoegSpelerToe}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Toevoegen
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gastspeaker naam</label>
                <input
                  type="text"
                  value={nieuwSpelerNaam}
                  onChange={(e) => setNieuwSpelerNaam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVoegSpelerToe()}
                  placeholder="Bijv: Jeroen van Berg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={handleVoegSpelerToe}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Toevoegen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SPELAERSLIJST */}
        <div className="space-y-2">
          {activeTab === 'vast' ? (
            <>
              {vasteSpelers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nog geen vaste spelers. Voeg er een toe!
                </div>
              ) : (
                vasteSpelers.map(speler => (
                  <div
                    key={speler.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⚽</span>
                      <span className="font-medium text-gray-900">{speler.naam}</span>
                    </div>
                    <button
                      onClick={() => onVerwijderSpeler(speler.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Verwijder speler"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {gastSpelers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nog geen gastspeakers. Voeg er een toe!
                </div>
              ) : (
                gastSpelers.map(speler => (
                  <div
                    key={speler.id}
                    className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🤝</span>
                      <div>
                        <div className="font-medium text-gray-900">{speler.naam}</div>
                        <div className="text-xs text-gray-600">uit: {speler.team || 'Onbekend'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onVerwijderSpeler(speler.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Verwijder gastspeaker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* SAMENVATTING */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <strong>{spelers.length}</strong> spelers totaal ({vasteSpelers.length} vast, {gastSpelers.length} gast)
        </div>
      </section>

      {/* ========== NIEUW TEAM (ADMIN ONLY) ========== */}
      {currentCoach?.rol === 'admin' && (
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nieuw Team Aanmaken</h2>

          {creatingTeamMessage && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
              creatingTeamMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {creatingTeamMessage.text}
            </div>
          )}

          {!isCreatingTeam ? (
            <button
              onClick={() => setIsCreatingTeam(true)}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Maak Nieuw Team
            </button>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Club Naam</label>
                <input
                  type="text"
                  value={newTeamClub}
                  onChange={(e) => setNewTeamClub(e.target.value)}
                  placeholder="Bijv: VV Ajax"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  disabled={creatingTeamLoading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Team Naam</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Bijv: F1 - Oranje"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  disabled={creatingTeamLoading}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={creatingTeamLoading || !newTeamClub.trim() || !newTeamName.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {creatingTeamLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {creatingTeamLoading ? 'Bezig...' : 'Maak aan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingTeam(false);
                    setNewTeamClub('');
                    setNewTeamName('');
                    setCreatingTeamMessage(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm transition-colors"
                >
                  Annuleer
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                💡 Je kan later coaches uitnodigen om aan dit team mee te doen via Instellingen.
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
