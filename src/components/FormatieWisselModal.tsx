import React from 'react';
import { X } from 'lucide-react';

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

  const getFormatieNaam = (formatie: string): string => {
    const namen: Record<string, string> = {
      '6x6-vliegtuig': '✈️ 6x6 Vliegtuig',
      '6x6-dobbelsteen': '🎲 6x6 Dobbelsteen',
    };
    return namen[formatie] || formatie;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      {/* ✨ RESPONSIVE: max-h-[90vh] allows scrolling on mobile */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b-2 border-green-400 p-4 flex items-center justify-between">
          <h2 className="font-bold text-lg text-green-900">Formatie wijzigen?</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-4">
          
          {/* FORMATIE INFO */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium mb-2">Je wisselt van formatie variant:</p>
            <div className="flex items-center gap-2 justify-center text-base sm:text-lg font-bold text-blue-700">
              <span>{getFormatieNaam(vanFormatie)}</span>
              <span className="text-gray-600">→</span>
              <span>{getFormatieNaam(naarFormatie)}</span>
            </div>
          </div>

          {/* OPTIES */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Hoe wil je de opstelling aanpassen?
            </p>

            {/* OPTIE 1: SMART-MAP */}
            <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-green-400 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors">
              <input
                type="radio"
                name="strategie"
                value="smartmap"
                defaultChecked
                className="mt-1 w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold text-green-900">Smart-map spelers</div>
                <div className="text-xs text-green-700 mt-1 space-y-1">
                  <p>Spelers worden intelligent herpositioneerd:</p>
                  <ul className="list-disc list-inside ml-1 space-y-0.5">
                    <li>Keeper blijft Keeper</li>
                    <li>Verdedigers naar vergelijkbare posities</li>
                    <li>Aanvallers aanpassen aan formatie</li>
                  </ul>
                </div>
              </div>
            </label>

            {/* OPTIE 2: RESET */}
            <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-orange-400 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors">
              <input
                type="radio"
                name="strategie"
                value="reset"
                className="mt-1 w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold text-orange-900">Reset (behave Keeper)</div>
                <div className="text-xs text-orange-700 mt-1 space-y-1">
                  <p>Alleen keeper blijft staan, rest leeg:</p>
                  <ul className="list-disc list-inside ml-1 space-y-0.5">
                    <li>Keeper behouden</li>
                    <li>Veldspelers leegmaken</li>
                    <li>Sneller opnieuw instellen</li>
                  </ul>
                </div>
              </div>
            </label>
          </div>

          {/* WARNING */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">⚠️ Let op:</span> Wissels en doelpunten blijven behouden. Alleen de opstelling wordt aangepast.
            </p>
          </div>

        </div>

        {/* FOOTER - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-300 p-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors text-sm"
          >
            Afbreken
          </button>
          <button
            onClick={() => {
              const form = document.querySelector('input[name="strategie"]:checked') as HTMLInputElement;
              const strategie = form?.value as 'smartmap' | 'reset';
              onConfirm(strategie || 'smartmap');
            }}
            className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors text-sm"
          >
            Bevestigen
          </button>
        </div>

      </div>
    </div>
  );
}
