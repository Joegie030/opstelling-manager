import { createContext, useContext, ReactNode } from 'react';
import { Speler, Wedstrijd } from '../types';

// ✅ GECORRIGEERDE Context Type - Enkel wat WedstrijdOpstelling doorgegeven kan
interface WedstrijdContextType {
  wedstrijd: Wedstrijd;
  spelers: Speler[];
  clubNaam: string;
  teamNaam: string;
}

const WedstrijdContext = createContext<WedstrijdContextType | undefined>(undefined);

interface WedstrijdProviderProps {
  children: ReactNode;
  wedstrijd: Wedstrijd;
  spelers: Speler[];
  clubNaam: string;
  teamNaam: string;
}

// ✅ GECORRIGEERDE Provider - Direct props destructuring
export function WedstrijdProvider({ 
  children, 
  wedstrijd, 
  spelers, 
  clubNaam, 
  teamNaam 
}: WedstrijdProviderProps) {
  const value: WedstrijdContextType = {
    wedstrijd,
    spelers,
    clubNaam,
    teamNaam,
  };

  return (
    <WedstrijdContext.Provider value={value}>
      {children}
    </WedstrijdContext.Provider>
  );
}

export function useWedstrijd() {
  const context = useContext(WedstrijdContext);
  if (context === undefined) {
    throw new Error('useWedstrijd moet gebruikt worden binnen WedstrijdProvider');
  }
  return context;
}
