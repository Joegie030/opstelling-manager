import { useState } from 'react';
import QRCode from 'qrcode.react';
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
  const [inviteId, setInviteId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQR, setCopiedQR] = useState(false);

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
      
      setInviteId(newInviteId);
      setInviteLink(link);
      setSuccess(true);
      setEmail('');
      
      if (onInviteSent) {
        onInviteSent();
      }

      // Auto-hide success after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Fout bij aanmaken invite');
      console.error('Error creating invite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'link' | 'qr') => {
    navigator.clipboard.writeText(text);
    
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedQR(true);
      setTimeout(() => setCopiedQR(false), 2000);
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `invite-${teamNaam}.png`;
      link.click();
    }
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
            💡 De uitnodiging is 7 dagen geldig. Stuur de link of QR code naar de coach.
          </p>
        </div>
      </form>

      {/* Success state - Show invite link and QR code */}
      {success && inviteLink && (
        <div className="space-y-6 bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-green-700 font-semibold mb-2">✅ Invite succesvol aangemaakt!</p>
            <p className="text-green-600 text-sm">Deel deze link of QR code met de coach</p>
          </div>

          {/* Invite link section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Invite Link:</label>
            <div className="flex gap-2 bg-white p-3 rounded-lg border-2 border-green-200">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
              />
              <button
                onClick={() => copyToClipboard(inviteLink, 'link')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* QR code section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">QR Code:</label>
            <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-lg border-2 border-green-200">
              <QRCode
                value={inviteLink}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => copyToClipboard(inviteLink, 'qr')}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  {copiedQR ? (
                    <>
                      <Check className="w-4 h-4" /> Gekopieerd!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopieer Link
                    </>
                  )}
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-all"
                >
                  📥 Download QR
                </button>
              </div>
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
