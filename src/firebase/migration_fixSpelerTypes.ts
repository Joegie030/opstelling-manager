/**
 * MIGRATION FUNCTION - Zet alle lege 'type' velden naar 'vast'
 * 
 * Dit draai je eenmalig uit via een button of console
 * Daarna kan je dit weer verwijderen
 */

import { db } from './firebaseService';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export const fixEmptySpelerTypes = async () => {
  try {
    console.log('🔄 Migration started: fixing empty speler types...');
    
    // Haal alle teams op
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    let totalFixed = 0;
    
    for (const teamDoc of teamsSnapshot.docs) {
      const team = teamDoc.data();
      const spelers = team.spelers || [];
      
      // Controleer of er spelers met lege type zijn
      const needsUpdate = spelers.some((s: any) => !s.type);
      
      if (needsUpdate) {
        // Fix alle lege types
        const updatedSpelers = spelers.map((s: any) => ({
          ...s,
          type: s.type || 'vast'  // Als type leeg is, zet op 'vast'
        }));
        
        // Update team in Firebase
        await updateDoc(doc(db, 'teams', teamDoc.id), {
          spelers: updatedSpelers
        });
        
        const fixedCount = updatedSpelers.filter((s: any) => !s.type).length;
        totalFixed += fixedCount;
        console.log(`✅ Team ${team.clubNaam}: ${fixedCount} spelers gefixed`);
      }
    }
    
    console.log(`🎉 Migration complete! Total spelers fixed: ${totalFixed}`);
    return { success: true, fixed: totalFixed };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, error };
  }
};
