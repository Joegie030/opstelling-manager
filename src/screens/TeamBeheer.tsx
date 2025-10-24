import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  teamId,
  seizoenen = [],
  selectedSeizoenId,
  onSeizoenChange,
  onSeizoenUpdate
}: Props) {
  console.log('TeamBeheer RENDERING!', { spelers: spelers.length, clubNaam });

  const [activeTab, setActiveTab] = useState<'vast' | 'gast'>('vast');
  const [nieuwSpelerNaam, setNieuwSpelerNaam] = useState('');
  const [nieuwGastTeam, setNieuwGastTeam] = useState('');

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
    <div className="space-y-6 p-4 bg-yellow-100 min-h-screen">
      {/* DEBUG MESSAGE */}
      <div className="bg-yellow-300 border-4 border-red-500 p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-red-600">🔴 DEBUG: TeamBeheer is aan het renderen!</h1>
        <p className="text-black">Club: {clubNaam}</p>
        <p className="text-black">Team: {teamNaam}</p>
        <p className="text-black">Spelers: {spelers.length}</p>
      </div>

      {/* TEAM INFO */}
      <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
        <h2 className="text-2xl font-bold mb-4">🏟️ Team Instellingen</h2>
        <div className="space-y-4">
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onLaadTestdata}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"
            >
              📋 Testdata
            </button>
            <button
              onClick={onWisAlles}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm"
            >
              🗑️ Wissen
            </button>
          </div>
        </div>
      </div>

      {/* SPELAERSLIJST */}
      <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
        <h2 className="text-2xl font-bold mb-4">👥 Spelaerslijst</h2>
        <div className="flex gap-2 mb-4 border-b-2 border-green-300">
          <button
            onClick={() => setActiveTab('vast')}
            className={`px-4 py-2 font-bold transition-colors ${
              activeTab === 'vast'
                ? 'border-b-4 border-green-600 text-green-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚽ Vast ({vasteSpelers.length})
          </button>
          <button
            onClick={() => setActiveTab('gast')}
            className={`px-4 py-2 font-bold transition-colors ${
              activeTab === 'gast'
                ? 'border-b-4 border-orange-600 text-orange-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👤 Gast ({gastSpelers.length})
          </button>
        </div>

        <div className="space-y-2">
          {activeTab === 'vast' ? (
            <>
              {vasteSpelers.length === 0 ? (
                <p className="text-gray-500">Geen vaste spelers</p>
              ) : (
                vasteSpelers.map(s => (
                  <div key={s.id} className="flex justify-between p-2 bg-white border rounded">
                    <span>{s.naam}</span>
                    <button onClick={() => onVerwijderSpeler(s.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {gastSpelers.length === 0 ? (
                <p className="text-gray-500">Geen gastspeakers</p>
              ) : (
                gastSpelers.map(s => (
                  <div key={s.id} className="flex justify-between p-2 bg-orange-100 border rounded">
                    <span>{s.naam}</span>
                    <button onClick={() => onVerwijderSpeler(s.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
