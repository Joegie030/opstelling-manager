import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader, MoreVertical } from 'lucide-react';
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
  // DEBUG
  useEffect(() => {
    console.log('=== TEAM BEHEER DEBUG ===');
    console.log('Totaal spelers:', spelers.length);
    console.log('Alle spelers:', spelers);
    spelers.forEach((s, i) => {
      console.log(`Speler ${i}: naam="${s.naam}", type="${s.type}", id=${s.id}`);
    });
  }, [spelers]);

  const [activeTab, setActiveTab] = useState<'vast' | 'gast'>('vast');
  const [nieuwSpelerNaam, setNieuwSpelerNaam] = useState('');
  const [nieuwGastTeam, setNieuwGastTeam] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamClub, setNewTeamClub] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeamLoading, setCreatingTeamLoading] = useState(false);
  const [creatingTeamMessage, setCreatingTeamMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const vasteSpelers = spelers.filter(s => s.type === 'vast');
  const gastSpelers = spelers.filter(s => s.type === 'gast');

  console.log('Gefilterde vaste spelers:', vasteSpelers);
  console.log('Gefilterde gast spelers:', gastSpelers);

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
        text: `Team "${newTeamClub} - ${newTeamName}" aangemaakt!`
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
      {/* ========== TEAM INFO ========== */}
      <div className="border-2 border-blue-400 rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">⚙️ Team Instellingen</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Club Naam</label>
            <input
              type="text"
              value={clubNaam}
              onChange={(e) => onUpdateClubNaam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Bijv: VV Amsterdam"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Team Naam</label>
            <input
              type="text"
              value={teamNaam}
              onChange={(e) => onUpdateTeamNaam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Bijv: Team A"
            />
          </div>
        </div>
      </div>

      {/* ========== DEBUG INFO ========== */}
      <div className="border-2 border-red-400 rounded-lg p-4 bg-red-50">
        <h4 className="font-bold text-red-900 mb-2">DEBUG INFO</h4>
        <div className="text-xs space-y-1 text-red-800 font-mono">
          <p>Totaal spelers: {spelers.length}</p>
          <p>Vaste: {vasteSpelers.length}</p>
          <p>Gast: {gastSpelers.length}</p>
          <p>Actieve tab: {activeTab}</p>
          {spelers.length > 0 && (
            <>
              <p className="mt-2">Eerste speler:</p>
              <p>- type: "{spelers[0].type}"</p>
              <p>- naam: "{spelers[0].naam}"</p>
              <p>- type === 'vast': {spelers[0].type === 'vast' ? 'JA' : 'NEE'}</p>
            </>
          )}
        </div>
      </div>

      {/* ========== VASTE SPELERS ========== */}
      <div className="border-2 border-green-400 rounded-lg p-6 bg-green-50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">⚽ Vaste Spelers ({vasteSpelers.length})</h3>

        {/* INPUT */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={activeTab === 'vast' ? nieuwSpelerNaam : ''}
              onChange={(e) => {
                setNieuwSpelerNaam(e.target.value);
                setActiveTab('vast');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setActiveTab('vast');
                  handleVoegSpelerToe();
                }
              }}
              placeholder="Bijv: Jan de Vries"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => {
                setActiveTab('vast');
                handleVoegSpelerToe();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Toevoegen
            </button>
          </div>
        </div>

        {/* SPELAERSLIJST */}
        {vasteSpelers.length === 0 ? (
          <p className="text-center py-6 text-gray-600 text-sm">Nog geen vaste spelers</p>
        ) : (
          <div className="space-y-2">
            {vasteSpelers.map(speler => (
              <div
                key={speler.id}
                className="flex items-center justify-between p-3 bg-white border border-green-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚽</span>
                  <span className="font-medium text-gray-900">{speler.naam}</span>
                </div>
                <button
                  onClick={() => onVerwijderSpeler(speler.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== GASTSPEAKERS ========== */}
      <div className="border-2 border-orange-400 rounded-lg p-6 bg-orange-50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🤝 Gastspeakers ({gastSpelers.length})</h3>

        {/* INPUT */}
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={activeTab === 'gast' ? nieuwSpelerNaam : ''}
            onChange={(e) => {
              setNieuwSpelerNaam(e.target.value);
              setActiveTab('gast');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setActiveTab('gast');
                handleVoegSpelerToe();
              }
            }}
            placeholder="Gastspeaker naam"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={activeTab === 'gast' ? nieuwGastTeam : ''}
              onChange={(e) => {
                setNieuwGastTeam(e.target.value);
                setActiveTab('gast');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setActiveTab('gast');
                  handleVoegSpelerToe();
                }
              }}
              placeholder="Team/Club"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => {
                setActiveTab('gast');
                handleVoegSpelerToe();
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Toevoegen
            </button>
          </div>
        </div>

        {/* SPELAERSLIJST */}
        {gastSpelers.length === 0 ? (
          <p className="text-center py-6 text-gray-600 text-sm">Nog geen gastspeakers</p>
        ) : (
          <div className="space-y-2">
            {gastSpelers.map(speler => (
              <div
                key={speler.id}
                className="flex items-center justify-between p-3 bg-white border border-orange-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🤝</span>
                  <div>
                    <div className="font-medium text-gray-900">{speler.naam}</div>
                    <div className="text-xs text-gray-600">{speler.team || 'Onbekend'}</div>
                  </div>
                </div>
                <button
                  onClick={() => onVerwijderSpeler(speler.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== NIEUW TEAM (ADMIN ONLY) ========== */}
      {currentCoach?.rol === 'admin' && (
        <div className="border-2 border-purple-400 rounded-lg p-6 bg-purple-50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">➕ Nieuw Team Aanmaken</h3>

          {creatingTeamMessage && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
              creatingTeamMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {creatingTeamMessage.text}
            </div>
          )}

          {!isCreatingTeam ? (
            <button
              onClick={() => setIsCreatingTeam(true)}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Maak Nieuw Team
            </button>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <input
                type="text"
                value={newTeamClub}
                onChange={(e) => setNewTeamClub(e.target.value)}
                placeholder="Club naam"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={creatingTeamLoading}
                autoFocus
              />
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team naam"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={creatingTeamLoading}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creatingTeamLoading || !newTeamClub.trim() || !newTeamName.trim()}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm"
                >
                  Annuleer
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========== MEER OPTIES (Testdata + Wissen) ========== */}
      <div className="relative">
        <button
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <MoreVertical className="w-4 h-4" />
          Meer opties
        </button>

        {showMoreOptions && (
          <div className="absolute top-8 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                onLaadTestdata();
                setShowMoreOptions(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 border-b border-gray-200"
            >
              Testdata Laden
            </button>
            <button
              onClick={() => {
                if (confirm('Weet je zeker dat je alles wilt wissen?')) {
                  onWisAlles();
                  setShowMoreOptions(false);
                }
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
            >
              Alles Wissen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
