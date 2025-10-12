import { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Speler } from '../types';

interface Props {
  clubNaam: string;
  setClubNaam: (naam: string) => void;
  teamNaam: string;
  setTeamNaam: (naam: string) => void;
  spelers: Speler[];
  setSpelers: (spelers: Speler[]) => void;
}

export default function TeamBeheer({ 
  clubNaam, 
  setClubNaam, 
  teamNaam, 
  setTeamNaam, 
  spelers, 
  setSpelers 
}: Props) {
  const [nieuweSpeler, setNieuweSpeler] = useState('');

  const voegSpelerToe = () => {
    if (nieuweSpeler.trim()) {
      setSpelers([...spelers, { id: Date.now(), naam: nieuweSpeler.trim() }]);
      setNieuweSpeler('');
    }
  };

  const verwijderSpeler = (id: number) => {
    setSpelers(spelers.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="w-6 h-6" />Team Beheer
      </h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-lg">Club & Team Informatie</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Club Naam</label>
            <input 
              type="text" 
              value={clubNaam} 
              onChange={(e) => setClubNaam(e.target.value)} 
              placeholder="Bijv. FC Rotterdam" 
              className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Team Naam</label>
            <input 
              type="text" 
              value={teamNaam} 
              onChange={(e) => setTeamNaam(e.target.value)} 
              placeholder="Bijv. JO19-1" 
              className="w-full px-4 py-2 border-2 border-green-500 rounded-lg font-medium" 
            />
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-lg">Spelers</h3>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={nieuweSpeler} 
            onChange={(e) => setNieuweSpeler(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && voegSpelerToe()} 
            placeholder="Naam nieuwe speler" 
            className="flex-1 px-4 py-2 border rounded-lg" 
          />
          <button 
            onClick={voegSpelerToe} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />Toevoegen
          </button>
        </div>
        <div className="grid gap-2">
          {spelers.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="font-medium">{s.naam}</span>
              <button 
                onClick={() => verwijderSpeler(s.id)} 
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {spelers.length === 0 && <p className="text-gray-500 text-center py-8">Nog geen spelers toegevoegd</p>}
        {spelers.length > 0 && (
          <p className="text-sm text-gray-600 mt-4 text-center">
            Totaal {spelers.length} speler{spelers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}