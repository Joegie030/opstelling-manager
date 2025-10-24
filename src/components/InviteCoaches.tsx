import { useState } from 'react';
import { Plus, Trash2, Mail, Shield, Eye } from 'lucide-react';

interface InviteCoachesProps {
  teamId: string;
  currentCoach?: any;
}

export default function InviteCoaches({ teamId, currentCoach }: InviteCoachesProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // TODO: Get team data om coaches te tonen
  // const [teamCoaches, setTeamCoaches] = useState<string[]>([]);

  const handleInviteCoach = async () => {
    if (!inviteEmail.trim()) {
      alert('Voer een email in');
      return;
    }

    try {
      setIsInviting(true);
      // TODO: Call inviteCoach from firebaseService
      console.log('📧 Inviting coach:', inviteEmail);
      
      alert('✅ Uitnodiging verzonden naar ' + inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting coach:', error);
      alert('❌ Fout bij uitnodigen: ' + error);
    } finally {
      setIsInviting(false);
    }
  };

  // ⚠️ ROLE GUIDE
  const roleDescriptions = {
    admin: {
      icon: <Shield className="w-4 h-4" />,
      label: 'Admin',
      description: 'Volledig beheer - Teams, spelers, wedstrijden, statistieken'
    },
    coach: {
      icon: <Mail className="w-4 h-4" />,
      label: 'Coach',
      description: 'Beheer wedstrijden, opstelling, scores'
    },
    viewer: {
      icon: <Eye className="w-4 h-4" />,
      label: 'Viewer',
      description: 'Alleen lezen - Statistieken en data bekijken'
    }
  };

  return (
    <div className="border-2 border-purple-400 rounded-lg p-6 bg-purple-50">
      <h2 className="text-2xl font-bold mb-4">👥 Coaches Beheren</h2>

      {/* ROLE GUIDE INFO */}
      <div className="mb-6 p-4 bg-white rounded-lg border-2 border-purple-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">📋 Coach Rollen in Joegie:</p>
        <div className="space-y-2">
          {Object.entries(roleDescriptions).map(([key, role]) => (
            <div key={key} className="flex items-start gap-3 text-sm">
              <div className="text-purple-600 mt-0.5">{role.icon}</div>
              <div>
                <p className="font-semibold text-gray-800">{role.label}</p>
                <p className="text-gray-600">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TODO: SHOW CURRENT TEAM COACHES */}
      <div className="mb-6 p-4 bg-white rounded-lg border-2 border-purple-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">🔐 Huidge Coaches:</p>
        <div className="space-y-2">
          {/* PLACEHOLDER - TODO: Load from team data */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <p className="font-semibold text-gray-800">{currentCoach?.email || 'Coach'}</p>
              <p className="text-xs text-gray-600">Rol: Admin (Jij) 👑</p>
            </div>
            <div className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded font-semibold">
              JIJZELF
            </div>
          </div>
          
          {/* TODO: Map through other coaches */}
          <p className="text-xs text-gray-500 italic mt-2">
            💡 Voeg meer coaches toe met de "+ Coach Uitnodigen" knop
          </p>
        </div>
      </div>

      {/* INVITE COACH BUTTON */}
      <button
        onClick={() => setShowInviteModal(true)}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Coach Uitnodigen
      </button>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-purple-50 border-b-2 border-purple-300 p-6">
              <h3 className="text-2xl font-bold text-purple-800">📧 Coach Uitnodigen</h3>
              <p className="text-sm text-purple-600 mt-2">Nodig een coach uit voor dit team</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Coach</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="coach@example.com"
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
                <p>✉️ De coach ontvangt een email met de uitnodiging.</p>
                <p className="text-xs mt-1">Ze kunnen deze aanvaarden en je team beheren.</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex gap-2">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                }}
                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-bold transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleInviteCoach}
                disabled={isInviting}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold transition-colors disabled:opacity-50"
              >
                {isInviting ? '⏳ Verzenden...' : '✉️ Uitnodigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
