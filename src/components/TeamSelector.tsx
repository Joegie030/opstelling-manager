import { useState } from 'react';
import { Plus, Loader, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { createNewTeam, switchTeam } from '../firebase/firebaseService';

interface Coach {
  uid: string;
  email: string;
  naam: string;
  teamId: string;
  teams?: string[];
  currentTeamId?: string;
  rol: 'admin' | 'coach' | 'viewer';
  createdAt: string;
}

interface Team {
  teamId: string;
  clubNaam: string;
  teamNaam: string;
  formatie: string;
  createdBy: string;
  createdAt: string;
  coaches: string[];
  spelers?: any[];
  wedstrijden?: any[];
}

interface Props {
  currentCoach: Coach | null;
  teams: Team[];
  selectedTeamId: string | null;
  onTeamChange: (teamId: string) => void;
  onNewTeam: () => void;
}

export default function TeamSelector({
  currentCoach,
  teams,
  selectedTeamId,
  onTeamChange,
  onNewTeam
}: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentCoach) return null;

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClubName.trim() || !newTeamName.trim()) {
      setMessage({ type: 'error', text: 'Voer club en team naam in' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const teamId = await createNewTeam(currentCoach.uid, newClubName, newTeamName);
      setMessage({ 
        type: 'success', 
        text: `✅ Team "${newClubName} - ${newTeamName}" aangemaakt!` 
      });
      setNewClubName('');
      setNewTeamName('');
      setIsCreating(false);
      
      // Refresh teams en switch naar nieuw team
      onNewTeam();
      onTeamChange(teamId);
      
      // Clear message na 3 seconden
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Fout bij aanmaken team' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTeam = async (teamId: string) => {
    if (selectedTeamId === teamId) return;

    setLoading(true);
    try {
      await switchTeam(currentCoach.uid, teamId);
      onTeamChange(teamId);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Fout bij wisselen team' 
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentCoach.rol === 'admin';
  const selectedTeam = teams.find(t => t.teamId === selectedTeamId);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg p-4 sm:p-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 text-gray-800">
            🏢 Teams
            <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
              {teams.length}
            </span>
          </h3>
          <p className="text-xs text-gray-600 mt-1">Selecteer of maak een team aan</p>
        </div>
        {currentCoach && (
          <div className="text-right text-xs">
            <p className="font-medium text-gray-700">{currentCoach.naam}</p>
            <p className="text-gray-500">{currentCoach.rol === 'admin' ? '👑 Admin' : '👤 Coach'}</p>
          </div>
        )}
      </div>

      {/* STATUS MESSAGES */}
      {message && (
        <div className={`p-3 rounded-lg flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border-2 border-green-300'
            : 'bg-red-50 border-2 border-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          )}
          <p className={message.type === 'success' ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>
            {message.text}
          </p>
        </div>
      )}

      {/* TEAMS GRID */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map(team => {
            const isSelected = selectedTeamId === team.teamId;
            const isCreator = currentCoach.uid === team.createdBy;
            
            return (
              <button
                key={team.teamId}
                onClick={() => handleSwitchTeam(team.teamId)}
                disabled={loading || isSelected}
                className={`p-4 rounded-lg border-2 transition-all text-left shadow-sm ${
                  isSelected
                    ? 'border-purple-600 bg-gradient-to-br from-purple-200 to-indigo-200 font-bold text-purple-900 ring-2 ring-purple-400'
                    : 'border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400 text-gray-800'
                } ${loading && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base truncate">
                      {team.clubNaam}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {team.teamNaam}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        👥 {team.coaches.length} coach{team.coaches.length !== 1 ? 'es' : ''}
                      </span>
                      {isCreator && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          👑 Maker
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          ✅ Actief
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && loading && (
                    <Loader className="w-5 h-5 animate-spin text-purple-600 ml-2" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">Nog geen teams</p>
          <p className="text-sm text-gray-400">Maak je eerste team aan!</p>
        </div>
      )}

      {/* CURRENT TEAM INFO */}
      {selectedTeam && (
        <div className="bg-white rounded-lg p-4 border-2 border-blue-200 space-y-2">
          <h4 className="font-bold text-blue-900 text-sm">📊 Huidge Team Info</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-600">Club</p>
              <p className="font-semibold text-gray-800">{selectedTeam.clubNaam}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Team</p>
              <p className="font-semibold text-gray-800">{selectedTeam.teamNaam}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Spelers</p>
              <p className="font-semibold text-gray-800">{selectedTeam.spelers?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Wedstrijden</p>
              <p className="font-semibold text-gray-800">{selectedTeam.wedstrijden?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* NEW TEAM FORM - ONLY ADMINS */}
      {isAdmin && (
        <>
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
              disabled={loading}
            >
              <Plus className="w-5 h-5" />
              <span>Nieuw Team Aanmaken</span>
            </button>
          ) : (
            <form onSubmit={handleCreateTeam} className="border-2 border-green-300 bg-green-50 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-green-900 text-sm">🆕 Nieuw Team</h4>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Club Naam
                </label>
                <input
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="Bijv: VV Ajax"
                  className="w-full px-3 py-2 border-2 border-green-300 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Team Naam
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Bijv: F1 - Oranje"
                  className="w-full px-3 py-2 border-2 border-green-300 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || !newClubName.trim() || !newTeamName.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {loading ? 'Bezig...' : 'Maak aan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewClubName('');
                    setNewTeamName('');
                    setMessage(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm transition-colors"
                >
                  Annuleer
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Je kan coaches later uitnodigen om aan dit team mee te doen!
                </p>
              </div>
            </form>
          )}
        </>
      )}

      {!isAdmin && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Note:</strong> Je bent coach, geen admin. Alleen admins kunnen teams aanmaken. Vraag je admin om uitnodigen!
          </p>
        </div>
      )}
    </div>
  );
}
