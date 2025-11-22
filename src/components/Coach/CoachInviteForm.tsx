import { useState } from 'react';
import { Copy, Check, Loader } from 'lucide-react';
import { inviteCoach, Coach } from '../../firebase/firebaseService';

interface CoachInviteFormProps {
  teamId: string;
  teamNaam: string;
  clubNaam: string;
  currentCoach: Coach;
  onInviteSent?: () => void;
}

export default function CoachInviteForm({
  teamId,
  teamNaam,
  clubNaam,
  currentCoach,
  onInviteSent
}: CoachInviteFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Voer een email in');
      return;
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Voer een geldig email adres in');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const newInviteId = await inviteCoach(teamId, email, currentCoach.uid);
      const link = `${window.location.origin}/accept-invite/${newInviteId}`;
      
      setInviteLink(link);
      setSuccess(true);
      setEmail('');
      
      if (onInviteSent) {
        onInviteSent();
      }

      // Auto-hide success after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 300000);
    } catch (err: any) {
      setError(err.message || 'Fout bij aanmaken invite');
      console.error('Error creating invite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📧 Nodig een Coach Uit</h3>

      {/* Form */}
      <form onSubmit={handleInvite} className="space-y-4 mb-6">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="coach@example.com"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              isLoading || !email.trim()
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Bezig...
              </span>
            ) : (
              'Uitnodigen'
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
            <p className="text-red-700 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Info message */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
          <p className="text-blue-700 text-sm">
            💡 De uitnodiging is 7 dagen geldig. Stuur de link naar de coach.
          </p>
        </div>
      </form>

      {/* Success state - Show invite link */}
      {success && inviteLink && (
        <div className="space-y-4 bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-green-700 font-semibold mb-2">✅ Invite succesvol aangemaakt!</p>
            <p className="text-green-600 text-sm">Deel deze link met de coach</p>
          </div>

          {/* Invite link section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Invite Link:</label>
            <div className="flex gap-2 bg-white p-3 rounded-lg border-2 border-green-200">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none overflow-hidden"
              />
              <button
                onClick={() => copyToClipboard(inviteLink)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all whitespace-nowrap"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-green-100 border-l-4 border-green-600 p-3 rounded">
            <p className="text-green-700 text-sm font-semibold">Team Info:</p>
            <p className="text-green-600 text-sm">
              Coach: {clubNaam} - {teamNaam}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
