import { useState } from 'react';
import { Plus, Trash2, MoreVertical } from 'lucide-react';
import { Speler } from '../types';

interface Props {
  spelers: Speler[];
  clubNaam: string;
  teamNaam: string;
  onVoegSpelerToe: (naam: string, type?: 'vast' | 'gast', team?: string) => void;
  onVerwijderSpeler: (id: number) => void;
  onUpdateClubNaam: (naam: string) => void;
  onUpdateTeamNaam: (naam: string) => void;
  onLaadTestdata: () => void;
  onWisAlles: () => void;
}

export default function TeamBeheer({
  spelers,
  clubNaam,
  teamNaam,
  onVoegSpelerToe,
  onVerwijderSpeler,
  onUpdateClubNaam,
  onUpdateTeamNaam,
  onLaadTestdata,
  onWisAlles
}: Props) {
  const [activeTab, setActiveTab] = useState<'vast' | 'gast'>('vast');
  const [nieuwSpelerNaam, setNieuwSpelerNaam] = useState('');
  const [nieuwGastTeam, setNieuwGastTeam] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const vasteSpelers = spelers.filter(s => !s.type || s.type === 'vast');
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
              placeholder="Bijv: VV Clubnaam"
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

      {/* ========== VASTE SPELERS ========== */}
      <div className="border-2 border-green-400 rounded-lg p-6 bg-green-50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">⚽ Vaste Spelers ({vasteSpelers.length})</h3>

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
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🤝 Gastspelers ({gastSpelers.length})</h3>

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
            placeholder="Gastspeler naam"
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

        {gastSpelers.length === 0 ? (
          <p className="text-center py-6 text-gray-600 text-sm">Nog geen gastspelers</p>
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

      {/* ========== MEER OPTIES ========== */}
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
