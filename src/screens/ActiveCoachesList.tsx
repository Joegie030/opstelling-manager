import { useState } from 'react';
import { Trash2, Loader, Shield } from 'lucide-react';
import { Coach } from '../firebase/firebaseService';

interface ActiveCoachesListProps {
  coaches: Coach[];
  currentCoach: Coach;
  onRemove: (coachUid: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ActiveCoachesList({
  coaches,
  currentCoach,
  onRemove,
  isLoading = false
}: ActiveCoachesListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const getRolLabel = (rol: string): string => {
    switch (rol) {
      case 'admin':
        return '👑 Admin';
      case 'coach':
        return '🏆 Coach';
      case 'viewer':
        return '👁️ Viewer';
      default:
        return rol;
    }
  };

  const handleRemove = async (coachUid: string) => {
    // Prevent self-removal
    if (coachUid === currentCoach.uid) {
      setError('Je kan jezelf niet uit het team verwijderen');
      return;
    }

    // Confirm removal
    const coachToRemove = coaches.find(c => c.uid === coachUid);
    if (!window.confirm(`Weet je zeker dat je ${coachToRemove?.naam || 'deze coach'} wilt verwijderen?`)) {
      return;
    }

    setRemovingId(coachUid);
    setError('');

    try {
      await onRemove(coachUid);
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen coach');
      console.error('Error removing coach:', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Actieve Coaches</h3>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Laden...</span>
        </div>
      </div>
    );
  }

  if (coaches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Actieve Coaches</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Geen actieve coaches in dit team</p>
          <p className="text-gray-500 text-sm">Nodig een coach uit via het formulier hierboven</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Actieve Coaches ({coaches.length})</h3>

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
              <th className="text-left py-3 px-3 font-semibold text-gray-700">👤 Naam</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">📧 Email</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">🎯 Rol</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">🔧 Acties</th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((coach) => {
              const isCurrentCoach = coach.uid === currentCoach.uid;
              
              return (
                <tr key={coach.uid} className={`border-b border-gray-200 ${isCurrentCoach ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <td className="py-3 px-3 text-gray-800 font-semibold">
                    {isCurrentCoach && <span className="text-blue-600 mr-2">✓</span>}
                    {coach.naam}
                  </td>
                  <td className="py-3 px-3 text-gray-600 text-xs">{coach.email}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      <Shield className="w-3 h-3" />
                      {getRolLabel(coach.rol)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isCurrentCoach ? (
                      <span className="inline-flex items-center gap-1 text-gray-600 text-xs font-semibold">
                        <span>Dit ben jij</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRemove(coach.uid)}
                        disabled={removingId === coach.uid}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all inline-flex items-center gap-1 ${
                          removingId === coach.uid
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                        }`}
                      >
                        {removingId === coach.uid ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Bezig...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Verwijder</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {coaches.map((coach) => {
          const isCurrentCoach = coach.uid === currentCoach.uid;
          
          return (
            <div
              key={coach.uid}
              className={`rounded-lg p-4 border-2 ${isCurrentCoach ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800">
                    {isCurrentCoach && <span className="text-blue-600 mr-2">✓</span>}
                    {coach.naam}
                  </p>
                  {isCurrentCoach && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                      Dit ben jij
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{coach.email}</p>
              </div>

              <div className="mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  <Shield className="w-3 h-3" />
                  {getRolLabel(coach.rol)}
                </span>
              </div>

              {!isCurrentCoach && (
                <button
                  onClick={() => handleRemove(coach.uid)}
                  disabled={removingId === coach.uid}
                  className={`w-full px-3 py-2 rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                    removingId === coach.uid
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                  }`}
                >
                  {removingId === coach.uid ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Bezig...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Verwijder</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
