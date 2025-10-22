import { ChevronDown, ChevronUp, Zap, Users, BarChart3, Calendar, Settings, Info } from 'lucide-react';
import { useState } from 'react';

export default function Help() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <svg width="48" height="48" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="60" width="420" height="360" rx="40" stroke="#003d82" strokeWidth="50" fill="white"/>
            <line x1="240" y1="60" x2="240" y2="420" stroke="#003d82" strokeWidth="20"/>
            <path d="M 120 180 Q 240 240 360 120" stroke="#003d82" strokeWidth="20" fill="none" strokeLinecap="round"/>
            <circle cx="120" cy="120" r="20" fill="#003d82"/>
            <circle cx="120" cy="120" r="12" fill="#5ec969"/>
            <circle cx="120" cy="300" r="20" fill="#003d82"/>
            <circle cx="120" cy="300" r="12" fill="#5ec969"/>
            <circle cx="240" cy="240" r="20" fill="#003d82"/>
            <circle cx="240" cy="240" r="12" fill="white"/>
            <circle cx="360" cy="120" r="20" fill="#003d82"/>
            <circle cx="360" cy="120" r="12" fill="#5ec969"/>
            <circle cx="360" cy="300" r="20" fill="#003d82"/>
            <circle cx="360" cy="300" r="12" fill="#5ec969"/>
          </svg>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Joegie</h1>
            <p className="text-sm text-gray-600">Formation Manager</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">Leer hoe je Joegie gebruikt voor jouw sport</p>
      </div>

      {/* GETTING STARTED */}
      <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-blue-50">
        <button
          onClick={() => toggleSection('getting-started')}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-blue-100 transition-colors bg-blue-100 font-semibold text-sm sm:text-base text-blue-900"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <span>🚀 Getting Started</span>
          </div>
          {expandedSection === 'getting-started' ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSection === 'getting-started' && (
          <div className="px-4 sm:px-6 py-4 space-y-4 bg-white">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">1. Wedstrijden aanmaken</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ga naar het "Wedstrijden" tabblad en klik op "Nieuwe Wedstrijd". Vul de datum, tegenstander, formatie en wedstrijdtype in. Je kunt kiezen tussen <strong>Competitie</strong> of <strong>Oefenwedstrijd</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">2. Opstelling samenstellen</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Klik op "Bekijk" om een wedstrijd in te zien. Het scherm toont alle 4 kwarten. Per kwart kun je:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
                <li>• Spelers op posities zetten op het veld</li>
                <li>• Wissels toevoegen (wie eruit, wie erin)</li>
                <li>• Doelpunten registreren</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">3. Team beheren</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                In het "Team" tabblad kun je:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
                <li>• Vaste spelers toevoegen</li>
                <li>• Gastspelers invoegenvan andere teams</li>
                <li>• Club- en teamnaam aanpassen</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">4. Statistieken bekijken</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Het "Statistieken" tabblad toont:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
                <li>• Doelpunten per speler</li>
                <li>• Speeltijd per speler</li>
                <li>• Team prestaties en winst%</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-700">
                💡 <strong>Tip:</strong> Je data wordt automatisch opgeslagen in de cloud. Je kunt altijd je wedstrijden bekijken en aanpassen.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FEATURES */}
      <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-green-50">
        <button
          onClick={() => toggleSection('features')}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-green-100 transition-colors bg-green-100 font-semibold text-sm sm:text-base text-green-900"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <span>✨ Functies</span>
          </div>
          {expandedSection === 'features' ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSection === 'features' && (
          <div className="px-4 sm:px-6 py-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Wedstrijdbeheer</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Maak wedstrijden aan met alle details: datum, tegenstander, formatie en type (competitie/oefening).
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Opstellingen</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Stel 4 kwarten samen met spelers op posities. Voeg wissels in na 6.25 minuten per kwart.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Statistieken</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Volg speeltijden, doelpunten, keeper-beurten en team prestaties per wedstrijd.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-800">Team & Spelers</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Beheer vaste spelers en gastspelers. Zet ze in op meerdere posities.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-800">Kopieën</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Kopieer eerdere wedstrijden als template voor nieuwe wedstrijden (sneller invoeren).
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-800">Cloud Sync</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Je data wordt automatisch opgeslagen en gesynchroniseerd in de cloud.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-green-700">
                🎯 <strong>Formaties:</strong> Kies uit 6x6 Vliegtuig, 6x6 Dobbelsteen of 8x8 opstelling.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* VERSION INFO */}
      <div className="border-2 border-purple-300 rounded-lg overflow-hidden bg-purple-50">
        <button
          onClick={() => toggleSection('version')}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-purple-100 transition-colors bg-purple-100 font-semibold text-sm sm:text-base text-purple-900"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5" />
            <span>ℹ️ Over deze app</span>
          </div>
          {expandedSection === 'version' ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSection === 'version' && (
          <div className="px-4 sm:px-6 py-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">APP NAAM</p>
                <p className="text-lg font-bold text-gray-800">Joegie - Formation Manager</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold">VERSIE</p>
                <p className="text-lg font-bold text-gray-800">v1.0.0</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold">RELEASE DATUM</p>
                <p className="text-lg font-bold text-gray-800">Oktober 2025</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold">STATUS</p>
                <p className="text-lg font-bold text-green-600">✓ Live</p>
              </div>
            </div>

            <div className="border-t border-purple-200 pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Wat is er nieuw?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Wedstrijdtype (Competitie / Oefenwedstrijd)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Filter op wedstrijdtype in overzicht</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Compacte wedstrijdkaarten op mobiel</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Moderner user menu in header</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Cloud synchronisatie</span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-purple-700">
                📧 <strong>Feedback?</strong> We horen graag wat je ervan vindt! Deze app is gemaakt om coaches te helpen opstellingen efficiënt in te regelen.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2">🙌 Over Joegie</p>
              <p className="text-xs text-gray-600">
                Joegie maakt het eenvoudig voor coaches om opstellingen in te regelen in voetbal, hockey, handball en andere sporten. Bespaar tijd op administratie, meer tijd voor coaching.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TIPS & TRICKS */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• <strong>Snelle invoer:</strong> Kopieer vorige wedstrijden - aanpassen is sneller dan van nul beginnen</li>
              <li>• <strong>Afwezige spelers:</strong> Markeer ze van tevoren - ze verschijnen niet meer in selecties</li>
              <li>• <strong>Wissels timing:</strong> Wissels worden automatisch berekend na 6.25 minuten per kwart</li>
              <li>• <strong>Statistieken:</strong> Check regelmatig de stats om speeltijd eerlijk te verdelen</li>
              <li>• <strong>Filter:</strong> Gebruik het filter om alleen competitiewedstrijden of oefeningen te zien</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
