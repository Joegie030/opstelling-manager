import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Shared Team Selector Dropdown Component
 * Used in both Navigation (compact) and TeamBeheer (full)
 */

export interface TeamInfo {
  teamId: string;
  teamNaam: string;
}

export interface TeamSelectorDropdownProps {
  teams: TeamInfo[];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  variant?: 'compact' | 'full';  // 'compact' for header, 'full' for TeamBeheer
  loading?: boolean;
  showLabel?: boolean;
}

export function TeamSelectorDropdown({
  teams,
  selectedTeamId,
  onSelectTeam,
  variant = 'compact',
  loading = false,
  showLabel = true
}: TeamSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Hide if only 1 team
  if (teams.length <= 1 && variant === 'compact') {
    return null;
  }

  // COMPACT VERSION (for Navigation header)
  if (variant === 'compact') {
    const selectedTeam = teams.find(t => t.teamId === selectedTeamId);
    const displayName = selectedTeam?.teamNaam || 'Team';

    return (
      <div className="relative hidden md:block mr-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 text-sm flex items-center gap-2 hover:bg-blue-700 rounded-lg transition-colors text-blue-100"
          title="Wissel team"
        >
          <span className="text-lg">🏛️</span>
          <span className="truncate max-w-xs">{displayName}</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>

        {/* Team dropdown menu */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl z-50">
            <div className="py-2">
              {teams.map((team) => (
                <button
                  key={team.teamId}
                  onClick={() => {
                    onSelectTeam(team.teamId);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    selectedTeamId === team.teamId
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>🏛️</span>
                  <span className="font-medium">{team.teamNaam}</span>
                  {selectedTeamId === team.teamId && (
                    <span className="ml-auto">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // FULL VERSION (for TeamBeheer screen)
  return (
    <div className="border-2 border-purple-400 rounded-lg p-4 bg-purple-50">
      <div className="flex items-center justify-between gap-3 mb-4">
        {showLabel && (
          <label className="text-sm font-semibold text-gray-700">Selecteer Team:</label>
        )}

        <div className="relative flex-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg bg-white hover:bg-purple-50 font-medium text-left flex items-center justify-between transition-colors"
          >
            <span className="truncate">
              📋 {teams.find(t => t.teamId === selectedTeamId)?.teamNaam || 'Selecteer team'}
            </span>
            <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Team dropdown menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-purple-300 rounded-lg shadow-lg z-40">
              <div className="py-2 max-h-64 overflow-y-auto">
                {teams.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    Geen teams beschikbaar
                  </div>
                ) : (
                  teams.map((team) => {
                    const isSelected = team.teamId === selectedTeamId;

                    return (
                      <button
                        key={team.teamId}
                        onClick={() => {
                          console.log('🟢 Clicked team:', team.teamId);
                          onSelectTeam(team.teamId);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors ${
                          isSelected
                            ? 'bg-purple-100 border-l-4 border-purple-600 text-purple-700 font-semibold'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="text-sm">
                          📋 {team.teamNaam}
                          {isSelected && ' ✓'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-xs text-gray-500 animate-pulse">
          ⏳ Teams laden...
        </div>
      )}
    </div>
  );
}
