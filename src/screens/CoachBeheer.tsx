import { useState, useEffect } from 'react';
import CoachInviteForm from '../components/Coach/CoachInviteForm';
import PendingInvitesList from '../components/Coach/PendingInvitesList';
import ActiveCoachesList from '../screens/ActiveCoachesList';
import { Coach, CoachInvite } from '../types';
import { getPendingInvitesByTeam } from '../firebase/firebaseService';

interface CoachBeheerProps {
  teamId: string;
  teamNaam: string;
  clubNaam: string;
  currentCoach: Coach;
  pendingInvites: CoachInvite[];
  teamCoaches: Coach[];
  onRevokeInvite: (inviteId: string) => Promise<void>;
  onRemoveCoach: (coachUid: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CoachBeheer({
  teamId,
  teamNaam,
  clubNaam,
  currentCoach,
  pendingInvites,
  teamCoaches,
  onRevokeInvite,
  onRemoveCoach,
  isLoading = false
}: CoachBeheerProps) {
  const [invites, setInvites] = useState<CoachInvite[]>(pendingInvites);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Load invites on mount and when teamId changes
  useEffect(() => {
    const loadInvites = async () => {
      if (!teamId) return;
      
      setLoadingInvites(true);
      try {
        console.log('📥 Loading pending invites for team:', teamId);
        const updated = await getPendingInvitesByTeam(teamId);
        console.log('✅ Loaded invites:', updated);
        setInvites(updated);
      } catch (error) {
        console.error('❌ Error loading invites:', error);
      } finally {
        setLoadingInvites(false);
      }
    };

    loadInvites();
  }, [teamId]);

  // Refresh pending invites after new invite created
  const handleInviteSent = async () => {
    try {
      console.log('🔄 Refreshing pending invites after new invite...');
      const updated = await getPendingInvitesByTeam(teamId);
      console.log('✅ Refreshed invites:', updated);
      setInvites(updated);
    } catch (error) {
      console.error('❌ Error refreshing pending invites:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🏆 Coach Management</h2>
        <p className="text-gray-600">Beheer en nodig coaches uit voor dit team</p>
      </div>

      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
        <p>🔍 Debug: teamId={teamId}, pendingInvites count={invites.length}, loading={loadingInvites}</p>
      </div>

      {/* Section 1: Invite form */}
      <CoachInviteForm
        teamId={teamId}
        teamNaam={teamNaam}
        clubNaam={clubNaam}
        currentCoach={currentCoach}
        onInviteSent={handleInviteSent}
      />

      {/* Divider */}
      <div className="border-t-2 border-gray-200 my-6"></div>

      {/* Section 2: Pending invites */}
      <div>
        <PendingInvitesList
          pendingInvites={invites}
          onRevoke={onRevokeInvite}
          isLoading={isLoading}
        />
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-200 my-6"></div>

      {/* Section 3: Active coaches */}
      <div>
        <ActiveCoachesList
          coaches={teamCoaches}
          currentCoach={currentCoach}
          onRemove={onRemoveCoach}
          isLoading={isLoading}
        />
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">💡 Tip:</span> Deel de invite link met coaches via email, WhatsApp of chat. Ze kunnen zelf registreren en inloggen met hun eigen account.
        </p>
      </div>
    </div>
  );
}
