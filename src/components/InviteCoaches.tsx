import { useState, useEffect } from 'react';
import { Plus, Mail, Users, CheckCircle, Loader, AlertCircle, X } from 'lucide-react';
import { inviteCoach, getTeam, Coach } from '../firebase/firebaseService';

interface Props {
  teamId: string;
  currentCoach: Coach;
}

export default function InviteCoaches({ teamId, currentCoach }: Props) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [teamCoaches, setTeamCoaches] = useState<number>(0);

  useEffect(() => {
    loadTeamCoaches();
  }, [teamId]);

  const loadTeamCoaches = async () => {
    const team = await getTeam(teamId);
    if (team) {
      setTeamCoaches(team.coaches?.length || 0);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (!inviteEmail.trim()) {
        setMessage({ type: 'error', text: 'Voer een email adres in' });
        setLoading(false);
        return;
      }

      if (!inviteEmail.includes('@')) {
        setMessage({ type: 'error', text: 'Ongeldig email adres' });
        setLoading(false);
        return;
      }

      await inviteCoach(teamId, inviteEmail, currentCoach.uid);
      setMessage({ 
        type: 'success', 
        text: `Uitnodiging verstuurd naar ${inviteEmail}` 
      });
      setInviteEmail('');
      await loadTeamCoaches();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Fout bij verzenden uitnodiging' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-800">👥 Coaches beheren</h3>
        <span className="ml-auto px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">
          {teamCoaches}
        </span>
      </div>

      <p className="text-sm text-gray-700">
        Nodig andere coaches uit om samen je team in te delen en wedstrijden in te voeren.
      </p>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border-2 border-green-300'
            : 'bg-red-50 border-2 border-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          )}
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email van coach"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {!loading && <Plus className="w-5 h-5" />}
            Uitnodigen
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-white rounded-lg p-3 border border-purple-200 space-y-2 text-sm">
        <p className="font-semibold text-gray-800">📧 Hoe werkt het?</p>
        <ul className="text-gray-700 space-y-1 ml-4">
          <li>✓ Voer email van coach in</li>
          <li>✓ Coach krijgt uitnodiging (mag zelf registreren)</li>
          <li>✓ Coach accepteert en hoort bij team</li>
          <li>✓ Alles is real-time gesynchroniseerd</li>
        </ul>
      </div>
    </div>
  );
}
