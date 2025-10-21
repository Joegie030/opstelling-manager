import { useState } from 'react';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { Coach, Team } from '../types';

export const DEFAULT_MENU_ITEMS = [
  { id: 'wedstrijden', label: '📋 Wedstrijden', icon: '📋' },
  { id: 'team', label: '👥 Team', icon: '👥' },
  { id: 'statistieken', label: '📊 Statistieken', icon: '📊' },
  { id: 'instellingen', label: '⚙️ Instellingen', icon: '⚙️' },
  { id: 'help', label: 'ℹ️ Help', icon: 'ℹ️' }
];

interface Props {
  children: React.ReactNode;
  clubNaam: string;
  teamNaam: string;
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  menuItems: typeof DEFAULT_MENU_ITEMS;
  onLogout: () => void;
  currentCoach: Coach | null;
  selectedTeamId?: string | null;
  coachTeams?: Team[];
  onTeamChange?: (teamId: string) => void;
}

export default function Navigation({
  children,
  clubNaam,
  teamNaam,
  activeScreen,
  onScreenChange,
  menuItems,
  onLogout,
  currentCoach,
  selectedTeamId,
  coachTeams = [],
  onTeamChange
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);

  const selectedTeam = selectedTeamId && coachTeams.find(t => t.teamId === selectedTeamId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* LOGO */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚽</span>
              <div>
                <h1 className="text-xl font-bold">Opstelling</h1>
                <p className="text-xs text-blue-100">Formation Manager</p>
              </div>
            </div>

            {/* TEAM SELECTOR - HEADER (Desktop) */}
            {selectedTeam && coachTeams.length > 0 && onTeamChange && (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-blue-100">Huidig team:</p>
                  <p className="font-semibold">{selectedTeam.clubNaam}</p>
                  <p className="text-xs text-blue-100">{selectedTeam.teamNaam}</p>
                </div>

                {/* Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium">Switch</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {teamDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50">
                      <div className="p-3 max-h-64 overflow-y-auto space-y-2">
                        {coachTeams.map(team => (
                          <button
                            key={team.teamId}
                            onClick={() => {
                              onTeamChange(team.teamId);
                              setTeamDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              selectedTeamId === team.teamId
                                ? 'bg-blue-100 text-blue-900 font-semibold'
                                : 'text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            <div className="font-medium">{team.clubNaam}</div>
                            <div className="text-xs text-gray-600">{team.teamNaam}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* USER MENU */}
            <div className="flex items-center gap-4">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors text-sm font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* MOBILE TEAM SELECTOR */}
          {mobileMenuOpen && selectedTeam && coachTeams.length > 0 && onTeamChange && (
            <div className="md:hidden pb-4 border-t border-blue-500">
              <p className="text-xs text-blue-100 mt-3 mb-2">Huidig team: {selectedTeam.clubNaam}</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {coachTeams.map(team => (
                  <button
                    key={team.teamId}
                    onClick={() => {
                      onTeamChange(team.teamId);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedTeamId === team.teamId
                        ? 'bg-white bg-opacity-20 font-semibold'
                        : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                    }`}
                  >
                    <div className="font-medium text-sm">{team.clubNaam}</div>
                    <div className="text-xs text-blue-100">{team.teamNaam}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onScreenChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  activeScreen === item.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
