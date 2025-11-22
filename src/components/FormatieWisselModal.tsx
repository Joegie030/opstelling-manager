import { X } from 'lucide-react';
import { getFormatieNaam } from '../utils/formatters';

interface FormatieWisselModalProps {
  isOpen: boolean;
  vanFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen';
  naarFormatie: '6x6-vliegtuig' | '6x6-dobbelsteen';
  onConfirm: (strategie: 'smartmap' | 'reset') => void;
  onCancel: () => void;
}

export function FormatieWisselModal({
  isOpen,
  vanFormatie,
  naarFormatie,
  onConfirm,
  onCancel
}: FormatieWisselModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-green-300 bg-green-50 p-4">
            <h2 className="text-lg font-bold text-green-900">Formatie wijzigen?</h2>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-green-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-green-700" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                Je wisselt van formatie variant:
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {getFormatieNaam(vanFormatie)}
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-sm font-semibold text-gray-900">
                  {getFormatieNaam(naarFormatie)}
                </span>
              </div>
            </div>

            {/* Question */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-4">
                Hoe wil je de opstelling aanpassen?
              </p>

              {/* Option 1: Smart Map */}
              <label className="flex items-start gap-3 p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 cursor-pointer mb-3 transition-colors">
                <input
                  type="radio"
                  name="strategie"
                  value="smartmap"
                  defaultChecked
                  className="mt-1 w-4 h-4 text-green-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">
                    🎯 Smart-map spelers
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Spelers worden intelligent herpositioneerd:
                  </p>
                  <ul className="text-xs text-gray-600 mt-2 ml-3 space-y-1">
                    <li>• Keeper blijft Keeper</li>
                    <li>• Verdedigers naar vergelijkbare posities</li>
                    <li>• Aanvallers aanpassen aan formatie</li>
                  </ul>
                </div>
              </label>

              {/* Option 2: Reset */}
              <label className="flex items-start gap-3 p-4 border-2 border-orange-300 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="strategie"
                  value="reset"
                  className="mt-1 w-4 h-4 text-orange-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">
                    🔄 Reset (behalve Keeper)
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Alleen Keeper blijft staan, alle veldspelers leegmaken
                  </p>
                  <ul className="text-xs text-gray-600 mt-2 ml-3 space-y-1">
                    <li>• Keeper: behouden</li>
                    <li>• Veldspelers: legen</li>
                    <li>• Sneller opnieuw instellen</li>
                  </ul>
                </div>
              </label>
            </div>

            {/* Note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <p className="text-xs text-yellow-800">
                💡 <strong>Let op:</strong> Wissels en doelpunten blijven behouden. Alleen de opstelling wordt aangepast.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t-2 border-gray-200 bg-gray-50">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Afbreken
            </button>
            <button
              onClick={() => {
                const strategie = (document.querySelector('input[name="strategie"]:checked') as HTMLInputElement)?.value as 'smartmap' | 'reset';
                onConfirm(strategie || 'smartmap');
              }}
              className="flex-1 px-4 py-2 text-white bg-green-500 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Bevestigen
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
