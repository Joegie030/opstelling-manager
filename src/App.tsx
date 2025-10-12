
import React, { useState, useEffect } from 'react';
import { Users, Clock, Trophy, Plus, Trash2, Eye } from 'lucide-react';

const App = () => {
  const [spelers, setSpelers] = useState(() => {
    const opgeslagen = localStorage.getItem('voetbal_spelers');
    return opgeslagen ? JSON.parse(opgeslagen) : [];
  });
  
  const [wedstrijden, setWedstrijden] = useState(() => {
    const opgeslagen = localStorage.getItem('voetbal_wedstrijden');
    return opgeslagen ? JSON.parse(opgeslagen) : [];
  });
  
  const [clubNaam, setClubNaam] = useState(() => {
    return localStorage.getItem('voetbal_clubNaam') || 'Mijn Club';
  });
  
  const [teamNaam, setTeamNaam] = useState(() => {
    return localStorage.getItem('voetbal_teamNaam') || 'Team A';
  });
  
  const [nieuweSpeler, setNieuweSpeler] = useState('');
  const [huidigScherm, setHuidigScherm] = useState('team');
  const [huidgeWedstrijd, setHuidgeWedstrijd] = useState(null);

  useEffect(() => {
    localStorage.setItem('voetbal_spelers', JSON.stringify(spelers));
  }, [spelers]);

  useEffect(() => {
    localStorage.setItem('voetbal_wedstrijden', JSON.stringify(wedstrijden));
  }, [wedstrijden]);

  useEffect(() => {
    localStorage.setItem('voetbal_clubNaam', clubNaam);
  }, [clubNaam]);

  useEffect(() => {
    localStorage.setItem('voetbal_teamNaam', teamNaam);
  }, [teamNaam]);

  const formaties = {
    '6x6': ['Keeper', 'Achter', 'Links', 'Midden', 'Rechts', 'Voor'],
    '8x8': ['Keeper', 'Links achter', 'Rechts achter', 'Links midden', 'Midden', 'Rechts midden', 'Links voor', 'Rechts voor']
  };

  const voegSpelerToe = () => {
    if (nieuweSpeler.trim()) {
      setSpelers([...spelers, { 
        id: Date.now(), 
        naam: nieuweSpeler.trim()
      }]);
      setNieuweSpeler('');
    }
  };

  const verwijderSpeler = (id) => {
    setSpelers(spelers.filter(s => s.id !== id));
  };

  const maakWedstrijd = (formatie) => {
    const nieuweWedstrijd = {
      id: Date.now(),
      datum: new Date().toISOString().split('T')[0],
      tegenstander: '',
      formatie,
      kwarten: [
        { nummer: 1, opstelling: {}, wissels: [], minuten: 12.5 },
        { nummer: 2, opstelling: {}, wissels: [], minuten: 12.5 },
        { nummer: 3, opstelling: {}, wissels: [], minuten: 12.5 },
        { nummer: 4, opstelling: {}, wissels: [], minuten: 12.5 }
      ]
    };
    setWedstrijden([...wedstrijden, nieuweWedstrijd]);
    setHuidgeWedstrijd(nieuweWedstrijd);
    setHuidigScherm('wedstrijd');
  };

  const updateDatum = (nieuweDatum) => {
    const updated = { ...huidgeWedstrijd, datum: nieuweDatum };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateTegenstander = (nieuweTegenstander) => {
    const updated = { ...huidgeWedstrijd, tegenstander: nieuweTegenstander };
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateOpstelling = (kwartIndex, positie, spelerId) => {
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].opstelling[positie] = spelerId;
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const voegWisselToe = (kwartIndex) => {
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].wissels.push({ id: Date.now(), positie: '', wisselSpelerId: '' });
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const updateWissel = (kwartIndex, wisselIndex, veld, waarde) => {
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].wissels[wisselIndex][veld] = waarde;
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const verwijderWissel = (kwartIndex, wisselIndex) => {
    const updated = { ...huidgeWedstrijd };
    updated.kwarten[kwartIndex].wissels.splice(wisselIndex, 1);
    setHuidgeWedstrijd(updated);
    setWedstrijden(wedstrijden.map(w => w.id === updated.id ? updated : w));
  };

  const verwijderWedstrijd = (wedstrijdId) => {
    setWedstrijden(wedstrijden.filter(w => w.id !== wedstrijdId));
    if (huidgeWedstrijd?.id === wedstrijdId) {
      setHuidgeWedstrijd(null);
      setHuidigScherm('overzicht');
    }
  };

  const kopieerWedstrijd = (wedstrijd) => {
    const gekopieerd = {
      ...wedstrijd,
      id: Date.now(),
      datum: new Date().toISOString().split('T')[0],
      tegenstander: wedstrijd.tegenstander ? `${wedstrijd.tegenstander} (kopie)` : ''
    };
    setWedstrijden([...wedstrijden, gekopieerd]);
    setHuidgeWedstrijd(gekopieerd);
    setHuidigScherm('wedstrijd');
  };

  const berekenStatistieken = (wedstrijd) => {
    const stats = {};
    spelers.forEach(s => {
      stats[s.id] = { naam: s.naam, minuten: 0, keeperBeurten: 0, wisselMinuten: 0 };
    });

    wedstrijd.kwarten.forEach(kwart => {
      const spelersMetMinuten = {};
      
      Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
        if (sid && stats[sid]) {
          const wissel = kwart.wissels?.find(w => w.positie === pos);
          const min = wissel && wissel.wisselSpelerId ? 6.25 : kwart.minuten;
          stats[sid].minuten += min;
          spelersMetMinuten[sid] = (spelersMetMinuten[sid] || 0) + min;
          if (pos === 'Keeper') stats[sid].keeperBeurten += 1;
        }
      });
      
      kwart.wissels?.forEach(w => {
        if (w.wisselSpelerId && stats[w.wisselSpelerId]) {
          stats[w.wisselSpelerId].minuten += 6.25;
          spelersMetMinuten[w.wisselSpelerId] = (spelersMetMinuten[w.wisselSpelerId] || 0) + 6.25;
          if (w.positie === 'Keeper') stats[w.wisselSpelerId].keeperBeurten += 1;
        }
      });
      
      spelers.forEach(s => {
        const gespeeld = spelersMetMinuten[s.id.toString()] || 0;
        const wissel = kwart.minuten - gespeeld;
        if (wissel > 0) stats[s.id].wisselMinuten += wissel;
      });
    });
    
    return Object.values(stats);
  };

  const berekenAlgemeneStats = () => {
    const stats = {};
    spelers.forEach(s => {
      stats[s.id] = { naam: s.naam, totaalMinuten: 0, totaalKeeperBeurten: 0, totaalWisselMinuten: 0, wedstrijden: 0 };
    });

    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(kwart => {
        const spelersMetMinuten = {};
        
        Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
          if (sid && stats[sid]) {
            const wissel = kwart.wissels?.find(w => w.positie === pos);
            const min = wissel && wissel.wisselSpelerId ? 6.25 : kwart.minuten;
            stats[sid].totaalMinuten += min;
            spelersMetMinuten[sid] = (spelersMetMinuten[sid] || 0) + min;
            if (pos === 'Keeper') stats[sid].totaalKeeperBeurten += 1;
          }
        });
        
        kwart.wissels?.forEach(w => {
          if (w.wisselSpelerId && stats[w.wisselSpelerId]) {
            stats[w.wisselSpelerId].totaalMinuten += 6.25;
            spelersMetMinuten[w.wisselSpelerId] = (spelersMetMinuten[w.wisselSpelerId] || 0) + 6.25;
            if (w.positie === 'Keeper') stats[w.wisselSpelerId].totaalKeeperBeurten += 1;
          }
        });
        
        spelers.forEach(s => {
          if (stats[s.id]) {
            const gespeeld = spelersMetMinuten[s.id.toString()] || 0;
            const wissel = kwart.minuten - gespeeld;
            if (wissel > 0) stats[s.id].totaalWisselMinuten += wissel;
          }
        });
      });
    });

    wedstrijden.forEach(wed => {
      const spelersInWed = new Set();
      wed.kwarten.forEach(k => {
        Object.values(k.opstelling).forEach(sid => { if (sid) spelersInWed.add(sid); });
      });
      spelersInWed.forEach(sid => { if (stats[sid]) stats[sid].wedstrijden += 1; });
    });
    
    return Object.values(stats);
  };

  const berekenPositieStats = () => {
    const stats = {};
    const allePosities = new Set();
    
    spelers.forEach(s => { stats[s.id] = { naam: s.naam, posities: {} }; });
    wedstrijden.forEach(w => { formaties[w.formatie].forEach(p => allePosities.add(p)); });
    
    wedstrijden.forEach(wed => {
      wed.kwarten.forEach(k => {
        Object.entries(k.opstelling).forEach(([pos, sid]) => {
          if (sid && stats[sid]) {
            if (!stats[sid].posities[pos]) stats[sid].posities[pos] = 0;
            stats[sid].posities[pos] += 1;
          }
        });
        k.wissels?.forEach(w => {
          if (w.wisselSpelerId && stats[w.wisselSpelerId]) {
            if (!stats[w.wisselSpelerId].posities[w.positie]) stats[w.wisselSpelerId].posities[w.positie] = 0;
            stats[w.wisselSpelerId].posities[w.positie] += 1;
          }
        });
      });
    });
    
    return { stats: Object.values(stats), posities: Array.from(allePosities).sort() };
  };

  const renderTeamBeheer = () => (
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
          <div className="bg-white rounded p-3 text-center">
            <p className="text-sm text-gray-600 mb-1">Preview:</p>
            <p className="text-xl font-bold text-blue-600">⚽ {clubNaam} - {teamNaam}</p>
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
        <div className="mt-4 pt-4 border-t border-green-300">
          <p className="text-xs text-gray-500 text-center">💾 Data wordt automatisch opgeslagen</p>
        </div>
      </div>
    </div>
  );

  const renderWedstrijdKeuze = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="w-6 h-6" />Nieuwe Wedstrijd
      </h2>
      {spelers.length < 6 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Je hebt minimaal 6 spelers nodig.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <button 
            onClick={() => maakWedstrijd('6x6')} 
            className="p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-left"
          >
            <h3 className="text-xl font-bold mb-2">6 tegen 6</h3>
            <p className="text-sm opacity-90">Keeper, Achter, Links, Midden, Rechts, Voor</p>
            <p className="text-xs opacity-75 mt-2">💡 Je kunt wisselen na 6,25 min</p>
          </button>
          {spelers.length >= 8 && (
            <button 
              onClick={() => maakWedstrijd('8x8')} 
              className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 text-left"
            >
              <h3 className="text-xl font-bold mb-2">8 tegen 8</h3>
              <p className="text-sm opacity-90">Keeper, 2 Achter, 3 Midden, 2 Voor</p>
              <p className="text-xs opacity-75 mt-2">💡 Je kunt wisselen na 6,25 min</p>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderWedstrijdOpstelling = () => {
    if (!huidgeWedstrijd) return null;
    
    const posities = formaties[huidgeWedstrijd.formatie];
    const statsVoorWedstrijd = berekenStatistieken(huidgeWedstrijd);
    
    const getPositieLayout = () => {
      if (huidgeWedstrijd.formatie === '6x6') {
        return {
          rijen: [
            [{ positie: 'Voor', col: 'col-start-2' }],
            [{ positie: 'Links' }, { positie: 'Midden' }, { positie: 'Rechts' }],
            [{ positie: 'Achter', col: 'col-start-2' }],
            [{ positie: 'Keeper', col: 'col-start-2' }]
          ],
          gridCols: 'grid-cols-3'
        };
      }
      return {
        rijen: [
          [{ positie: 'Links voor', col: 'col-start-2' }, { positie: 'Rechts voor', col: 'col-start-4' }],
          [{ positie: 'Links midden', col: 'col-start-1' }, { positie: 'Midden', col: 'col-start-3' }, { positie: 'Rechts midden', col: 'col-start-5' }],
          [{ positie: 'Links achter', col: 'col-start-2' }, { positie: 'Rechts achter', col: 'col-start-4' }],
          [{ positie: 'Keeper', col: 'col-start-3' }]
        ],
        gridCols: 'grid-cols-5'
      };
    };
    
    const layout = getPositieLayout();
    
    const getGebruikteSpelers = (kwartIndex) => {
      const gebruikt = new Set();
      Object.values(huidgeWedstrijd.kwarten[kwartIndex].opstelling).forEach(sid => {
        if (sid) gebruikt.add(sid);
      });
      return gebruikt;
    };
    
    const getKeeperSpelers = () => {
      const keepers = new Set();
      huidgeWedstrijd.kwarten.forEach(kwart => {
        const keeperId = kwart.opstelling['Keeper'];
        if (keeperId) keepers.add(keeperId);
      });
      return keepers;
    };
    
    const getWisselBeurten = () => {
      const teller = {};
      spelers.forEach(s => { teller[s.id] = 0; });
      huidgeWedstrijd.kwarten.forEach(kwart => {
        const spelersInKwart = new Set();
        Object.values(kwart.opstelling).forEach(sid => { if (sid) spelersInKwart.add(sid); });
        spelers.forEach(s => {
          if (!spelersInKwart.has(s.id.toString())) teller[s.id] += 1;
        });
      });
      return teller;
    };
    
    const checkKeeperWisselRegel = () => {
      const waarschuwingen = [];
      huidgeWedstrijd.kwarten.forEach((kwart, ki) => {
        const keeperId = kwart.opstelling['Keeper'];
        if (!keeperId) return;
        const keeperNaam = spelers.find(s => s.id.toString() === keeperId)?.naam;
        if (!keeperNaam) return;
        const vorigKwart = ki > 0 ? huidgeWedstrijd.kwarten[ki - 1] : null;
        const volgendKwart = ki < 3 ? huidgeWedstrijd.kwarten[ki + 1] : null;
        const speeltInVorig = vorigKwart && Object.values(vorigKwart.opstelling).includes(keeperId);
        const speeltInVolgend = volgendKwart && Object.values(volgendKwart.opstelling).includes(keeperId);
        if (!speeltInVorig && !speeltInVolgend) {
          waarschuwingen.push({
            message: `${keeperNaam} is keeper in kwart ${ki + 1} maar staat op de bank in ${vorigKwart ? 'kwart ' + ki : ''} ${!speeltInVorig && !speeltInVolgend && vorigKwart && volgendKwart ? 'én' : ''} ${volgendKwart ? 'kwart ' + (ki + 2) : ''}`
          });
        }
      });
      return waarschuwingen;
    };
    
    const checkDubbelWisselRegel = () => {
      const waarschuwingen = [];
      spelers.forEach(speler => {
        for (let ki = 0; ki < huidgeWedstrijd.kwarten.length - 1; ki++) {
          const k1 = huidgeWedstrijd.kwarten[ki];
          const k2 = huidgeWedstrijd.kwarten[ki + 1];
          const speelt1 = Object.values(k1.opstelling).includes(speler.id.toString()) || k1.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
          const speelt2 = Object.values(k2.opstelling).includes(speler.id.toString()) || k2.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
          if (!speelt1 && !speelt2) {
            waarschuwingen.push({
              message: `${speler.naam} staat 2 kwarten achter elkaar op de bank (kwart ${ki + 1} en ${ki + 2})`
            });
          }
        }
      });
      return waarschuwingen;
    };
    
    const checkInvallerBankRegel = () => {
      const waarschuwingen = [];
      spelers.forEach(speler => {
        for (let ki = 0; ki < huidgeWedstrijd.kwarten.length - 1; ki++) {
          const k1 = huidgeWedstrijd.kwarten[ki];
          const k2 = huidgeWedstrijd.kwarten[ki + 1];
          const basisK1 = Object.values(k1.opstelling).includes(speler.id.toString());
          const valtInK1 = k1.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
          const speeltK2 = Object.values(k2.opstelling).includes(speler.id.toString()) || k2.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
          if (valtInK1 && !basisK1 && !speeltK2) {
            waarschuwingen.push({
              message: `${speler.naam} valt in tijdens kwart ${ki + 1} maar zit op de bank in kwart ${ki + 2}`
            });
          }
          const speeltK1 = Object.values(k1.opstelling).includes(speler.id.toString()) || k1.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
          const basisK2 = Object.values(k2.opstelling).includes(speler.id.toString());
          const valtInK2 = k2.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
          if (!speeltK1 && valtInK2 && !basisK2) {
            waarschuwingen.push({
              message: `${speler.naam} zit op de bank in kwart ${ki + 1} en valt pas in tijdens kwart ${ki + 2}`
            });
          }
        }
      });
      return waarschuwingen;
    };
    
    const alleRegelchecks = () => {
      return [...checkKeeperWisselRegel(), ...checkDubbelWisselRegel(), ...checkInvallerBankRegel()];
    };
    
    const getKeeperPerKwart = () => {
      const keeperInfo = {};
      huidgeWedstrijd.kwarten.forEach((kwart, index) => {
        const keeperId = kwart.opstelling['Keeper'];
        if (keeperId) keeperInfo[keeperId] = index;
      });
      return keeperInfo;
    };
    
    const isKeeperDieNietSpeeltEromheen = (spelerId, huidigeKwartIndex) => {
      const keeperInfo = getKeeperPerKwart();
      const keeperKwartIndex = keeperInfo[spelerId];
      if (keeperKwartIndex === undefined) return false;
      if (Math.abs(keeperKwartIndex - huidigeKwartIndex) === 1) {
        const kwart = huidgeWedstrijd.kwarten[huidigeKwartIndex];
        const speelt = Object.values(kwart.opstelling).includes(spelerId.toString());
        return !speelt;
      }
      return false;
    };
    
    const getBeschikbareSpelers = (kwartIndex, huidigePositie) => {
      const gebruikt = getGebruikteSpelers(kwartIndex);
      const huidigeSid = huidgeWedstrijd.kwarten[kwartIndex].opstelling[huidigePositie];
      const keepers = getKeeperSpelers();
      const wisselBeurten = getWisselBeurten();
      return spelers.filter(s => !gebruikt.has(s.id.toString()) || s.id.toString() === huidigeSid).map(s => ({
        ...s,
        isKeeper: keepers.has(s.id.toString()),
        aantalWissel: wisselBeurten[s.id] || 0,
        keeperWaarschuwing: isKeeperDieNietSpeeltEromheen(s.id.toString(), kwartIndex)
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-2xl font-bold">{clubNaam} {teamNaam} - {huidgeWedstrijd.formatie}</h2>
              <input 
                type="date" 
                value={huidgeWedstrijd.datum} 
                onChange={(e) => updateDatum(e.target.value)} 
                className="px-3 py-2 border-2 border-blue-500 rounded-lg font-medium" 
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Tegenstander:</label>
              <input 
                type="text" 
                value={huidgeWedstrijd.tegenstander || ''} 
                onChange={(e) => updateTegenstander(e.target.value)} 
                placeholder="Optioneel" 
                className="px-3 py-2 border rounded-lg" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => kopieerWedstrijd(huidgeWedstrijd)} 
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />Kopieer
            </button>
            <button 
              onClick={() => { setHuidgeWedstrijd(null); setHuidigScherm('overzicht'); }} 
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Opslaan & Sluiten
            </button>
          </div>
        </div>

        {huidgeWedstrijd.kwarten.map((kwart, kwartIndex) => (
          <div key={kwartIndex} className="border rounded-lg p-4 bg-white">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />Kwart {kwart.nummer} ({kwart.minuten} min)
            </h3>
            
            <div className="bg-green-100 rounded-lg p-6 mb-4">
              {layout.rijen.map((rij, rijIndex) => (
                <div key={rijIndex} className={`grid ${layout.gridCols} gap-4 mb-4`}>
                  {rij.map(({ positie, col }) => {
                    const beschikbareSpelers = getBeschikbareSpelers(kwartIndex, positie);
                    const heeftWissel = kwart.wissels?.some(w => w.positie === positie);
                    return (
                      <div key={positie} className={`space-y-1 ${col || ''}`}>
                        <label className="text-xs font-bold text-gray-700 block text-center">
                          {positie}
                          {heeftWissel && <span className="text-orange-600"> 🔄</span>}
                        </label>
                        <select 
                          value={kwart.opstelling[positie] || ''} 
                          onChange={(e) => updateOpstelling(kwartIndex, positie, e.target.value)} 
                          className="w-full px-2 py-2 border-2 border-green-600 rounded-lg bg-white text-sm font-medium"
                        >
                          <option value="">- Kies -</option>
                          {beschikbareSpelers.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.naam}
                              {s.isKeeper ? ' 🧤' : ''}
                              {s.aantalWissel > 0 ? ` 🪑${s.aantalWissel}` : ''}
                              {s.keeperWaarschuwing ? ' ⚠️' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm">Wissels na 6,25 min</h4>
                <button 
                  onClick={() => voegWisselToe(kwartIndex)} 
                  className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-3 h-3" />Wissel toevoegen
                </button>
              </div>
              {kwart.wissels && kwart.wissels.length > 0 ? (
                <div className="space-y-3">
                  {kwart.wissels.map((wissel, wisselIndex) => {
                    const startSpelerId = kwart.opstelling[wissel.positie];
                    const startSpelerNaam = spelers.find(s => s.id.toString() === startSpelerId)?.naam;
                    const beschikbareWisselSpelers = spelers.filter(s => 
                      s.id.toString() !== startSpelerId && 
                      !Object.values(kwart.opstelling).includes(s.id.toString()) &&
                      !kwart.wissels.some((w, i) => i !== wisselIndex && w.wisselSpelerId === s.id.toString())
                    );
                    return (
                      <div key={wissel.id} className="bg-white rounded p-3 flex gap-2 items-center">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Positie</label>
                            <select 
                              value={wissel.positie} 
                              onChange={(e) => updateWissel(kwartIndex, wisselIndex, 'positie', e.target.value)} 
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              <option value="">Kies positie</option>
                              {posities.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                            {startSpelerNaam && <p className="text-xs text-gray-500 mt-1">Uit: {startSpelerNaam}</p>}
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Wisselspeler</label>
                            <select 
                              value={wissel.wisselSpelerId} 
                              onChange={(e) => updateWissel(kwartIndex, wisselIndex, 'wisselSpelerId', e.target.value)} 
                              className="w-full px-2 py-1 border rounded text-sm" 
                              disabled={!wissel.positie}
                            >
                              <option value="">Kies speler</option>
                              {beschikbareWisselSpelers.map(s => (
                                <option key={s.id} value={s.id}>{s.naam}</option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">In: na 6,25 min</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => verwijderWissel(kwartIndex, wisselIndex)} 
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">Geen wissels</p>
              )}
            </div>
          </div>
        ))}

        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-bold mb-3">Wedstrijd Statistieken</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Speler</th>
                  <th className="text-right py-2">Gespeeld</th>
                  <th className="text-right py-2">Wissel</th>
                  <th className="text-right py-2">Keeper</th>
                </tr>
              </thead>
              <tbody>
                {statsVoorWedstrijd.map(stat => (
                  <tr key={stat.naam} className="border-b">
                    <td className="py-2">{stat.naam}</td>
                    <td className="text-right py-2">{stat.minuten} min</td>
                    <td className="text-right py-2">{stat.wisselMinuten} min</td>
                    <td className="text-right py-2">{stat.keeperBeurten}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-yellow-50">
          <h3 className="font-bold mb-3 flex items-center gap-2">📋 Regelcheck</h3>
          {(() => {
            const waarschuwingen = alleRegelchecks();
            if (waarschuwingen.length === 0) {
              return (
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-xl">✅</span>
                  <span>Alle regels zijn in orde!</span>
                </div>
              );
            }
            return (
              <div className="space-y-2">
                {waarschuwingen.map((w, index) => (
                  <div key={index} className="flex items-start gap-2 text-orange-700 bg-orange-100 p-3 rounded">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm">{w.message}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  const renderStatistieken = () => {
    const { stats, posities } = berekenPositieStats();
    return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Statistieken</h2>
        {wedstrijden.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
        ) : (
          <>
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="text-xl font-semibold mb-3">Totaal Overzicht Alle Spelers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Speler</th>
                      <th className="text-right py-2">Wedstrijden</th>
                      <th className="text-right py-2">Gespeeld</th>
                      <th className="text-right py-2">Wissel</th>
                      <th className="text-right py-2">Keeper</th>
                    </tr>
                  </thead>
                  <tbody>
                    {berekenAlgemeneStats().sort((a, b) => b.totaalMinuten - a.totaalMinuten).map(stat => (
                      <tr key={stat.naam} className="border-b">
                        <td className="py-2 font-medium">{stat.naam}</td>
                        <td className="text-right py-2">{stat.wedstrijden}</td>
                        <td className="text-right py-2">{stat.totaalMinuten} min</td>
                        <td className="text-right py-2">{stat.totaalWisselMinuten} min</td>
                        <td className="text-right py-2">{stat.totaalKeeperBeurten}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-xl font-semibold mb-3">Positie Statistieken</h3>
              <p className="text-sm text-gray-600 mb-3">Hoe vaak heeft elke speler op elke positie gespeeld?</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 sticky left-0 bg-blue-50">Speler</th>
                      {(() => {
                        const allePosities = new Set<string>();
                        wedstrijden.forEach(w => {
                          formaties[w.formatie].forEach(p => allePosities.add(p));
                        });
                        return Array.from(allePosities).sort().map(p => (
                          <th key={p} className="text-center py-2 px-2 text-sm">{p}</th>
                        ));
                      })()}
                      <th className="text-right py-2 px-2">Totaal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const positieStats: Record<number, { naam: string; posities: Record<string, number> }> = {};
                      const allePosities = new Set<string>();
                      
                      spelers.forEach(s => {
                        positieStats[s.id] = { naam: s.naam, posities: {} };
                      });
                      
                      wedstrijden.forEach(w => {
                        formaties[w.formatie].forEach(p => allePosities.add(p));
                      });
                      
                      wedstrijden.forEach(wed => {
                        wed.kwarten.forEach(k => {
                          Object.entries(k.opstelling).forEach(([pos, sid]) => {
                            if (sid && positieStats[Number(sid)]) {
                              if (!positieStats[Number(sid)].posities[pos]) {
                                positieStats[Number(sid)].posities[pos] = 0;
                              }
                              positieStats[Number(sid)].posities[pos] += 1;
                            }
                          });
                          k.wissels?.forEach(w => {
                            if (w.wisselSpelerId && positieStats[Number(w.wisselSpelerId)]) {
                              if (!positieStats[Number(w.wisselSpelerId)].posities[w.positie]) {
                                positieStats[Number(w.wisselSpelerId)].posities[w.positie] = 0;
                              }
                              positieStats[Number(w.wisselSpelerId)].posities[w.positie] += 1;
                            }
                          });
                        });
                      });
                      
                      const positiesArray = Array.from(allePosities).sort();
                      
                      return Object.values(positieStats)
                        .sort((a, b) => a.naam.localeCompare(b.naam))
                        .map(spelerStat => {
                          const totaal = Object.values(spelerStat.posities).reduce((sum, val) => sum + val, 0);
                          return (
                            <tr key={spelerStat.naam} className="border-b hover:bg-blue-100">
                              <td className="py-2 px-2 font-medium sticky left-0 bg-blue-50">{spelerStat.naam}</td>
                              {positiesArray.map(positie => (
                                <td key={positie} className="text-center py-2 px-2">
                                  {spelerStat.posities[positie] || '-'}
                                </td>
                              ))}
                              <td className="text-right py-2 px-2 font-semibold">{totaal}x</td>
                            </tr>
                          );
                        });
                    })()}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                💡 Tip: Dit telt hoe vaak een speler op een positie heeft gespeeld over alle wedstrijden. 
                Als een speler invalt op een positie, telt dat ook mee.
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderOverzicht = () => {
    const algemeneStats = berekenAlgemeneStats();
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Overzicht Alle Wedstrijden</h2>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Gespeelde Wedstrijden ({wedstrijden.length})</h3>
          {wedstrijden.sort((a, b) => new Date(b.datum) - new Date(a.datum)).map(wedstrijd => {
            const stats = berekenStatistieken(wedstrijd);
            const datumFormatted = new Date(wedstrijd.datum).toLocaleDateString('nl-NL', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            return (
              <div key={wedstrijd.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold">
                      {wedstrijd.formatie} - {datumFormatted}
                      {wedstrijd.tegenstander && <span className="text-blue-600"> vs {wedstrijd.tegenstander}</span>}
                    </h4>
                    <p className="text-sm text-gray-600">{stats.length} spelers</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setHuidgeWedstrijd(wedstrijd); setHuidigScherm('wedstrijd'); }} 
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />Bekijk
                    </button>
                    <button 
                      onClick={() => kopieerWedstrijd(wedstrijd)} 
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1" 
                      title="Kopieer deze wedstrijd"
                    >
                      <Plus className="w-4 h-4" />Kopieer
                    </button>
                    <button 
                      onClick={() => verwijderWedstrijd(wedstrijd.id)} 
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {wedstrijden.length > 0 && (
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="text-xl font-semibold mb-3">Totaal Overzicht Alle Spelers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Speler</th>
                    <th className="text-right py-2">Wedstrijden</th>
                    <th className="text-right py-2">Gespeeld</th>
                    <th className="text-right py-2">Wissel</th>
                    <th className="text-right py-2">Keeper</th>
                  </tr>
                </thead>
                <tbody>
                  {algemeneStats.sort((a, b) => b.totaalMinuten - a.totaalMinuten).map(stat => (
                    <tr key={stat.naam} className="border-b">
                      <td className="py-2 font-medium">{stat.naam}</td>
                      <td className="text-right py-2">{stat.wedstrijden}</td>
                      <td className="text-right py-2">{stat.totaalMinuten} min</td>
                      <td className="text-right py-2">{stat.totaalWisselMinuten} min</td>
                      <td className="text-right py-2">{stat.totaalKeeperBeurten}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {wedstrijden.length === 0 && (
          <p className="text-gray-500 text-center py-8">Nog geen wedstrijden gespeeld</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">
            ⚽ {clubNaam} - {teamNaam}
          </h1>
          <p className="text-center text-gray-600 mb-6">Opstelling Manager</p>

          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            <button 
              onClick={() => setHuidigScherm('team')} 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                huidigScherm === 'team' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              👥 Team
            </button>
            <button 
              onClick={() => setHuidigScherm('nieuwe-wedstrijd')} 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                huidigScherm === 'nieuwe-wedstrijd' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              ➕ Nieuwe Wedstrijd
            </button>
            <button 
              onClick={() => setHuidigScherm('overzicht')} 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                huidigScherm === 'overzicht' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              📊 Overzicht
            </button>
            <button 
              onClick={() => setHuidigScherm('statistieken')} 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                huidigScherm === 'statistieken' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              📈 Statistieken
            </button>
          </div>

          <div>
            {huidigScherm === 'team' && renderTeamBeheer()}
            {huidigScherm === 'nieuwe-wedstrijd' && renderWedstrijdKeuze()}
            {huidigScherm === 'wedstrijd' && renderWedstrijdOpstelling()}
            {huidigScherm === 'overzicht' && renderOverzicht()}
            {huidigScherm === 'statistieken' && renderStatistieken()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
