import { useState } from 'react';
import { Trash2, Loader } from 'lucide-react';
import { CoachInvite } from '../types';

interface PendingInvitesListProps {
  pendingInvites: CoachInvite[];
  onRevoke: (inviteId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function PendingInvitesList({
  pendingInvites,
  onRevoke,
  isLoading = false
}: PendingInvitesListProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const calculateDaysLeft = (expiresAt: string): number => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRevoke = async (inviteId: string) => {
    setRevokingId(inviteId);
    setError('');

    try {
      await onRevoke(inviteId);
    } catch (err: any) {
      setError(err.message || 'Fout bij intrekken invite');
      console.error('Error revoking invite:', err);
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">⏳ Wachtende Uitnodigingen</h3>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Laden...</span>
        </div>
      </div>
    );
  }

  if (pendingInvites.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">⏳ Wachtende Uitnodigingen</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Geen openstaande uitnodigingen</p>
          <p className="text-gray-500 text-sm">Nodig een coach uit via het formulier hierboven</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">⏳ Wachtende Uitnodigingen ({pendingInvites.length})</h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded mb-4">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-3 font-semibold text-gray-700">📧 Email</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">📅 Uitgenodigd op</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">⏰ Vervalt over</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">🔧 Acties</th>
            </tr>
          </thead>
          <tbody>
            {pendingInvites.map((invite) => {
              const daysLeft = calculateDaysLeft(invite.expiresAt);
              const isExpiring = daysLeft <= 2;
              
              return (
                <tr key={invite.inviteId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-3 text-gray-800">{invite.email}</td>
                  <td className="py-3 px-3 text-gray-600 text-xs">{formatDate(invite.createdAt)}</td>
                  <td className={`py-3 px-3 font-semibold ${isExpiring ? 'text-red-600' : 'text-green-600'}`}>
                    {daysLeft === 0 ? 'Vervallen' : daysLeft === 1 ? '1 dag' : `${daysLeft} dagen`}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleRevoke(invite.inviteId)}
                      disabled={revokingId === invite.inviteId}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all inline-flex items-center gap-1 ${
                        revokingId === invite.inviteId
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                      }`}
                    >
                      {revokingId === invite.inviteId ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Bezig...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Intrekken</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {pendingInvites.map((invite) => {
          const daysLeft = calculateDaysLeft(invite.expiresAt);
          const isExpiring = daysLeft <= 2;
          
          return (
            <div key={invite.inviteId} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <div className="mb-3">
                <p className="text-xs text-gray-600 font-semibold">📧 Email</p>
                <p className="text-gray-800 font-semibold">{invite.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">📅 Uitgenodigd</p>
                  <p className="text-gray-700 text-sm">{formatDate(invite.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">⏰ Vervalt</p>
                  <p className={`text-sm font-semibold ${isExpiring ? 'text-red-600' : 'text-green-600'}`}>
                    {daysLeft === 0 ? 'Vervallen' : daysLeft === 1 ? '1 dag' : `${daysLeft} dagen`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRevoke(invite.inviteId)}
                disabled={revokingId === invite.inviteId}
                className={`w-full px-3 py-2 rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                  revokingId === invite.inviteId
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                }`}
              >
                {revokingId === invite.inviteId ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Bezig...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Intrekken</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
