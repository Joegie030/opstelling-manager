import { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface Props {
  clubNaam: string;
  teamNaam: string;
  onUpdateClubNaam: (naam: string) => void;
  onUpdateTeamNaam: (naam: string) => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
}

export default function Instellingen({
  clubNaam,
  teamNaam,
  onUpdateClubNaam,
  onUpdateTeamNaam,
  onExportData,
  onImportData
}: Props) {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [bevestigingModal, setBevestigingModal] = useState<{
    open: boolean;
    type: 'import' | 'reset';
    data?: any;
  }>({ open: false, type: 'import' });

  // Export: Download JSON bestand
  const handleExport = () => {
    try {
      const exportData = {
        voetbal_spelers: localStorage.getItem('voetbal_spelers'),
        voetbal_wedstrijden: localStorage.getItem('voetbal_wedstrijden'),
        voetbal_clubNaam: localStorage.getItem('voetbal_clubNaam'),
        voetbal_teamNaam: localStorage.getItem('voetbal_teamNaam'),
        exportDatum: new Date().toISOString(),
        exportVersion: '1.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `opstelling-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setImportStatus({
        type: 'success',
        message: '✅ Backup succesvol gedownload!'
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: '❌ Fout bij exporteren'
      });
    }
  };

  // Import: Upload JSON bestand
  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Valideer dat het een correct backup bestand is
          if (!data.exportVersion || !data.voetbal_spelers) {
            throw new Error('Ongeldig backup bestand');
          }

          setBevestigingModal({
            open: true,
            type: 'import',
            data
          });
        } catch (error) {
          setImportStatus({
            type: 'error',
            message: '❌ Ongeldig JSON bestand'
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Bevestig import
  const bevestigImport = () => {
    try {
      const data = bevestigingModal.data;
      
      // Herstel alle data
      if (data.voetbal_spelers) localStorage.setItem('voetbal_spelers', data.voetbal_spelers);
      if (data.voetbal_wedstrijden) localStorage.setItem('voetbal_wedstrijden', data.voetbal_wedstrijden);
      if (data.voetbal_clubNaam) localStorage.setItem('voetbal_clubNaam', data.voetbal_clubNaam);
      if (data.voetbal_teamNaam) localStorage.setItem('voetbal_teamNaam', data.voetbal_teamNaam);

      // Trigger state update
      onImportData(data);

      setImportStatus({
        type: 'success',
        message: '✅ Data succesvol geïmporteerd! Page wordt vernieuwd...'
      });

      // Vernieuw pagina na 2 seconden
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      setBevestigingModal({ open: false, type: 'import' });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: '❌ Fout bij importeren'
      });
      setBevestigingModal({ open: false, type: 'import' });
    }
  };

  // Reset alles
  const handleResetClick = () => {
    setBevestigingModal({
      open: true,
      type: 'reset'
    });
  };

  const bevestigReset = () => {
    localStorage.clear();
    setImportStatus({
      type: 'success',
      message: '✅ Alle data gewist! Page wordt vernieuwd...'
    });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Instellingen</h2>

      {/* Club & Team Info */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          🏆 Club & Team Info
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Club Naam
          </label>
          <input
            type="text"
            value={clubNaam}
            onChange={(e) => onUpdateClubNaam(e.target.value)}
            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Bijv. VV Amsterdam"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Naam
          </label>
          <input
            type="text"
            value={teamNaam}
            onChange={(e) => onUpdateTeamNaam(e.target.value)}
            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Bijv. F1 - Oranje"
          />
        </div>
      </div>

      {/* Status berichten */}
      {importStatus.type && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          importStatus.type === 'success'
            ? 'bg-green-50 border-2 border-green-300'
            : 'bg-red-50 border-2 border-red-300'
        }`}>
          {importStatus.type === 'success' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
          <span className={importStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {importStatus.message}
          </span>
        </div>
      )}

      {/* Data Management */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          💾 Data Beheer
        </h3>

        <p className="text-sm text-gray-700">
          Export je volledige data (spelers, wedstrijden, instellingen) als backup of om op een ander apparaat in te laden.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export knop */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors shadow-md"
          >
            <Download className="w-5 h-5" />
            <span>📥 Exporteren</span>
          </button>

          {/* Import knop */}
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors shadow-md"
          >
            <Upload className="w-5 h-5" />
            <span>📤 Importeren</span>
          </button>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-200 space-y-2 text-sm">
          <p className="font-semibold text-gray-800">📋 Wat wordt geëxporteerd:</p>
          <ul className="text-gray-700 space-y-1 ml-4">
            <li>✅ Alle spelers</li>
            <li>✅ Alle wedstrijden (kwarten, wissels, doelpunten, evaluaties)</li>
            <li>✅ Club en team naam</li>
            <li>✅ Alle instellingen</li>
          </ul>
          <p className="text-gray-600 text-xs mt-2 italic">
            💡 Je kunt het bestand delen met trainers of opslaan als backup!
          </p>
        </div>
      </div>

      {/* Gevaarlijke acties */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          ⚠️ Gevaarlijke Acties
        </h3>

        <button
          onClick={handleResetClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors shadow-md"
        >
          <Trash2 className="w-5 h-5" />
          <span>🗑️ Wis alles</span>
        </button>

        <div className="bg-white rounded-lg p-3 border border-red-200">
          <p className="text-sm text-red-800 font-semibold">
            ⚠️ Dit kan niet ongedaan gemaakt worden!
          </p>
          <p className="text-xs text-red-700 mt-1">
            Alle spelers, wedstrijden en instellingen worden verwijderd.
          </p>
        </div>
      </div>

      {/* Info sectie */}
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 sm:p-6 space-y-3">
        <h3 className="text-lg font-bold">ℹ️ Info</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Versie:</strong> 1.0
          </p>
          <p>
            <strong>Opslag:</strong> Lokale browser storage (geen internet nodig)
          </p>
          <p>
            <strong>Backup:</strong> Download regelmatig een backup!
          </p>
        </div>
      </div>

      {/* Bevestigingsmodal */}
      {bevestigingModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full">
            <div className={`p-6 ${
              bevestigingModal.type === 'import'
                ? 'bg-blue-100 border-b-4 border-blue-500'
                : 'bg-red-100 border-b-4 border-red-500'
            }`}>
              <h3 className="text-xl font-bold">
                {bevestigingModal.type === 'import' 
                  ? '📤 Data Importeren?' 
                  : '🗑️ Alles Wissen?'
                }
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                {bevestigingModal.type === 'import'
                  ? 'Je huidige data wordt vervangen met de geïmporteerde data. Dit kan niet ongedaan gemaakt worden.'
                  : 'Alle spelers, wedstrijden en instellingen worden permanent verwijderd.'
                }
              </p>

              {bevestigingModal.type === 'import' && bevestigingModal.data && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">📅 Backup info:</p>
                  <p className="text-blue-800">
                    Geëxporteerd: {new Date(bevestigingModal.data.exportDatum).toLocaleString('nl-NL')}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setBevestigingModal({ open: false, type: 'import' })}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={bevestigingModal.type === 'import' ? bevestigImport : bevestigReset}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                  bevestigingModal.type === 'import'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {bevestigingModal.type === 'import' ? 'Importeren' : 'Wissen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
