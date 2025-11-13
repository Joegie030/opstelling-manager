import { useState, useEffect } from 'react';
import { ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { getInviteById, CoachInvite } from '../firebase/firebaseService';

interface AcceptInviteScreenProps {
  inviteId: string | null;
  onAccept: (inviteId: string) => Promise<void>;
  onNavigate?: (screen: string) => void;
}

export default function AcceptInviteScreen({
  inviteId,
  onAccept,
  onNavigate
}: AcceptInviteScreenProps) {
  const [invite, setInvite] = useState<CoachInvite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      if (!inviteId) {
        setError('Geen invite link gevonden');
        setIsLoading(false);
        return;
      }

      try {
        const inviteData = await getInviteById(inviteId);
        
        if (!inviteData) {
          setIsExpired(true);
          setError('Deze invite link is verlopen of niet meer geldig');
        } else {
          setInvite(inviteData);
        }
      } catch (err: any) {
        setError(err.message || 'Fout bij laden van invite');
        console.error('Error loading invite:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvite();
  }, [inviteId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.history.back();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Invite laden...</p>
        </div>
      </div>
    );
  }

  // Error or expired state
  if (!invite || isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">❌ Invite Niet Geldig</h2>
          
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg mb-6">
            <p className="text-red-700 text-sm font-semibold">
              {error || 'Deze invite link is verlopen of niet meer geldig'}
            </p>
            <p className="text-red-600 text-xs mt-2">
              {isExpired ? 'Invite links zijn 7 dagen geldig.' : ''}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Home
            </button>
            
            <p className="text-center text-gray-600 text-sm">
              Vraag je coach om je opnieuw uit te nodigen
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show invite info
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">🎉 Welkom!</h2>
        <p className="text-center text-gray-600 text-sm mb-6">Je bent uitgenodigd om coach te worden</p>

        {/* Team info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
          <p className="text-xs text-gray-600 font-semibold mb-1">⚽ Team Informatie</p>
          <p className="text-gray-900 font-bold text-lg">{invite.clubNaam}</p>
          <p className="text-gray-700 font-semibold">{invite.teamNaam}</p>
        </div>

        {/* Invite details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div>
            <p className="text-xs text-gray-600 font-semibold">👤 Uitgenodigd door</p>
            <p className="text-gray-800">{invite.invitedBy}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 font-semibold">📅 Uitnodiging datum</p>
            <p className="text-gray-800">{formatDate(invite.createdAt)}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold">⏰ Geldig tot</p>
            <p className="text-gray-800">{formatDate(invite.expiresAt)}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 mb-4">
          <p className="text-center text-sm text-gray-700 font-semibold">Kies wat je wilt doen:</p>
          
          <button
            onClick={() => onNavigate ? onNavigate('register') : window.location.href = '/register'}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all active:scale-95"
          >
            ✍️ Registreren
          </button>
          
          <button
            onClick={() => onNavigate ? onNavigate('login') : window.location.href = '/login'}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all active:scale-95"
          >
            🔓 Inloggen
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={handleBack}
          className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Annuleren
        </button>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-3 rounded-lg">
          <p className="text-blue-800 text-xs">
            <span className="font-semibold">💡 Tip:</span> Je kan je registreren met een nieuw account of inloggen met je bestaande account.
          </p>
        </div>
      </div>
    </div>
  );
}
