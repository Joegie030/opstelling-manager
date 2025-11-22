import { createContext, useContext, ReactNode } from 'react';
import { Speler, Wedstrijd, Doelpunt } from '../types';

interface WedstrijdContextType {
  wedstrijd: Wedstrijd;
  wedstrijden: Wedstrijd[];
  spelers: Speler[];
  clubNaam: string;
  teamNaam: string;
  
  onUpdateDatum: (datum: string) => void;
  onUpdateTegenstander: (tegenstander: string) => void;
  onUpdateThuisUit: (thuisUit: 'thuis' | 'uit') => void;
  onToggleAfwezig: (spelerId: number) => void;
  onUpdateOpstelling: (kwartIndex: number, positie: string, spelerId: string) => void;
  onUpdateKwartFormatie: (kwartIndex: number, variant: string, strategie: 'smartmap' | 'reset') => void;  // 🆕
  onVoegWisselToe: (kwartIndex: number) => void;
  onUpdateWissel: (kwartIndex: number, wisselIndex: number, veld: 'positie' | 'wisselSpelerId', waarde: string) => void;
  onVerwijderWissel: (kwartIndex: number, wisselIndex: number) => void;
  onVoegDoelpuntToe: (kwartIndex: number, doelpunt: Omit<Doelpunt, 'id'>) => void;
  onVerwijderDoelpunt: (kwartIndex: number, doelpuntId: number) => void;
  onUpdateWedstrijdNotities: (notities: string) => void;
  onUpdateWedstrijdThemas: (themas: string[]) => void;
  onUpdateKwartAantekeningen: (kwartIndex: number, aantekeningen: string) => void;
  onUpdateKwartThemaBeoordeling: (kwartIndex: number, themaId: string, beoordeling: 'goed' | 'beter' | null) => void;
  onUpdateKwartObservaties: (kwartIndex: number, observaties: string[]) => void;
  onSluiten: () => void;
}

const WedstrijdContext = createContext<WedstrijdContextType | undefined>(undefined);

interface WedstrijdProviderProps {
  children: ReactNode;
  value: WedstrijdContextType;
}

export function WedstrijdProvider({ children, value }: WedstrijdProviderProps) {
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
