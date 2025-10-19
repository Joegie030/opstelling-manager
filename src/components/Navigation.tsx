import { ReactNode, useState } from 'react';
import { Menu, X, User, Calendar, BarChart3, Users, Settings, Archive, HelpCircle, ChevronRight } from 'lucide-react';

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
  },
  {
    id: 'archieven',
    label: 'Archieven',
    icon: <Archive className="w-5 h-5" />
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
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuSelect = (id: string) => {
    onScreenChange(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* NAVBAR */}
      <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          
          {/* Left: Hamburgermenu + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors lg:hidden"
              title="Menu"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            
            <div className="flex flex-col">
              <h1 className="font-bold text-lg truncate">
                ⚽ Opstelling Manager
              </h1>
              <p className="text-xs text-blue-200 truncate">
                🏆 {clubNaam} • {teamNaam}
              </p>
            </div>
          </div>

          {/* Right: User menu */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors hidden sm:block"
              title="Profiel"
            >
              <User className="w-5 h-5" />
            </button>
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium text-sm transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex">
        
        {/* SIDEBAR */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed lg:static top-16 left-0 h-[calc(100vh-64px)] w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 z-30 overflow-y-auto
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
          >
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuSelect(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeScreen === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-1 bg-red-600 rounded-full text-xs font-bold">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      activeScreen === item.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-left">
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </button>
            </div>
          </aside>
        </>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
