import { ReactNode, useState } from 'react';
import { Menu, X, User, Calendar, BarChart3, Users, Settings, LogOut, HelpCircle, ChevronRight } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavigationProps {
  clubNaam: string;
  teamNaam: string;
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  children: ReactNode;
  menuItems?: MenuItem[];
  onLogout?: () => void;
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
  onLogout
}: NavigationProps) {
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuSelect = (id: string) => {
    onScreenChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* TOP HEADER */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-bold text-lg truncate">
              ⚽ Opstelling Manager
            </h1>
            <p className="text-xs text-blue-200 truncate">
              🏆 {clubNaam} • {teamNaam}
            </p>
          </div>
          
          <button 
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors hidden sm:block"
            title="Profiel"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto pb-24 sm:pb-6">
        <div className="px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="flex items-center justify-between h-16">
          {/* Desktop buttons visible on small screens */}
          <button
            onClick={() => handleMenuSelect('wedstrijden')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              activeScreen === 'wedstrijden' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">Wedstrijden</span>
          </button>

          <button
            onClick={() => handleMenuSelect('statistieken')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              activeScreen === 'statistieken' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Statistieken</span>
          </button>

          {/* Hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              mobileMenuOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-xl">
            <div className="max-h-96 overflow-y-auto">
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

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Help */}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Help</span>
              </button>

              {/* Logout */}
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
      </nav>

      {/* DESKTOP TOP MENU - Hidden on mobile */}
      <nav className="hidden sm:block bg-white border-b border-gray-200 shadow">
        <div className="px-4 py-0">
          <div className="max-w-7xl mx-auto flex items-center gap-2 justify-between">
            {/* Main menu items */}
            <div className="flex gap-0">
              {menuItems.slice(0, 2).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuSelect(item.id)}
                  className={`px-4 py-3 flex items-center gap-2 transition-colors border-b-2 ${
                    activeScreen === item.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Right side menu */}
            <div className="flex items-center gap-2">
              {/* Other menu items dropdown */}
              <div className="relative group">
                <button className="px-4 py-3 flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-lg">
                  <Menu className="w-5 h-5" />
                  <span className="font-medium">Menu</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
                  <div className="py-2">
                    {menuItems.slice(2).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleMenuSelect(item.id)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2 transition-colors ${
                          activeScreen === item.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
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

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Help & Logout */}
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left">
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-medium">Help</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log uit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* User button */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
