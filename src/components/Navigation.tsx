import { ReactNode, useState } from 'react';
import { Menu, X, User, Calendar, BarChart3, Users, Settings, LogOut, HelpCircle, ChevronRight } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface Coach {
  naam: string;
  email: string;
  teamId: string;
}

interface NavigationProps {
  clubNaam: string;
  teamNaam: string;
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  children: ReactNode;
  menuItems?: MenuItem[];
  onLogout?: () => void;
  currentCoach?: Coach | null;
}

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'wedstrijden',
    label: 'Wedstrijden',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    id: 'statistieken',
    label: 'Statistieken',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 'team',
    label: 'Team',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'instellingen',
    label: 'Instellingen',
    icon: <Settings className="w-5 h-5" />
  }
];

export function Navigation({
  clubNaam,
  teamNaam,
  activeScreen,
  onScreenChange,
  children,
  menuItems = DEFAULT_MENU_ITEMS,
  onLogout,
  currentCoach
}: NavigationProps) {
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleMenuSelect = (id: string) => {
    onScreenChange(id);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  };

  // Desktop menu items (max 3 visible, rest in "More")
  const visibleItems = menuItems.slice(0, 3);
  const moreItems = menuItems.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* TOP NAVBAR */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto">
            {/* Top row: Logo + Hamburger (mobile) / Logo + User (desktop) */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                {/* Logo SVG */}
                <svg width="36" height="36" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <rect x="30" y="60" width="420" height="360" rx="40" stroke="white" strokeWidth="50" fill="#003d82"/>
                  <line x1="240" y1="60" x2="240" y2="420" stroke="white" strokeWidth="20"/>
                  <path d="M 120 180 Q 240 240 360 120" stroke="white" strokeWidth="20" fill="none" strokeLinecap="round"/>
                  <circle cx="120" cy="120" r="20" fill="white"/>
                  <circle cx="120" cy="120" r="12" fill="#5ec969"/>
                  <circle cx="120" cy="300" r="20" fill="white"/>
                  <circle cx="120" cy="300" r="12" fill="#5ec969"/>
                  <circle cx="240" cy="240" r="20" fill="white"/>
                  <circle cx="240" cy="240" r="12" fill="#003d82"/>
                  <circle cx="360" cy="120" r="20" fill="white"/>
                  <circle cx="360" cy="120" r="12" fill="#5ec969"/>
                  <circle cx="360" cy="300" r="20" fill="white"/>
                  <circle cx="360" cy="300" r="12" fill="#5ec969"/>
                </svg>

                {/* Brand text */}
                <div className="flex flex-col">
                  <h1 className="font-bold text-lg truncate">
                    Joegie
                  </h1>
                  <p className="text-xs text-blue-200 truncate">
                    Formation Manager
                  </p>
                </div>

                {/* Club info */}
                <div className="ml-auto flex flex-col text-right hidden sm:flex">
                  <p className="text-xs text-blue-200 truncate">
                    🏆 {clubNaam}
                  </p>
                  <p className="text-xs text-blue-200 truncate">
                    {teamNaam}
                  </p>
                </div>
              </div>
              
              {/* Desktop: User button */}
              {currentCoach && (
                <div className="relative hidden md:block">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                    title="Profiel"
                  >
                    <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {currentCoach.naam.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl z-50">
                      {/* Coach info */}
                      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {currentCoach.naam.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{currentCoach.naam}</p>
                            <p className="text-xs text-gray-600 truncate">{currentCoach.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left">
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Profiel instellingen</span>
                        </button>



                        <button 
                          onClick={() => {
                            handleMenuSelect('help');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <HelpCircle className="w-5 h-5" />
                          <span className="font-medium">Help</span>
                        </button>

                        <div className="border-t border-gray-200 my-2"></div>

                        {onLogout && (
                          <button
                            onClick={() => {
                              onLogout();
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Uitloggen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile: Hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors md:hidden"
                title="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Bottom row: Horizontal menu (desktop only) */}
            <div className="hidden md:flex items-center gap-1">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuSelect(item.id)}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${
                    activeScreen === item.id
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-600 rounded-full text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              {/* More menu dropdown (desktop) */}
              {moreItems.length > 0 && (
                <div className="relative ml-2">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${
                      moreMenuOpen
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  >
                    <Menu className="w-5 h-5" />
                    <span className="font-medium">Meer</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {moreMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl z-50">
                      <div className="py-2">
                        {moreItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleMenuSelect(item.id)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors ${
                              activeScreen === item.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{item.icon}</span>
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                              <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}

                        <div className="border-t border-gray-200 my-2"></div>

                        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left">
                          <HelpCircle className="w-5 h-5" />
                          <span className="font-medium">Help</span>
                        </button>

                        {onLogout && (
                          <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-200"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Log uit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto py-2">
            {/* Mobile: Coach info */}
            {currentCoach && (
              <>
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {currentCoach.naam.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{currentCoach.naam}</p>
                      <p className="text-xs text-gray-600 truncate">{currentCoach.email}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuSelect(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors ${
                  activeScreen === item.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="border-t border-gray-200 my-2"></div>

            <button 
              onClick={() => {
                handleMenuSelect('help');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Uitloggen</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <div className="px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
