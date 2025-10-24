import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Seizoen } from '../types';
import {
  getSeizoenen,
  addSeizoenen,
  updateSeizouen,  // ← NOTE: De functie in firebaseService heet updateSeizouen (typo in original)
  deleteSeizouen
} from '../firebase/firebaseService';

interface SeizoenenBeheerProps {
  teamId: string;
  seizoenen: Seizoen[];
  selectedSeizoenId: string | null;
  onSeizoenChange: (seizoenId: string) => void;
  onSeizoenUpdate: () => void;
}

function SeizoenenBeheer({
  teamId,
  seizoenen,
  selectedSeizoenId,
  onSeizoenChange,
  onSeizoenUpdate
}: SeizoenenBeheerProps) {
  const [showNieuwSeizoenModal, setShowNieuwSeizoenModal] = useState(false);
  const [editingSeizoenId, setEditingSeizoenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state voor nieuw seizoen
  const [formState, setFormState] = useState({
    naam: '',
    startDatum: new Date().toISOString().split('T')[0],
    eindDatum: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'actief' as 'actief' | 'gearchiveerd'
  });

  // Reset form
  const resetForm = () => {
    setFormState({
      naam: '',
      startDatum: new Date().toISOString().split('T')[0],
      eindDatum: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'actief'
    });
    setEditingSeizoenId(null);
  };

  // Load seizoen data voor bewerken
  const loadSeizoenForEdit = (seizoen: Seizoen) => {
    setFormState({
      naam: seizoen.naam,
      startDatum: seizoen.startDatum,
      eindDatum: seizoen.eindDatum,
      status: seizoen.status
    });
    setEditingSeizoenId(seizoen.seizoenId);
    setShowNieuwSeizoenModal(true);
  };

  // Voeg nieuw seizoen toe of update bestaand
  const handleSaveSeizoen = async () => {
    if (!formState.naam || !formState.startDatum || !formState.eindDatum) {
      alert('Vul alle velden in');
      return;
    }

    if (new Date(formState.startDatum) > new Date(formState.eindDatum)) {
      alert('Startdatum moet voor einddatum liggen');
      return;
    }

    try {
      setLoading(true);

      if (editingSeizoenId) {
        // Update bestaand seizoen
        const seizoen = seizoenen.find(s => s.seizoenId === editingSeizoenId);
        if (seizoen) {
          await updateSeizouen(teamId, editingSeizoenId, {
            naam: formState.naam,
            startDatum: formState.startDatum,
            eindDatum: formState.eindDatum,
            status: formState.status
          });
          console.log('✅ Seizoen bijgewerkt:', formState.naam);
        }
      } else {
        // Voeg nieuw seizoen toe
        const newSeizoen: Seizoen = {
          seizoenId: `seizoen_${Date.now()}`,
          naam: formState.naam,
          startDatum: formState.startDatum,
          eindDatum: formState.eindDatum,
          status: formState.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await addSeizoenen(teamId, newSeizoen);
        console.log('✅ Seizoen aangemaakt:', formState.naam);
      }

      // Refresh seizoenen list
      onSeizoenUpdate();
      resetForm();
      setShowNieuwSeizoenModal(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving seizoen:', error);
      alert('Fout bij opslaan seizoen');
      setLoading(false);
    }
  };

  // Verwijder seizoen
  const handleDeleteSeizoen = async (seizoenId: string) => {
    if (!confirm('Weet je zeker dat je dit seizoen wilt verwijderen? Alle wedstrijden in dit seizoen worden ook verwijderd!')) {
      return;
    }

    try {
      setLoading(true);
      await deleteSeizouen(teamId, seizoenId);
      console.log('✅ Seizoen verwijderd');
      onSeizoenUpdate();
      setLoading(false);
    } catch (error) {
      console.error('Error deleting seizoen:', error);
      alert('Fout bij verwijderen seizoen');
      setLoading(false);
    }
  };

  // Toggle seizoen status (actief/gearchiveerd)
  const handleToggleStatus = async (seizoenId: string, currentStatus: 'actief' | 'gearchiveerd') => {
    const seizoen = seizoenen.find(s => s.seizoenId === seizoenId);
    if (!seizoen) return;

    try {
      setLoading(true);
      const newStatus = currentStatus === 'actief' ? 'gearchiveerd' : 'actief';
      
      await updateSeizouen(teamId, seizoenId, {
        status: newStatus
      });

      console.log(`✅ Seizoen status gewijzigd naar: ${newStatus}`);
      onSeizoenUpdate();
      setLoading(false);
    } catch (error) {
      console.error('Error updating seizoen status:', error);
      alert('Fout bij wijzigen status');
      setLoading(false);
    }
  };

  // Format datum voor display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Bereken aantal weken in seizoen
  const calculateWeeks = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      return diffWeeks;
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Seizoen Beheer</h1>
        <p className="text-gray-600">Beheer seizoenen en selecteer welk seizoen je wilt gebruiken</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Tip:</p>
          <p className="text-sm text-blue-800">
            Maak meerdere seizoenen aan (bv. 2024/2025 en 2025/2026). Wedstrijden worden opgeslagen per seizoen.
          </p>
        </div>
      </div>

      {/* Nieuwe Seizoen Button */}
      <button
        onClick={() => {
          resetForm();
          setShowNieuwSeizoenModal(true);
        }}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        <Plus className="w-5 h-5" />
        Nieuw Seizoen
      </button>

      {/* Seizoenen Grid */}
      {seizoenen.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Geen seizoenen gevonden</p>
          <p className="text-gray-400 text-sm">Maak je eerste seizoen aan om te beginnen</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seizoenen.map((seizoen) => (
            <div
              key={seizoen.seizoenId}
              className={`rounded-lg border-2 p-6 transition-all cursor-pointer ${
                selectedSeizoenId === seizoen.seizoenId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onSeizoenChange(seizoen.seizoenId)}
            >
              {/* Header met status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{seizoen.naam}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {seizoen.status === 'actief' ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">ACTIEF</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-400">GEARCHIVEERD</span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedSeizoenId === seizoen.seizoenId && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>

              {/* Datums */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-semibold text-gray-800">{formatDate(seizoen.startDatum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Eind:</span>
                  <span className="font-semibold text-gray-800">{formatDate(seizoen.eindDatum)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Duur:</span>
                  <span className="font-semibold text-blue-600">
                    {calculateWeeks(seizoen.startDatum, seizoen.eindDatum)} weken
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSeizoenForEdit(seizoen);
                  }}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Bewerk
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(seizoen.seizoenId, seizoen.status);
                  }}
                  disabled={loading}
                  className={`flex-1 px-3 py-2 rounded transition-colors text-sm font-semibold ${
                    seizoen.status === 'actief'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-50`}
                >
                  {seizoen.status === 'actief' ? 'Archiveer' : 'Activeer'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSeizoen(seizoen.seizoenId);
                  }}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Verwijder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Nieuw/Bewerk Seizoen */}
      {showNieuwSeizoenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingSeizoenId ? 'Seizoen Bewerken' : 'Nieuw Seizoen'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingSeizoenId ? 'Pas de seizoengegevens aan' : 'Maak een nieuw seizoen aan'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Naam */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seizoen Naam
                </label>
                <input
                  type="text"
                  value={formState.naam}
                  onChange={(e) => setFormState({ ...formState, naam: e.target.value })}
                  placeholder="bv. 2024/2025"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Bijvoorbeeld: 2024/2025 of Herfst 2024</p>
              </div>

              {/* Start Datum */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Datum
                </label>
                <input
                  type="date"
                  value={formState.startDatum}
                  onChange={(e) => setFormState({ ...formState, startDatum: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Eind Datum */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Eind Datum
                </label>
                <input
                  type="date"
                  value={formState.eindDatum}
                  onChange={(e) => setFormState({ ...formState, eindDatum: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formState.status === 'actief'}
                      onChange={() => setFormState({ ...formState, status: 'actief' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Actief</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formState.status === 'gearchiveerd'}
                      onChange={() => setFormState({ ...formState, status: 'gearchiveerd' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Gearchiveerd</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Actieve seizoenen worden standaard geselecteerd. Gearchiveerde seizoenen zijn ter archivering.
                </p>
              </div>

              {/* Duration Info */}
              {formState.startDatum && formState.eindDatum && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm">
                    <span className="font-semibold text-blue-900">Duur:</span>{' '}
                    <span className="text-blue-800">
                      {calculateWeeks(formState.startDatum, formState.eindDatum)} weken
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-2 border-t border-gray-200 pt-6">
              <button
                onClick={() => {
                  resetForm();
                  setShowNieuwSeizoenModal(false);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
              >
                Annuleer
              </button>
              <button
                onClick={handleSaveSeizoen}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
              >
                {loading ? 'Opslaan...' : editingSeizoenId ? 'Bijwerken' : 'Aanmaken'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeizoenenBeheer;
