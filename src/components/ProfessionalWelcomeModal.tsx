'use client';

import { useState, useEffect, memo } from 'react';
// Import simplifié pour éviter les problèmes de compilation
// import { X, Phone, Clock, CheckCircle, HelpCircle } from 'lucide-react';

interface ProfessionalWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfessionalWelcomeModal = memo(function ProfessionalWelcomeModal({ isOpen, onClose }: ProfessionalWelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bienvenue dans l'espace Professionnel !</h2>
                <p className="text-orange-100 mt-1">Vous allez ajouter votre établissement</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="text-center">
            <p className="text-gray-700 text-lg leading-relaxed">
              Pour que votre établissement soit ajouté dans de bonnes conditions, 
              vous aurez besoin de quelques informations importantes.
            </p>
          </div>

          {/* Documents nécessaires */}
          <div className="bg-orange-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-orange-500 mr-2">📋</span>
              Documents et informations nécessaires
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Numéro SIRET</p>
                    <p className="text-sm text-gray-600">Obligatoire pour la vérification</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Nom et prénom du propriétaire</p>
                    <p className="text-sm text-gray-600">Informations légales</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Numéro de téléphone mobile</p>
                    <p className="text-sm text-gray-600">Vérifié par SMS via Twilio</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Nom de l'entreprise</p>
                    <p className="text-sm text-gray-600">Raison sociale</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Statut juridique</p>
                    <p className="text-sm text-gray-600">SARL, SAS, Auto-entrepreneur...</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Informations de l'établissement</p>
                    <p className="text-sm text-gray-600">Adresse, horaires, services...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarifs des plans */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 border border-orange-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-orange-500 mr-2">💰</span>
              Tarifs des plans d'abonnement
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Plan Basic */}
              <div className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-colors">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Plan Basic</h4>
                  <div className="text-3xl font-bold text-orange-500 mb-2">Gratuit</div>
                  <div className="text-sm text-gray-600 mb-4">par mois</div>
                  <ul className="text-sm text-gray-700 space-y-2 text-left">
                    <li className="flex items-center">
                      <span className="text-orange-500 mr-2">✓</span>
                      1 photo pour votre établissement
                    </li>
                    <li className="flex items-center">
                      <span className="text-orange-500 mr-2">✓</span>
                      Fiche établissement basique
                    </li>
                    <li className="flex items-center">
                      <span className="text-orange-500 mr-2">✓</span>
                      Présence sur la carte interactive
                    </li>
                    <li className="flex items-center">
                      <span className="text-orange-500 mr-2">✓</span>
                      Statistiques de consultation limitées
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plan Premium */}
              <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4 border-2 border-pink-300 hover:border-pink-400 transition-colors relative">
                <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Recommandé
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Plan Premium</h4>
                  <div className="text-3xl font-bold text-pink-500 mb-2">29€</div>
                  <div className="text-sm text-gray-600 mb-4">par mois</div>
                  <ul className="text-sm text-gray-700 space-y-2 text-left">
                    <li className="flex items-center">
                      <span className="text-pink-500 mr-2">✓</span>
                      🦋 Effet Papillon : jusqu'à 5 photos avec découverte progressive au survol
                    </li>
                    <li className="flex items-center">
                      <span className="text-pink-500 mr-2">✓</span>
                      🔥 Badge Premium avec logo flamme tendance
                    </li>
                    <li className="flex items-center">
                      <span className="text-pink-500 mr-2">✓</span>
                      📢 Créez des Événements temporaires avec visuel attractif
                    </li>
                    <li className="flex items-center">
                      <span className="text-pink-500 mr-2">✓</span>
                      🎁 Publiez des Bons Plans quotidiens pour attirer plus de clients
                    </li>
                    <li className="flex items-center">
                      <span className="text-pink-500 mr-2">✓</span>
                      ⭐ Mise en avant prioritaire dans les résultats de recherches, avec le filtre "Notre sélection"
                    </li>
                    <li className="flex items-center">
                      <span className="text-pink-500 mr-2">✓</span>
                      📊 Analytics avancées : profil détaillé de vos visiteurs
                    </li>
                    <li className="flex items-center">
                      <span className="text-pink-500 mr-2">✓</span>
                      💬 Support client prioritaire et dédié
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-orange-600">💡</span> Vous pourrez choisir votre plan à l'étape 6 du processus d'inscription
              </p>
            </div>
          </div>

          {/* Aide disponible */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-500 mr-2">❓</span>
              Aide disponible
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">❓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bouton d'aide à chaque étape</p>
                  <p className="text-sm text-gray-600">
                    Un bouton d'aide sera disponible à chaque étape du processus pour vous guider.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">📞</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contact téléphonique</p>
                  <p className="text-sm text-gray-600">
                    Pour une aide physique, contactez-nous au{' '}
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                      01 23 45 67 89
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">🕐</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Horaires de présence</p>
                  <p className="text-sm text-gray-600">
                    Lundi - Vendredi : 9h00 - 18h00<br />
                    Samedi : 10h00 - 16h00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message de rassurance */}
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processus simple et sécurisé
            </h3>
            <p className="text-gray-700">
              Notre équipe vous accompagne tout au long du processus. 
              Vos données sont protégées et utilisées uniquement pour la vérification de votre établissement.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Commencer l'ajout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfessionalWelcomeModal;
