"use client";

import { useState, useEffect } from "react";
import { X, Settings, Shield, BarChart3, User } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  functionality: boolean;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Toujours activé
    performance: false,
    functionality: false
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      performance: true,
      functionality: true
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      performance: false,
      functionality: false
    };
    savePreferences(onlyEssential);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Appliquer les préférences
    applyCookiePreferences(prefs);
    
    setIsVisible(false);
    setShowDetails(false);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Cookies essentiels - toujours activés
    if (prefs.essential) {
      // Activer les cookies essentiels
      console.log('Cookies essentiels activés');
    }

    // Cookies de performance
    if (prefs.performance) {
      // Activer Google Analytics et autres outils de mesure
      console.log('Cookies de performance activés');
      // Ici vous pouvez initialiser Google Analytics, etc.
    } else {
      // Désactiver les cookies de performance
      console.log('Cookies de performance désactivés');
    }

    // Cookies de fonctionnalité
    if (prefs.functionality) {
      // Activer les préférences utilisateur, favoris, etc.
      console.log('Cookies de fonctionnalité activés');
    } else {
      // Désactiver les cookies de fonctionnalité
      console.log('Cookies de fonctionnalité désactivés');
    }
  };

  const togglePreference = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Les cookies essentiels ne peuvent pas être désactivés
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Gestion des cookies</h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!showDetails ? (
            // Vue simple
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nous utilisons des cookies
                </h3>
                <p className="text-gray-600">
                  Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
                  analyser le trafic et personnaliser le contenu. Vous pouvez choisir quels 
                  cookies accepter.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">ℹ️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Respect de votre vie privée</h4>
                    <p className="text-blue-800 text-sm">
                      Les cookies essentiels sont nécessaires au fonctionnement du site. 
                      Les autres cookies sont optionnels et vous pouvez les refuser.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors"
                >
                  Accepter tout
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Refuser tout
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl border-2 border-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Personnaliser</span>
                </button>
              </div>
            </div>
          ) : (
            // Vue détaillée
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Personnaliser vos préférences
                </h3>
                <p className="text-gray-600">
                  Choisissez quels types de cookies vous souhaitez autoriser.
                </p>
              </div>

              {/* Cookies essentiels */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Cookies essentiels</h4>
                      <p className="text-gray-600 text-xs">Nécessaires au fonctionnement</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Toujours actifs</span>
                    <div className="w-10 h-5 bg-red-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-xs">
                  Authentification, sécurité, préférences de langue, géolocalisation de base.
                </p>
              </div>

              {/* Cookies de performance */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Cookies de performance</h4>
                      <p className="text-gray-600 text-xs">Mesure d'audience et performances</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference('performance')}
                    className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                      preferences.performance ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      preferences.performance ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-gray-600 text-xs">
                  Google Analytics, statistiques de visite, temps passé sur les pages, sources de trafic.
                </p>
              </div>

              {/* Cookies de fonctionnalité */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Cookies de fonctionnalité</h4>
                      <p className="text-gray-600 text-xs">Personnalisation de l'expérience</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference('functionality')}
                    className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                      preferences.functionality ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      preferences.functionality ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-gray-600 text-xs">
                  Préférences de recherche, établissements favoris, paramètres d'affichage, recommandations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors"
                >
                  Sauvegarder mes choix
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              En continuant à utiliser ce site, vous acceptez notre{' '}
              <a href="/politique-confidentialite" className="text-orange-600 hover:text-orange-700 underline">
                politique de confidentialité
              </a>
              , nos{' '}
              <a href="/conditions" className="text-orange-600 hover:text-orange-700 underline">
                CGU
              </a>
              , nos{' '}
              <a href="/cgv" className="text-orange-600 hover:text-orange-700 underline">
                CGV
              </a>
              {' '}et nos{' '}
              <a href="/mentions-legales" className="text-orange-600 hover:text-orange-700 underline">
                mentions légales
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
