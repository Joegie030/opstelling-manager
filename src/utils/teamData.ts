/**
 * teamData.ts - Team data loading utilities
 * Centralized logic for loading team information across the app
 * Used by App.tsx, TeamBeheer, and any component needing team info
 */

import { Team } from '../firebase/firebaseService';

export interface TeamInfo {
  teamId: string;
  teamNaam: string;
}

/**
 * Laadt alle team informatie voor de gegeven teamIds
 * @param teamIds - Array van team IDs om te laden
 * @param getTeamFunction - Firebase getTeam functie
 * @returns Promise<TeamInfo[]> - Array met teamnamen
 * 
 * ✅ Parallel loading: alle teams tegelijk
 * ✅ Error handling: als team niet geladen kan, skip die
 * ✅ Caching-friendly: kan makkelijk uitgebreid met cache
 */
export async function laadTeamInfo(
  teamIds: string[],
  getTeamFunction: (teamId: string) => Promise<Team | null>
): Promise<TeamInfo[]> {
  console.log('📥 laadTeamInfo: loading', teamIds.length, 'teams');

  try {
    // Laad alle teams parallel
    const teamPromises = teamIds.map(id => getTeamFunction(id));
    const teams = await Promise.all(teamPromises);

    // Filter null values en map naar TeamInfo
    const teamInfos = teams
      .filter((t): t is Team => t !== null)
      .map(t => ({
        teamId: t.teamId,
        teamNaam: t.teamNaam
      }));

    console.log('✅ laadTeamInfo success:', teamInfos.length, 'teams loaded');
    return teamInfos;
  } catch (error) {
    console.error('❌ Error loading team info:', error);
    return [];
  }
}

/**
 * Convenience wrapper: Finds a team by ID from an array
 * @param teamId - Team ID to find
 * @param teams - Array of TeamInfo objects
 * @returns TeamInfo | undefined
 */
export function findTeamById(teamId: string | null, teams: TeamInfo[]): TeamInfo | undefined {
  if (!teamId) return undefined;
  return teams.find(t => t.teamId === teamId);
}

/**
 * Gets the team name from a TeamInfo array, or fallback to teamId
 * @param teamId - Team ID
 * @param teams - Array of TeamInfo objects
 * @param fallback - Optional fallback text (default: teamId)
 * @returns Team name or fallback
 */
export function getTeamName(teamId: string | null, teams: TeamInfo[], fallback?: string): string {
  if (!teamId) return fallback || 'Team';
  const team = findTeamById(teamId, teams);
  return team?.teamNaam || fallback || teamId;
}
