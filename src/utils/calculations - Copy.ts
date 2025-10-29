import { Speler, Wedstrijd } from '../types';

/**
 * Berekent statistieken voor een specifieke wedstrijd
 * - Speeltijd per speler
 * - Keeper beurten per speler
 * - Wissel minuten
 */
export function berekenWedstrijdStats(
  wedstrijd: Wedstrijd,
  spelers: Speler[]
) {
  const stats: Record<number, { naam: string; minuten: number; keeperBeurten: number; wisselMinuten: number }> = {};
  
  spelers.forEach(s => {
    stats[s.id] = { naam: s.naam, minuten: 0, keeperBeurten: 0, wisselMinuten: 0 };
  });

  wedstrijd.kwarten.forEach(kwart => {
    const spelersMetMinuten: Record<string, number> = {};
    
    Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
      if (sid && stats[Number(sid)]) {
        const wissel = kwart.wissels?.find(w => w.positie === pos);
        const min = wissel && wissel.wisselSpelerId ? 6.25 : kwart.minuten;
        stats[Number(sid)].minuten += min;
        spelersMetMinuten[sid] = (spelersMetMinuten[sid] || 0) + min;
        if (pos === 'Keeper') stats[Number(sid)].keeperBeurten += 1;
      }
    });
    
    kwart.wissels?.forEach(w => {
      if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
        stats[Number(w.wisselSpelerId)].minuten += 6.25;
        spelersMetMinuten[w.wisselSpelerId] = (spelersMetMinuten[w.wisselSpelerId] || 0) + 6.25;
        if (w.positie === 'Keeper') stats[Number(w.wisselSpelerId)].keeperBeurten += 1;
      }
    });
    
    spelers.forEach(s => {
      const gespeeld = spelersMetMinuten[s.id.toString()] || 0;
      const wissel = kwart.minuten - gespeeld;
      if (wissel > 0) stats[s.id].wisselMinuten += wissel;
    });
  });

  return Object.values(stats);
}

/**
 * Berekent totaal aantal keeper beurten per speler over alle wedstrijden
 */
export function berekenTotaalKeeperBeurten(
  wedstrijden: Wedstrijd[],
  spelers: Speler[]
) {
  const totaalKeeperTelling: Record<number, number> = {};
  spelers.forEach(s => { totaalKeeperTelling[s.id] = 0; });
  
  wedstrijden.forEach(w => {
    w.kwarten.forEach(kwart => {
      const keeperId = kwart.opstelling['Keeper'];
      if (keeperId) {
        totaalKeeperTelling[Number(keeperId)] = (totaalKeeperTelling[Number(keeperId)] || 0) + 1;
      }
      kwart.wissels?.forEach(wissel => {
        if (wissel.positie === 'Keeper' && wissel.wisselSpelerId) {
          totaalKeeperTelling[Number(wissel.wisselSpelerId)] = (totaalKeeperTelling[Number(wissel.wisselSpelerId)] || 0) + 1;
        }
      });
    });
  });
  
  return totaalKeeperTelling;
}

/**
 * Berekent gedetailleerde speelminuten per speler
 * - Regulaire minuten (volledige kwart)
 * - Wissel minuten (gedeeltelijke kwart)
 * - Bank minuten
 * - Totaal minuten
 * - Gemiddelde per wedstrijd
 */
export function berekenSpeelminutenDetail(
  wedstrijden: Wedstrijd[],
  spelers: Speler[]
) {
  interface DetailStats {
    [key: number]: {
      naam: string;
      regeliarMinuten: number;
      wisselMinuten: number;
      bankMinuten: number;
      totaalMinuten: number;
      gemiddeldePerWedstrijd: number;
      wedstrijden: number;
    }
  }

  const stats: DetailStats = {};
  spelers.forEach(s => {
    stats[s.id] = { 
      naam: s.naam,
      regeliarMinuten: 0,
      wisselMinuten: 0,
      bankMinuten: 0,
      totaalMinuten: 0,
      gemiddeldePerWedstrijd: 0,
      wedstrijden: 0
    };
  });

  wedstrijden.forEach(wed => {
    wed.kwarten.forEach(kwart => {
      const minutesPerKwart = kwart.minuten;
      const spelersThisKwart: Record<number, number> = {};

      Object.entries(kwart.opstelling).forEach(([pos, sid]) => {
        if (sid && stats[Number(sid)]) {
          const wissel = kwart.wissels?.find(w => w.positie === pos);
          if (wissel && wissel.wisselSpelerId) {
            stats[Number(sid)].regeliarMinuten += 6.25;
            spelersThisKwart[Number(sid)] = 6.25;
          } else {
            stats[Number(sid)].regeliarMinuten += minutesPerKwart;
            spelersThisKwart[Number(sid)] = minutesPerKwart;
          }
        }
      });

      kwart.wissels?.forEach(w => {
        if (w.wisselSpelerId && stats[Number(w.wisselSpelerId)]) {
          const minuten = (kwart.minuten - (spelersThisKwart[Number(w.wisselSpelerId)] || 0));
          stats[Number(w.wisselSpelerId)].wisselMinuten += minuten;
          spelersThisKwart[Number(w.wisselSpelerId)] = (spelersThisKwart[Number(w.wisselSpelerId)] || 0) + minuten;
        }
      });

      spelers.forEach(s => {
        const gespeeld = spelersThisKwart[s.id] || 0;
        const bank = minutesPerKwart - gespeeld;
        if (bank > 0) {
          stats[s.id].bankMinuten += bank;
        }
      });
    });
  });

  wedstrijden.forEach(wed => {
    const spelersInWed = new Set<number>();
    wed.kwarten.forEach(k => {
      Object.values(k.opstelling).forEach(sid => {
        if (sid) spelersInWed.add(Number(sid));
      });
      k.wissels?.forEach(w => {
        if (w.wisselSpelerId) spelersInWed.add(Number(w.wisselSpelerId));
      });
    });
    spelersInWed.forEach(sid => {
      if (stats[sid]) {
        stats[sid].wedstrijden += 1;
      }
    });
  });

  Object.values(stats).forEach(stat => {
    stat.totaalMinuten = stat.regeliarMinuten + stat.wisselMinuten;
    stat.gemiddeldePerWedstrijd = stat.wedstrijden > 0 ? Math.round(stat.totaalMinuten / stat.wedstrijden * 10) / 10 : 0;
  });

  return Object.values(stats);
}

/**
 * Berekent team prestaties over alle wedstrijden
 * - Totaal doelpunten (voor en tegen)
 * - Doelsaldo
 * - Gewonnen/verloren/gelijkspel
 * - Winst percentage
 */
export function berekenTeamPrestaties(wedstrijden: Wedstrijd[]) {
  let totaalEigenDoelpunten = 0;
  let totaalTegenstanderDoelpunten = 0;
  let gewonnen = 0;
  let gelijkspel = 0;
  let verloren = 0;
  
  wedstrijden.forEach(wed => {
    let eigenDoelpunten = 0;
    let tegenstanderDoelpunten = 0;
    
    wed.kwarten.forEach(kwart => {
      if (kwart.doelpunten) {
        kwart.doelpunten.forEach(doelpunt => {
          if (doelpunt.type === 'eigen') {
            eigenDoelpunten++;
            totaalEigenDoelpunten++;
          } else {
            tegenstanderDoelpunten++;
            totaalTegenstanderDoelpunten++;
          }
        });
      }
    });
    
    if (eigenDoelpunten > tegenstanderDoelpunten) {
      gewonnen++;
    } else if (eigenDoelpunten < tegenstanderDoelpunten) {
      verloren++;
    } else if (eigenDoelpunten > 0 || tegenstanderDoelpunten > 0) {
      gelijkspel++;
    }
  });
  
  const totaalWedstrijden = gewonnen + gelijkspel + verloren;
  const winstPercentage = totaalWedstrijden > 0 ? Math.round((gewonnen / totaalWedstrijden) * 100) : 0;
  const doelsaldo = totaalEigenDoelpunten - totaalTegenstanderDoelpunten;
  
  return {
    totaalEigenDoelpunten,
    totaalTegenstanderDoelpunten,
    doelsaldo,
    gewonnen,
    gelijkspel,
    verloren,
    totaalWedstrijden,
    winstPercentage
  };
}

/**
 * Berekent topscorers over alle wedstrijden
 */
export function berekenTopscorers(
  wedstrijden: Wedstrijd[],
  spelers: Speler[]
) {
  const scorers: Record<number, { naam: string; doelpunten: number }> = {};
  
  spelers.forEach(s => {
    scorers[s.id] = { naam: s.naam, doelpunten: 0 };
  });
  
  wedstrijden.forEach(wed => {
    wed.kwarten.forEach(kwart => {
      if (kwart.doelpunten) {
        kwart.doelpunten.forEach(doelpunt => {
          if (doelpunt.type === 'eigen' && doelpunt.spelerId && scorers[doelpunt.spelerId]) {
            scorers[doelpunt.spelerId].doelpunten++;
          }
        });
      }
    });
  });
  
  return Object.values(scorers)
    .filter(s => s.doelpunten > 0)
    .sort((a, b) => b.doelpunten - a.doelpunten);
}
