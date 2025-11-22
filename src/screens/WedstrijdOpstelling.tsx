import { useState } from 'react';
import { Clock, Plus, Trash2, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Speler, Wedstrijd, Doelpunt, formaties, ALLE_THEMAS, KWART_OBSERVATIES } from '../types';
import ScoreTracking from '../components/ScoreTracking';
import { WedstrijdProvider } from '../components/WedstrijdContext';
import { WedstrijdHeader } from '../components/WedstrijdHeader';
import { WedstrijdSamenvatting } from '../components/WedstrijdSamenvatting';
import VoetbalVeld from '../components/VoetbalVeld';
import { berekenWedstrijdStats, berekenTotaalKeeperBeurten } from '../utils/calculations';
import { FormatieWisselModal } from '../components/FormatieWisselModal';  // 🆕
import { bepaalNieuweOpstelling } from '../utils/formatieMapping';  // 🆕

interface Props {
  wedstrijd: Wedstrijd;
  wedstrijden: Wedstrijd[];
  spelers: Speler[];
  clubNaam: string;
  teamNaam: string;
  onUpdateDatum: (datum: string) => void;
  onUpdateTegenstander: (tegenstander: string) => void;
  onUpdateThuisUit: (thuisUit: 'thuis' | 'uit') => void;
  onUpdateWedstrijdType: (type: 'competitie' | 'oefenwedstrijd' | '') => void;
  onToggleAfwezig: (spelerId: number) => void;
  onUpdateOpstelling: (kwartIndex: number, positie: string, spelerId: string) => void;
  onUpdateKwartOpstelling: (kwartIndex: number, opstelling: Record<string, string>) => void;
  onVoegWisselToe: (kwartIndex: number) => void;
  onUpdateWissel: (kwartIndex: number, wisselIndex: number, veld: 'positie' | 'wisselSpelerId', waarde: string) => void;
  onVerwijderWissel: (kwartIndex: number, wisselIndex: number) => void;
  onVoegDoelpuntToe: (kwartIndex: number, doelpunt: Omit<Doelpunt, 'id'>) => void;
  onVerwijderDoelpunt: (kwartIndex: number, doelpuntId: number) => void;
  onUpdateWedstrijdNotities: (notities: string) => void;
  onUpdateWedstrijdThemas: (themas: string[]) => void;
  onUpdateKwartThemaBeoordeling: (kwartIndex: number, themaId: string, beoordeling: 'goed' | 'beter' | null) => void;
  onUpdateKwartObservaties: (kwartIndex: number, observaties: string[]) => void;
  onUpdateKwartFormatie: (kwartIndex: number, variant: string, strategie: 'smartmap' | 'reset') => void;  // 🆕
  onSluiten: () => void;
}

export default function WedstrijdOpstelling({
  wedstrijd,
  wedstrijden,
  spelers,
  clubNaam,
  teamNaam,
  onUpdateDatum,
  onUpdateTegenstander,
  onUpdateThuisUit,
  onUpdateWedstrijdType,
  onToggleAfwezig,
  onUpdateOpstelling,
  onUpdateKwartOpstelling,
  onVoegWisselToe,
  onUpdateWissel,
  onVerwijderWissel,
  onVoegDoelpuntToe,
  onVerwijderDoelpunt,
  onUpdateWedstrijdNotities,
  onUpdateWedstrijdThemas,
  onUpdateKwartThemaBeoordeling,
  onUpdateKwartObservaties,
  onUpdateKwartFormatie,  // 🆕
  onSluiten
}: Props) {
  
  const [selectieModal, setSelectieModal] = useState<{ open: boolean; kwartIndex: number; positie: string }>({ open: false, kwartIndex: 0, positie: '' });
  
  // 🆕 State voor formatie wissel modal
  const [formatieModal, setFormatieModal] = useState<{
    open: boolean;
    kwartIndex: number;
    vanFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen';
    naarFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen';
  }>({
    open: false,
    kwartIndex: 0,
    vanFormatie: '6x6-vliegtuig',
    naarFormatie: '6x6-dobbelsteen'
  });
  
  // 🛡️ DEFENSIVE: Log callbacks at mount
  console.log('🟦 WedstrijdOpstelling mounted with props:', {
    wedstrijdId: wedstrijd?.id,
    kwartenLength: wedstrijd?.kwarten?.length,
    onVoegDoelpuntToeType: typeof onVoegDoelpuntToe,
    onVerwijderDoelpuntType: typeof onVerwijderDoelpunt,
    callbacksAreValid: {
      voegDoelpuntToe: typeof onVoegDoelpuntToe === 'function',
      verwijderDoelpunt: typeof onVerwijderDoelpunt === 'function'
    }
  });
  
  const posities = formaties[wedstrijd.formatie === '6x6' ? '6x6-vliegtuig' : wedstrijd.formatie as '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8'];

  // 🆕 Helper functions voor formatie wissel
  /**
   * Bepaal effectieve formatie voor een kwart
   */
  const getEffectiveFormatie = (kwartIndex: number): '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8' => {
    const kwart = wedstrijd.kwarten[kwartIndex];
    if (kwart.variantFormatie) {
      return kwart.variantFormatie;
    }
    return wedstrijd.formatie as '6x6-vliegtuig' | '6x6-dobbelsteen' | '8x8';
  };

  /**
   * Open formatie wissel modal
   */
  const openFormatieModal = (kwartIndex: number) => {
    const huidigeFormatie = getEffectiveFormatie(kwartIndex);
    
    if (huidigeFormatie === '8x8') {
      alert('8x8 formatie kan niet gewisseld worden');
      return;
    }
    
    const naarFormatie = huidigeFormatie === '6x6-vliegtuig' 
      ? '6x6-dobbelsteen'
      : '6x6-vliegtuig';

    setFormatieModal({
      open: true,
      kwartIndex,
      vanFormatie: huidigeFormatie as '6x6-vliegtuig' | '6x6-dobbelsteen',
      naarFormatie
    });
  };

  /**
   * Handle formatie wissel bevestiging
   */
  const handleFormatieWisselBevestigen = (strategie: 'smartmap' | 'reset') => {
    const { kwartIndex, vanFormatie, naarFormatie } = formatieModal;
    const huidigOpstelling = wedstrijd.kwarten[kwartIndex].opstelling;

    // Bepaal nieuwe opstelling op basis van strategie
    const nieuweOpstelling = bepaalNieuweOpstelling(
      vanFormatie,
      naarFormatie,
      huidigOpstelling,
      strategie
    );

    // Call parent handler
    onUpdateKwartFormatie(kwartIndex, naarFormatie, strategie);

    // Update opstelling
    onUpdateKwartOpstelling(kwartIndex, nieuweOpstelling);

    // Sluit modal
    setFormatieModal({ ...formatieModal, open: false });
  };

  const getPositieLayout = () => {
    const formatie = wedstrijd.formatie === '6x6' ? '6x6-vliegtuig' : wedstrijd.formatie;
    
    if (formatie === '6x6-vliegtuig') {
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
    if (formatie === '6x6-dobbelsteen') {
      return {
        rijen: [
          [{ positie: 'Links voor', col: 'col-start-1' }, { positie: 'Rechts voor', col: 'col-start-3' }],
          [{ positie: 'Midden', col: 'col-start-2' }],
          [{ positie: 'Links achter', col: 'col-start-1' }, { positie: 'Rechts achter', col: 'col-start-3' }],
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

  const getGebruikteSpelers = (kwartIndex: number) => {
    const gebruikt = new Set<string>();
    Object.values(wedstrijd.kwarten[kwartIndex].opstelling).forEach(sid => {
      if (sid) gebruikt.add(sid);
    });
    return gebruikt;
  };

  const getKeeperSpelers = () => {
    const keepers = new Set<string>();
    wedstrijd.kwarten.forEach(kwart => {
      const keeperId = kwart.opstelling['Keeper'];
      if (keeperId) keepers.add(keeperId);
    });
    return keepers;
  };

  const getKeeperBeurtenInWedstrijd = () => {
    const keeperTeller: Record<number, number> = {};
    spelers.forEach(s => { keeperTeller[s.id] = 0; });
    
    wedstrijd.kwarten.forEach(kwart => {
      const keeperId = kwart.opstelling['Keeper'];
      if (keeperId) {
        keeperTeller[Number(keeperId)] += 1;
      }
      kwart.wissels?.forEach(w => {
        if (w.positie === 'Keeper' && w.wisselSpelerId) {
          keeperTeller[Number(w.wisselSpelerId)] += 1;
        }
      });
    });
    
    return keeperTeller;
  };

  const getWisselBeurten = () => {
    const teller: Record<number, number> = {};
    spelers.forEach(s => { teller[s.id] = 0; });
    wedstrijd.kwarten.forEach(kwart => {
      const spelersInKwart = new Set<string>();
      Object.values(kwart.opstelling).forEach(sid => { if (sid) spelersInKwart.add(sid); });
      spelers.forEach(s => {
        if (!spelersInKwart.has(s.id.toString())) teller[s.id] += 1;
      });
    });
    return teller;
  };

  const getBeschikbareSpelers = (kwartIndex: number, huidigePositie: string) => {
    console.log('🔵 getBeschikbareSpelers called:', { kwartIndex, huidigePositie });
    
    // 🛡️ DEFENSIVE: Check wedstrijden parameter
    if (!Array.isArray(wedstrijden)) {
      console.warn('⚠️ getBeschikbareSpelers: wedstrijden is not an array', { wedstrijden });
      wedstrijden = []; // Fallback to empty array
    }
    
    // 🛡️ DEFENSIVE: Check spelers parameter
    if (!Array.isArray(spelers)) {
      console.warn('⚠️ getBeschikbareSpelers: spelers is not an array', { spelers });
      return []; // Geen spelers beschikbaar
    }
    
    console.log('📊 wedstrijd data:', { 
      formatie: wedstrijd.formatie, 
      kwartenLength: wedstrijd.kwarten?.length,
      kwartenExists: !!wedstrijd.kwarten,
      kwartenIsArray: Array.isArray(wedstrijd.kwarten)
    });

    const gebruikt = getGebruikteSpelers(kwartIndex);
    const huidigeSid = wedstrijd.kwarten[kwartIndex].opstelling[huidigePositie];
    const keepers = getKeeperSpelers();
    const wisselBeurten = getWisselBeurten();
    const keeperBeurten = getKeeperBeurtenInWedstrijd();
    
    console.log('🧮 berekenTotaalKeeperBeurten called with:', { 
      wedstrijdenLength: wedstrijden.length,
      spelersLength: spelers.length
    });
    const totaalKeeperBeurten = berekenTotaalKeeperBeurten(wedstrijden, spelers);
    console.log('✅ berekenTotaalKeeperBeurten returned:', totaalKeeperBeurten);

    console.log('🧮 berekenWedstrijdStats called with:', { 
      wedstrijdId: wedstrijd.id,
      kwartenLength: wedstrijd.kwarten?.length,
      spelersLength: spelers.length
    });
    const stats = berekenWedstrijdStats(wedstrijd, spelers);
    console.log('✅ berekenWedstrijdStats returned:', { 
      statsLength: stats.length,
      stats 
    });

    const isKeeperPositie = huidigePositie === 'Keeper';
    const afwezigeSpelers = wedstrijd.afwezigeSpelers || [];
    
    const beschikbareSpelers = spelers.filter(s => 
      !afwezigeSpelers.includes(s.id) || s.id.toString() === huidigeSid
    );
    
    const spelersMetInfo = beschikbareSpelers.map(s => {
      const spelerStats = stats.find(stat => stat.naam === s.naam);
      return {
        ...s,
        isGebruikt: gebruikt.has(s.id.toString()) && s.id.toString() !== huidigeSid,
        isKeeper: keepers.has(s.id.toString()),
        aantalWissel: wisselBeurten[s.id] || 0,
        minutenGespeeld: spelerStats?.minuten || 0,
        keeperBeurten: totaalKeeperBeurten[s.id] || 0,
        keeperBeurtenDezeWedstrijd: keeperBeurten[s.id] || 0,
        isAfwezig: afwezigeSpelers.includes(s.id)
      };
    });
    
    if (isKeeperPositie) {
      return spelersMetInfo.sort((a, b) => {
        if (a.isGebruikt !== b.isGebruikt) {
          return a.isGebruikt ? 1 : -1;
        }
        if (!a.isGebruikt && !b.isGebruikt) {
          if (a.keeperBeurtenDezeWedstrijd !== b.keeperBeurtenDezeWedstrijd) {
            return a.keeperBeurtenDezeWedstrijd - b.keeperBeurtenDezeWedstrijd;
          }
          if (a.keeperBeurten !== b.keeperBeurten) {
            return a.keeperBeurten - b.keeperBeurten;
          }
          return a.naam.localeCompare(b.naam);
        }
        return 0;
      });
    }
    
    if (kwartIndex > 0) {
      return spelersMetInfo.sort((a, b) => {
        if (a.isGebruikt !== b.isGebruikt) {
          return a.isGebruikt ? 1 : -1;
        }
        if (!a.isGebruikt && !b.isGebruikt) {
          return a.minutenGespeeld - b.minutenGespeeld;
        }
        return 0;
      });
    }
    
    return spelersMetInfo.sort((a, b) => {
      if (a.isGebruikt !== b.isGebruikt) {
        return a.isGebruikt ? 1 : -1;
      }
      return a.naam.localeCompare(b.naam);
    });
  };

  const checkKwartRegels = (kwartIndex: number) => {
    const waarschuwingen: string[] = [];
    const kwart = wedstrijd.kwarten[kwartIndex];
    const afwezigeSpelerIds = wedstrijd.afwezigeSpelers || [];
    
    const beschikbareSpelers = spelers.filter(s => !afwezigeSpelerIds.includes(s.id));
    
    const speeltInKwart = (spelerIdStr: string, kwartObj: typeof kwart) => {
      const inBasis = Object.values(kwartObj.opstelling).includes(spelerIdStr);
      const inWissel = kwartObj.wissels?.some(w => 
        w.wisselSpelerId === spelerIdStr || 
        (w.positie && kwartObj.opstelling[w.positie] === spelerIdStr)
      );
      return inBasis || inWissel;
    };
    
    const speeltAlsVeldspeler = (spelerIdStr: string, kwartObj: typeof kwart) => {
      const isKeeperInBasis = kwartObj.opstelling['Keeper'] === spelerIdStr;
      const wordtKeeperViaWissel = kwartObj.wissels?.some(w => 
        w.positie === 'Keeper' && w.wisselSpelerId === spelerIdStr
      );
      const speelt = speeltInKwart(spelerIdStr, kwartObj);
      const isKeeper = isKeeperInBasis || wordtKeeperViaWissel;
      return speelt && !isKeeper;
    };
    
    const keeperId = kwart.opstelling['Keeper'];
    const wisselNaarKeeper = kwart.wissels?.find(w => w.positie === 'Keeper');
    const keeperIds = [keeperId, wisselNaarKeeper?.wisselSpelerId].filter(Boolean);
    
    keeperIds.forEach(kId => {
      if (!kId || afwezigeSpelerIds.includes(Number(kId))) return;
      const keeperNaam = spelers.find(s => s.id.toString() === kId)?.naam;
      if (!keeperNaam) return;
      
      const vorigKwart = kwartIndex > 0 ? wedstrijd.kwarten[kwartIndex - 1] : null;
      const volgendKwart = kwartIndex < 3 ? wedstrijd.kwarten[kwartIndex + 1] : null;
      const speeltAlsVeldspelerInVorig = vorigKwart && speeltAlsVeldspeler(kId, vorigKwart);
      const speeltAlsVeldspelerInVolgend = volgendKwart && speeltAlsVeldspeler(kId, volgendKwart);
      
      if (!speeltAlsVeldspelerInVorig && !speeltAlsVeldspelerInVolgend) {
        waarschuwingen.push(`🧤 ${keeperNaam}: Was/wordt keeper in vorige/volgende kwart`);
      }
    });
    
    if (kwartIndex < wedstrijd.kwarten.length - 1) {
      const volgendKwart = wedstrijd.kwarten[kwartIndex + 1];
      beschikbareSpelers.forEach(speler => {
        const speeltDitKwart = speeltInKwart(speler.id.toString(), kwart);
        const speeltVolgendKwart = speeltInKwart(speler.id.toString(), volgendKwart);
        if (!speeltDitKwart && !speeltVolgendKwart) {
          waarschuwingen.push(`⏸️ ${speler.naam} zit 2 kwarten op de bank (dit kwart + kwart ${kwartIndex + 2})`);
        }
      });
    }
    
    beschikbareSpelers.forEach(speler => {
      const basisDitKwart = Object.values(kwart.opstelling).includes(speler.id.toString());
      const valtInDitKwart = kwart.wissels?.some(w => w.wisselSpelerId === speler.id.toString());
      
      if (valtInDitKwart && !basisDitKwart && kwartIndex < wedstrijd.kwarten.length - 1) {
        const volgendKwart = wedstrijd.kwarten[kwartIndex + 1];
        const speeltVolgendKwart = speeltInKwart(speler.id.toString(), volgendKwart);
        
        if (!speeltVolgendKwart) {
          waarschuwingen.push(`📤 ${speler.naam} valt in maar zit daarna weer op de bank (kwart ${kwartIndex + 2})`);
        }
      }
    });
    
    return waarschuwingen;
  };

  const stats = berekenWedstrijdStats(wedstrijd, spelers);

  const getAfwezigeSpelersInOpstelling = () => {
    const afwezigeIds = wedstrijd.afwezigeSpelers || [];
    if (afwezigeIds.length === 0) return [];
    
    const afwezigeInOpstelling: { speler: Speler; kwarten: { kwart: number; posities: string[] }[] }[] = [];
    
    afwezigeIds.forEach(afwezigId => {
      const speler = spelers.find(s => s.id === afwezigId);
      if (!speler) return;
      
      const kwarten: { kwart: number; posities: string[] }[] = [];
      
      wedstrijd.kwarten.forEach((kwart, kwartIndex) => {
        const posities: string[] = [];
        
        Object.entries(kwart.opstelling).forEach(([positie, spelerId]) => {
          if (spelerId === afwezigId.toString()) {
            posities.push(positie);
          }
        });
        
        kwart.wissels?.forEach(wissel => {
          if (wissel.wisselSpelerId === afwezigId.toString()) {
            posities.push(`Wissel naar ${wissel.positie}`);
          }
        });
        
        if (posities.length > 0) {
          kwarten.push({ kwart: kwartIndex + 1, posities });
        }
      });
      
      if (kwarten.length > 0) {
        afwezigeInOpstelling.push({ speler, kwarten });
      }
    });
    
    return afwezigeInOpstelling;
  };

  const verwijderAfwezigeUitOpstelling = () => {
    const afwezigeIds = wedstrijd.afwezigeSpelers || [];
    if (afwezigeIds.length === 0) return;
    
    wedstrijd.kwarten.forEach((kwart, kwartIndex) => {
      Object.entries(kwart.opstelling).forEach(([positie, spelerId]) => {
        if (afwezigeIds.includes(Number(spelerId))) {
          onUpdateOpstelling(kwartIndex, positie, '');
        }
      });
      
      kwart.wissels?.forEach((wissel, wisselIndex) => {
        if (afwezigeIds.includes(Number(wissel.wisselSpelerId))) {
          onUpdateWissel(kwartIndex, wisselIndex, 'wisselSpelerId', '');
        }
      });
    });
  };

  const afwezigeInOpstelling = getAfwezigeSpelersInOpstelling();

  const openSelectieModal = (kwartIndex: number, positie: string) => {
    setSelectieModal({ open: true, kwartIndex, positie });
  };

  const sluitSelectieModal = () => {
    setSelectieModal({ open: false, kwartIndex: 0, positie: '' });
  };

  // 🛡️ DEFENSIVE: Safe handlers for doelpunten
  const handleVoegDoelpuntToe = (kwartIdx: number, doelpunt: Omit<Doelpunt, 'id'>) => {
    try {
      console.log('📍 handleVoegDoelpuntToe called:', { kwartIdx, doelpunt });
      if (typeof onVoegDoelpuntToe !== 'function') {
        console.error('❌ ERROR: onVoegDoelpuntToe is not a function!', { onVoegDoelpuntToe });
        alert('⚠️ Fout: Parent component callback niet beschikbaar');
        return;
      }
      onVoegDoelpuntToe(kwartIdx, doelpunt);
      console.log('✅ Doelpunt toegevoegd');
    } catch (error) {
      console.error('❌ ERROR in handleVoegDoelpuntToe:', error);
      alert(`⚠️ Fout bij toevoegen doelpunt: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  const handleVerwijderDoelpunt = (kwartIdx: number, doelpuntId: number) => {
    try {
      console.log('📍 handleVerwijderDoelpunt called:', { kwartIdx, doelpuntId });
      if (typeof onVerwijderDoelpunt !== 'function') {
        console.error('❌ ERROR: onVerwijderDoelpunt is not a function!', { onVerwijderDoelpunt });
        alert('⚠️ Fout: Parent component callback niet beschikbaar');
        return;
      }
      onVerwijderDoelpunt(kwartIdx, doelpuntId);
      console.log('✅ Doelpunt verwijderd');
    } catch (error) {
      console.error('❌ ERROR in handleVerwijderDoelpunt:', error);
      alert(`⚠️ Fout bij verwijderen doelpunt: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  const selecteerSpeler = (spelerId: string) => {
    // Update opstelling met de geselecteerde speler
    const huidigeOpstelling = wedstrijd.kwarten[selectieModal.kwartIndex].opstelling;
    const nieuweOpstelling = {
      ...huidigeOpstelling,
      [selectieModal.positie]: spelerId
    };
    onUpdateKwartOpstelling(selectieModal.kwartIndex, nieuweOpstelling);
    sluitSelectieModal();
  };

  const berekenEindstand = () => {
    let eigenDoelpunten = 0;
    let tegenstanderDoelpunten = 0;
    const doelpuntenmakers: Record<number, { naam: string; goals: number }> = {};
    
    wedstrijd.kwarten.forEach(kwart => {
      if (kwart.doelpunten) {
        kwart.doelpunten.forEach(doelpunt => {
          if (doelpunt.type === 'eigen') {
            eigenDoelpunten++;
            if (doelpunt.spelerId) {
              if (!doelpuntenmakers[doelpunt.spelerId]) {
                const speler = spelers.find(s => s.id === doelpunt.spelerId);
                doelpuntenmakers[doelpunt.spelerId] = {
                  naam: speler?.naam || 'Onbekend',
                  goals: 0
                };
              }
              doelpuntenmakers[doelpunt.spelerId].goals++;
            }
          } else {
            tegenstanderDoelpunten++;
          }
        });
      }
    });
    
    const doelpuntenmakersList = Object.values(doelpuntenmakers).sort((a, b) => b.goals - a.goals);
    
    return {
      eigenDoelpunten,
      tegenstanderDoelpunten,
      doelpuntenmakers: doelpuntenmakersList,
      resultaat: eigenDoelpunten > tegenstanderDoelpunten ? 'gewonnen' :
                 eigenDoelpunten < tegenstanderDoelpunten ? 'verloren' : 'gelijkspel'
    };
  };

  const contextValue = {
    wedstrijd,
    wedstrijden,
    spelers,
    clubNaam,
    teamNaam,
    onUpdateDatum,
    onUpdateTegenstander,
    onUpdateThuisUit,
    onUpdateWedstrijdType,
    onToggleAfwezig,
    onUpdateOpstelling,
    onUpdateKwartFormatie,  // 🆕
    onVoegWisselToe,
    onUpdateWissel,
    onVerwijderWissel,
    onVoegDoelpuntToe,
    onVerwijderDoelpunt,
    onUpdateWedstrijdNotities,
    onUpdateWedstrijdThemas,
    onUpdateKwartThemaBeoordeling,
    onUpdateKwartObservaties,
    onSluiten,
  };

  return (
    <WedstrijdProvider value={contextValue}>
      <div className="space-y-6">
        <WedstrijdHeader 
          afwezigeInOpstelling={afwezigeInOpstelling}
          verwijderAfwezigeUitOpstelling={verwijderAfwezigeUitOpstelling}
        />

        {wedstrijd.kwarten.map((kwart, kwartIndex) => {
          const [doelpuntenOpen, setDoelpuntenOpen] = useState(false);
          const [evaluatieOpen, setEvaluatieOpen] = useState(false);
          const [regelchecksOpen, setRegelchecksOpen] = useState(false);
          const [wisselsOpen, setWisselsOpen] = useState(false);
          
          return (
            <div key={kwartIndex} className="border-2 border-green-400 rounded-lg overflow-hidden bg-green-50">
              {/* HEADER */}
              <div className="bg-green-100 border-b-2 border-green-400 p-4 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base text-green-900">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  Kwart {kwart.nummer} ({kwart.minuten} min)
                </h3>
                
                {/* 🆕 Dropdown voor 6x6 formatie-variant */}
                {(wedstrijd.formatie === '6x6-vliegtuig' || wedstrijd.formatie === '6x6-dobbelsteen') ? (
                  <button
                    onClick={() => openFormatieModal(kwartIndex)}
                    className="px-3 py-1 text-xs sm:text-sm bg-white border-2 border-green-400 text-green-700 font-semibold rounded hover:bg-green-50 transition-colors flex items-center gap-1"
                    title="Wijzig formatie-variant voor dit kwart"
                  >
                    {getEffectiveFormatie(kwartIndex) === '6x6-vliegtuig' ? '✈️' : '🎲'} 
                    {getEffectiveFormatie(kwartIndex) === '6x6-vliegtuig' ? 'Vliegtuig' : 'Dobbelsteen'}
                  </button>
                ) : null}
              </div>
              
              {/* CONTENT */}
              <div className="p-4 space-y-4 bg-white">
              
              {/* 🎮 VOETBALVELD - Visuele opstelling */}
              <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-sm mb-3">🎮 Opstelling</h4>
                <VoetbalVeld
                  formatie={wedstrijd.formatie}
                  opstelling={kwart.opstelling}
                  spelers={spelers}
                  teamNaam={teamNaam}
                  isEditable={true}
                  onSelectSpeler={(positie) => openSelectieModal(kwartIndex, positie)}
                  variantFormatie={kwart.variantFormatie}  // 🆕 Pass variantFormatie
                />
              </div>
              
              <div className="border-2 border-orange-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setWisselsOpen(!wisselsOpen)}
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-orange-100 transition-colors bg-orange-50 font-semibold text-sm border-b-2 border-orange-300"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Wissels Kwart {kwart.nummer}
                  </div>
                  {wisselsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {wisselsOpen && (
                  <div className="p-3 bg-orange-50 space-y-3 border-t-2 border-orange-300">
                    <button 
                      onClick={() => onVoegWisselToe(kwartIndex)} 
                      className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Wissel toevoegen
                    </button>
                {kwart.wissels && kwart.wissels.length > 0 ? (
                      <div className="space-y-3">
                    {kwart.wissels.map((wissel, wisselIndex) => {
                      const keepersDezeWedstrijd = new Set<string>();
                      wedstrijd.kwarten.forEach((k, ki) => {
                        if (ki > kwartIndex) return;
                        const keeperId = k.opstelling['Keeper'];
                        if (keeperId) keepersDezeWedstrijd.add(keeperId);
                        k.wissels?.forEach(w => {
                          if (w.positie === 'Keeper' && w.wisselSpelerId) {
                            keepersDezeWedstrijd.add(w.wisselSpelerId);
                          }
                        });
                      });
                      
                      const reedsGewisseldePosities = kwart.wissels
                        .filter((w, i) => i !== wisselIndex && w.positie)
                        .map(w => w.positie);
                      
                      const berekenMinutenTotNu = () => {
                        const minuten: Record<string, number> = {};
                        wedstrijd.kwarten.forEach((k, ki) => {
                          if (ki > kwartIndex) return;
                          
                          Object.entries(k.opstelling).forEach(([pos, sid]) => {
                            if (!sid) return;
                            const kwartWissel = k.wissels?.find(w => w.positie === pos);
                            const min = kwartWissel && kwartWissel.wisselSpelerId ? 6.25 : k.minuten;
                            minuten[sid] = (minuten[sid] || 0) + min;
                          });
                          
                          k.wissels?.forEach(w => {
                            if (w.wisselSpelerId) {
                              minuten[w.wisselSpelerId] = (minuten[w.wisselSpelerId] || 0) + 6.25;
                            }
                          });
                        });
                        return minuten;
                      };
                      
                      const minutenTotNu = berekenMinutenTotNu();
                      
                      const spelersInVeld = Object.entries(kwart.opstelling)
                        .filter(([_, sid]) => sid)
                        .filter(([pos, _]) => !reedsGewisseldePosities.includes(pos))
                        .map(([pos, sid]) => ({
                          spelerId: sid,
                          positie: pos,
                          naam: spelers.find(s => s.id.toString() === sid)?.naam || 'Onbekend',
                          isKeeperGeweest: keepersDezeWedstrijd.has(sid),
                          minutenGespeeld: minutenTotNu[sid] || 0
                        }))
                        .sort((a, b) => {
                          if (a.isKeeperGeweest !== b.isKeeperGeweest) return a.isKeeperGeweest ? 1 : -1;
                          return a.minutenGespeeld - b.minutenGespeeld;
                        });
                      
                      const geselecteerdeSpeler = wissel.positie ? spelersInVeld.find(s => s.positie === wissel.positie) : null;
                      
                      const afwezigeSpelerIds = wedstrijd.afwezigeSpelers || [];
                      const beschikbareWisselSpelers = spelers
                        .filter(s => 
                          !Object.values(kwart.opstelling).includes(s.id.toString()) &&
                          !kwart.wissels.some((w, i) => i !== wisselIndex && w.wisselSpelerId === s.id.toString()) &&
                          !afwezigeSpelerIds.includes(s.id)
                        )
                        .map(s => ({ ...s, minutenGespeeld: minutenTotNu[s.id.toString()] || 0 }))
                        .sort((a, b) => a.minutenGespeeld - b.minutenGespeeld);
                      
                      return (
                        <div key={wissel.id} className="bg-white rounded p-3 border-2 border-orange-200">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">🔴 Speler UIT (na 6,25 min)</label>
                                <select 
                                  value={wissel.positie} 
                                  onChange={(e) => onUpdateWissel(kwartIndex, wisselIndex, 'positie', e.target.value)} 
                                  className="w-full px-2 py-2 border-2 border-red-300 rounded-lg text-sm font-medium bg-red-50"
                                >
                                  <option value="">-- Kies speler --</option>
                                  {spelersInVeld.map(s => (
                                    <option key={s.spelerId} value={s.positie}>
                                      {s.naam} ({s.minutenGespeeld} min • {s.positie}){s.isKeeperGeweest ? ' 🧤' : ''}
                                    </option>
                                  ))}
                                </select>
                                {geselecteerdeSpeler && (
                                  <div className="text-xs mt-1 space-y-0.5">
                                    <p className="text-gray-600 font-medium">⏱️ {geselecteerdeSpeler.minutenGespeeld} min gespeeld</p>
                                    {geselecteerdeSpeler.isKeeperGeweest && (
                                      <p className="text-blue-600 font-medium">🧤 Was/is keeper deze wedstrijd</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">🟢 Speler IN (na 6,25 min)</label>
                                <select 
                                  value={wissel.wisselSpelerId} 
                                  onChange={(e) => onUpdateWissel(kwartIndex, wisselIndex, 'wisselSpelerId', e.target.value)} 
                                  className="w-full px-2 py-2 border-2 border-green-300 rounded-lg text-sm font-medium bg-green-50" 
                                  disabled={!wissel.positie}
                                >
                                  <option value="">-- Kies speler --</option>
                                  {beschikbareWisselSpelers.map(s => (
                                    <option key={s.id} value={s.id}>
                                      {s.naam} ({s.minutenGespeeld} min)
                                    </option>
                                  ))}
                                </select>
                                {!wissel.positie && <p className="text-xs text-orange-600 mt-1">⚠️ Kies eerst uit-speler</p>}
                                {wissel.positie && beschikbareWisselSpelers.length === 0 && (
                                  <p className="text-xs text-orange-600 mt-1">⚠️ Geen spelers beschikbaar</p>
                                )}
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => onVerwijderWissel(kwartIndex, wisselIndex)} 
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors mt-5"
                              title="Verwijder wissel"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                      <p className="text-sm text-gray-500 text-center py-2">Geen wissels</p>
                    )}
                    </div>
                  )}
                </div>
              
              <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setDoelpuntenOpen(!doelpuntenOpen)}
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-100 transition-colors bg-blue-50 font-semibold text-sm border-b-2 border-blue-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚽</span>
                    <span>
                      Doelpunten Kwart {kwart.nummer}
                    </span>
                    {kwart.doelpunten && kwart.doelpunten.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">
                        {kwart.doelpunten.length}
                      </span>
                    )}
                  </div>
                  {doelpuntenOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {doelpuntenOpen && (
                  <div className="p-3 bg-blue-50 border-t-2 border-blue-300">
                    <ScoreTracking
                      kwartIndex={kwartIndex}
                      wedstrijd={wedstrijd}
                      spelers={spelers}
                      thuisUit={wedstrijd.thuisUit || 'thuis'}
                      teamNaam={teamNaam}
                      tegenstander={wedstrijd.tegenstander || 'Tegenstander'}
                      onVoegDoelpuntToe={handleVoegDoelpuntToe}
                      onVerwijderDoelpunt={handleVerwijderDoelpunt}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setEvaluatieOpen(!evaluatieOpen)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-semibold text-gray-700">
                      📋 Evaluatie Kwart {kwart.nummer}
                    </span>
                  </div>
                  {evaluatieOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {evaluatieOpen && (
                  <div className="px-3 py-4 border-t border-purple-200 bg-white space-y-3 sm:space-y-4">
                    {wedstrijd.themas && wedstrijd.themas.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-600">
                          🎯 Beoordeel de wedstrijdthema's voor dit kwart
                        </p>
                        {wedstrijd.themas.map(themaId => {
                          const thema = ALLE_THEMAS.find(t => t.id === themaId);
                          if (!thema) return null;
                          
                          const beoordeling = kwart.themaBeoordelingen?.[themaId] || null;
                          
                          return (
                            <div key={themaId} className="bg-white rounded-lg p-3 border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{thema.emoji}</span>
                                <span className="font-medium text-sm">{thema.label}</span>
                              </div>
                              <div className="flex gap-2">
                                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                  beoordeling === 'goed'
                                    ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`thema-${kwartIndex}-${themaId}`}
                                    checked={beoordeling === 'goed'}
                                    onChange={() => onUpdateKwartThemaBeoordeling(kwartIndex, themaId, 'goed')}
                                    className="sr-only"
                                  />
                                  <span className="text-base">✅</span>
                                  <span className="text-xs sm:text-sm">Goed</span>
                                </label>
                                
                                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                  beoordeling === 'beter'
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`thema-${kwartIndex}-${themaId}`}
                                    checked={beoordeling === 'beter'}
                                    onChange={() => onUpdateKwartThemaBeoordeling(kwartIndex, themaId, 'beter')}
                                    className="sr-only"
                                  />
                                  <span className="text-base">⚠️</span>
                                  <span className="text-xs sm:text-sm">Kan beter</span>
                                </label>
                                
                                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                  beoordeling === null
                                    ? 'border-gray-400 bg-gray-50 text-gray-700 font-semibold'
                                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`thema-${kwartIndex}-${themaId}`}
                                    checked={beoordeling === null}
                                    onChange={() => onUpdateKwartThemaBeoordeling(kwartIndex, themaId, null)}
                                    className="sr-only"
                                  />
                                  <span className="text-base">–</span>
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">
                          💡 Geen thema's geselecteerd. Selecteer thema's in "Wedstrijd Focus & Thema's" om deze per kwart te evalueren.
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs text-gray-600 mb-2">
                        ➕ Algemene observaties (optioneel)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {KWART_OBSERVATIES.map(observatie => {
                          const isSelected = kwart.observaties?.includes(observatie.id) || false;
                          return (
                            <button
                              key={observatie.id}
                              onClick={() => {
                                const current = kwart.observaties || [];
                                if (isSelected) {
                                  onUpdateKwartObservaties(kwartIndex, current.filter(o => o !== observatie.id));
                                } else {
                                  onUpdateKwartObservaties(kwartIndex, [...current, observatie.id]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg border-2 font-medium text-xs sm:text-sm transition-all ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span className="mr-1">{observatie.emoji}</span>
                              {observatie.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>                  
                  </div>
                )}
              </div>
              
              {checkKwartRegels(kwartIndex).length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg overflow-hidden mt-4">
                  <button
                    onClick={() => setRegelchecksOpen(!regelchecksOpen)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="text-sm font-semibold text-gray-700">Let op in dit kwart</span>
                      <span className="px-2 py-0.5 bg-yellow-500 text-white rounded-full text-xs font-bold">
                        {checkKwartRegels(kwartIndex).length}
                      </span>
                    </div>
                    {regelchecksOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  
                  {regelchecksOpen && (
                    <div className="px-3 py-3 border-t border-yellow-200 bg-white space-y-2">
                      {checkKwartRegels(kwartIndex).map((waarschuwing, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-orange-700 p-2 bg-yellow-50 rounded">
                          <span className="text-base shrink-0">•</span>
                          <span>{waarschuwing}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!regelchecksOpen && checkKwartRegels(kwartIndex).length > 0 && (
                    <div className="px-3 py-3 border-t border-yellow-200 bg-white space-y-2">
                      {checkKwartRegels(kwartIndex).slice(0, 2).map((waarschuwing, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-orange-700 p-2 bg-yellow-50 rounded">
                          <span className="text-base shrink-0">•</span>
                          <span>{waarschuwing}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          );
        })}

        {/* 📊 WEDSTRIJD SAMENVATTING - Automatisch gegenereerd overzicht van de hele wedstrijd */}
        <WedstrijdSamenvatting />

        <div className="border rounded-lg p-3 sm:p-4 bg-green-50">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">📋 Regelcheck Samenvatting</h3>
          {(() => {
            const alleKwartChecks = wedstrijd.kwarten.map((_, index) => checkKwartRegels(index)).flat();
            const totaalWaarschuwingen = alleKwartChecks.length;
            
            if (totaalWaarschuwingen === 0) {
              return (
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-xl">✅</span>
                  <span className="font-medium">Perfect! Alle regels zijn in orde!</span>
                </div>
              );
            }
            
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="text-lg">⚠️</span>
                  <span className="font-medium">{totaalWaarschuwingen} waarschuwing{totaalWaarschuwingen !== 1 ? 'en' : ''} gevonden</span>
                </div>
                <p className="text-sm text-gray-600">
                  Bekijk elk kwart hierboven voor details. De checks verschijnen direct onder elk kwart waar iets niet klopt.
                </p>
              </div>
            );
          })()}
        </div>

        {selectieModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Kies speler voor {selectieModal.positie}</h3>
                  <p className="text-sm opacity-90">Kwart {selectieModal.kwartIndex + 1}</p>
                </div>
                <button 
                  onClick={sluitSelectieModal}
                  className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <div className="space-y-2">
                  {selectieModal.positie === 'Keeper' ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        🧤 <strong>Keeper selectie:</strong> Eerst gesorteerd op minst keeper deze wedstrijd, dan op totaal minst keeper geweest
                      </p>
                    </div>
                  ) : selectieModal.kwartIndex > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Spelers met minste speeltijd staan bovenaan
                      </p>
                    </div>
                  )}
                  
                  {wedstrijd.kwarten[selectieModal.kwartIndex].opstelling[selectieModal.positie] && (
                    <button
                      onClick={() => selecteerSpeler('')}
                      className="w-full p-4 border-2 border-red-300 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
                    >
                      <div className="font-semibold text-red-700">❌ Verwijder speler</div>
                      <div className="text-xs text-red-600 mt-1">Positie leeg maken</div>
                    </button>
                  )}
                  
                  {(() => {
                    try {
                      const beschikbareSpelers = getBeschikbareSpelers(selectieModal.kwartIndex, selectieModal.positie);
                      return beschikbareSpelers.map((speler) => {
                    const isBeschikbaar = !speler.isGebruikt;
                    const isKeeperPositie = selectieModal.positie === 'Keeper';
                    
                    let priorityColor = 'green';
                    let priorityLabel = '';
                    
                    if (isBeschikbaar) {
                      if (isKeeperPositie) {
                        if (speler.keeperBeurtenDezeWedstrijd === 0) {
                          if (speler.keeperBeurten === 0) {
                            priorityColor = 'yellow';
                            priorityLabel = '🟡 Nog nooit keeper geweest';
                          } else if (speler.keeperBeurten <= 2) {
                            priorityColor = 'orange';
                            priorityLabel = '🟠 Weinig keeper ervaring';
                          } else {
                            priorityColor = 'green';
                            priorityLabel = '🟢 Al vaker keeper geweest';
                          }
                        } else {
                          priorityColor = 'gray';
                          priorityLabel = '⚪ Al keeper geweest deze wedstrijd';
                        }
                      } else if (selectieModal.kwartIndex > 0) {
                        if (speler.minutenGespeeld === 0) {
                          priorityColor = 'red';
                          priorityLabel = '🔴 Nog niet gespeeld!';
                        } else if (speler.minutenGespeeld <= 6.25) {
                          priorityColor = 'orange';
                          priorityLabel = '🟡 Weinig gespeeld';
                        } else {
                          priorityColor = 'green';
                        }
                      }
                    }
                    
                    const borderColor = !isBeschikbaar ? 'border-gray-300' : priorityColor === 'red' ? 'border-red-400' : priorityColor === 'yellow' ? 'border-yellow-400' : priorityColor === 'orange' ? 'border-orange-400' : priorityColor === 'gray' ? 'border-gray-400' : 'border-green-500';
                    const bgColor = !isBeschikbaar ? 'bg-gray-100' : priorityColor === 'red' ? 'bg-red-50' : priorityColor === 'yellow' ? 'bg-yellow-50' : priorityColor === 'orange' ? 'bg-orange-50' : priorityColor === 'gray' ? 'bg-gray-50' : 'bg-green-50';
                    const hoverColor = !isBeschikbaar ? '' : priorityColor === 'red' ? 'hover:bg-red-100' : priorityColor === 'yellow' ? 'hover:bg-yellow-100' : priorityColor === 'orange' ? 'hover:bg-orange-100' : priorityColor === 'gray' ? 'hover:bg-gray-100' : 'hover:bg-green-100';
                    
                    return (
                      <button
                        key={speler.id}
                        onClick={() => isBeschikbaar && selecteerSpeler(speler.id.toString())}
                        disabled={!isBeschikbaar}
                        className={`w-full p-4 border-2 rounded-lg transition-colors text-left relative ${
                          isBeschikbaar ? `${borderColor} ${bgColor} ${hoverColor} cursor-pointer` : 
                          'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-8">
                            <div className="font-semibold text-lg">
                              {speler.naam}
                            </div>
                            {priorityLabel && (
                              <div className="text-sm font-semibold mt-1 mb-1">{priorityLabel}</div>
                            )}
                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                              {isKeeperPositie && (
                                <div className="space-y-1">
                                  <div className="font-bold text-base text-gray-800">
                                    📊 Totaal: {speler.keeperBeurten}x keeper
                                  </div>
                                  <div className="text-blue-600">
                                    🧤 Deze wedstrijd: {speler.keeperBeurtenDezeWedstrijd}x
                                  </div>
                                  {speler.minutenGespeeld > 0 && (
                                    <div className="text-gray-600">
                                      ⚽ {speler.minutenGespeeld} min gespeeld deze wedstrijd
                                    </div>
                                  )}
                                </div>
                              )}
                              {!isKeeperPositie && (
                                <>
                                  {speler.minutenGespeeld > 0 && (
                                    <div>⚽ {speler.minutenGespeeld} min gespeeld</div>
                                  )}
                                  {speler.aantalWissel > 0 && (
                                    <div>🪑 {speler.aantalWissel}x op de bank</div>
                                  )}
                                  {speler.minutenGespeeld === 0 && selectieModal.kwartIndex > 0 && (
                                    <div className="text-red-600 font-medium">✨ Moet nog spelen!</div>
                                  )}
                                  {speler.minutenGespeeld === 0 && selectieModal.kwartIndex === 0 && (
                                    <div className="text-blue-600">✨ Start van wedstrijd</div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {!isBeschikbaar && (
                            <div className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              In dit kwart
                            </div>
                          )}
                        </div>
                      </button>
                    );
                      });
                    } catch (error) {
                      console.error('❌ ERROR in getBeschikbareSpelers:', error);
                      return (
                        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                          <h4 className="font-bold text-red-700 mb-2">⚠️ Fout bij laden spelers</h4>
                          <p className="text-sm text-red-600 mb-3">{String(error)}</p>
                          <details className="text-xs text-red-600">
                            <summary>Details</summary>
                            <pre className="mt-2 p-2 bg-white rounded overflow-auto max-h-40">
                              {JSON.stringify({ error: error instanceof Error ? error.message : error }, null, 2)}
                            </pre>
                          </details>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              
              <div className="border-t p-4 bg-gray-50">
                <button
                  onClick={sluitSelectieModal}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🆕 Formatie Wissel Modal */}
      <FormatieWisselModal
        isOpen={formatieModal.open}
        vanFormatie={formatieModal.vanFormatie}
        naarFormatie={formatieModal.naarFormatie}
        onConfirm={handleFormatieWisselBevestigen}
        onCancel={() => setFormatieModal({ ...formatieModal, open: false })}
      />
    </WedstrijdProvider>
  );
}
