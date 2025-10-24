'use client';

import { useState, useEffect, memo } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
}

const HelpModal = memo(function HelpModal({ isOpen, onClose, currentStep }: HelpModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // Contenu d'aide pour chaque étape
  const getHelpContent = (step: number) => {
    switch (step) {
      case 0:
        return {
          title: "Création de votre compte",
          icon: "👤",
          content: {
            introduction: "Cette étape vous permet de créer votre compte professionnel.",
            steps: [
              {
                title: "Informations personnelles",
                description: "Renseignez votre prénom et nom de famille. Ces informations seront visibles sur votre profil professionnel."
              },
              {
                title: "Adresse email professionnelle",
                description: "Utilisez une adresse email professionnelle que vous consultez régulièrement. Elle servira pour les communications importantes."
              },
              {
                title: "Mot de passe sécurisé",
                description: "Choisissez un mot de passe fort avec au moins 8 caractères, incluant majuscules, minuscules et chiffres."
              },
              {
                title: "Numéro de téléphone mobile",
                description: "Votre numéro sera vérifié par SMS pour sécuriser votre compte. Format : 06 ou 07 suivi de 8 chiffres."
              }
            ],
            tips: [
              "💡 Utilisez un email professionnel que vous consultez régulièrement",
              "🔒 Votre mot de passe doit être unique et sécurisé",
              "📱 Le numéro de téléphone sera vérifié par SMS"
            ]
          }
        };

      case 1:
        return {
          title: "Vérification SIRET et informations professionnelles",
          icon: "🏢",
          content: {
            introduction: "Cette étape permet de vérifier votre entreprise et vos informations professionnelles.",
            steps: [
              {
                title: "Numéro SIRET",
                description: "Le SIRET est obligatoire pour vérifier votre entreprise. Vous le trouvez sur vos documents officiels (K-bis, factures, etc.)."
              },
              {
                title: "Vérification automatique",
                description: "Une fois le SIRET saisi, nous vérifions automatiquement les informations de votre entreprise."
              },
              {
                title: "Confirmation des données",
                description: "Vérifiez que les informations récupérées correspondent bien à votre entreprise."
              }
            ],
            tips: [
              "📄 Le SIRET se trouve sur votre K-bis ou vos factures",
              "✅ La vérification est automatique et sécurisée",
              "🔍 Vérifiez que les informations correspondent à votre entreprise"
            ]
          }
        };

      case 2:
        return {
          title: "Enrichissement automatique des données",
          icon: "🤖",
          content: {
            introduction: "Nous enrichissons automatiquement vos données à partir de sources publiques.",
            steps: [
              {
                title: "Recherche automatique",
                description: "Nous recherchons votre établissement sur Google à l'aide d'une API Google Places sécurisée, nous récupérons toutes les informations nécessaires pour vous aider à remplir le formulaire et facilité le processus de création de votre établissement, les informations seront ensuite modifiables aux étapes suivantes."
              },
              {
                title: "Les liens TheFork et Uber Eats",
                description: "Ces liens sont facultatifs, vous pouvez les ajouter si vous le souhaitez, ils seront affichés sur votre profil professionnel, c'est un gain de temps pour vos clients et pour vous un moyen de générer des revenus supplémentaires."
              },
              {
                title: "Votre établissement n'est pas sur google maps ?",
                description: " Dans ce cas vous avez la possibilité de rentrer les informations manuellement, cliquez sur le bouton \"suivant\" pour le faire."
              },
              {
                title: "Récupération des données",
                description: "Horaires, commodités, services, ambiance, nom de l'établissement, adresse."
              },
              {
                title: "Validation des informations",
                description: "Vous pouvez valider, modifier à l'étape suivante ou ignorer les informations trouvées."
              }
            ],
            tips: [
              "⚡ L'enrichissement des données est entièrement automatique et sécurisé",
              "✏️ Vous pouvez modifier toutes les informations à l'étape suivante"
            ]
          }
        };

      case 3:
        return {
          title: "Informations de votre établissement",
          icon: "🏪",
          content: {
            introduction: "Décrivez votre établissement pour attirer vos clients.",
            steps: [
              {
                title: "Nom de l'établissement",
                description: "Le nom tel qu'il apparaît sur votre vitrine et vos réseaux sociaux."
              },
              {
                title: "Description attractive",
                description: "Décrivez votre établissement en mettant en avant ce qui le rend unique,le système disposes d'une fonction pour la mise en forme automatique du texte.."
              },
              {
                title: "Adresse complète",
                description: "L'adresse exacte avec code postal pour que vos clients vous trouvent facilement, le système dispose d'une fonction pour la géolocalisation automatique donc indiquez bien les coordonnées GPS et verifié à l'aide du bouton prévu à cet effet."
              },
              {
                title: "Horaires d'ouverture",
                description: "Définissez vos horaires d'ouverture pour chaque jour de la semaine, le système dispose d'une fonction pour la mise en forme automatique des horaires, vous pouvez les modifier si vous le souhaitez."
              },
              {
                title: "Contact",
                description: "Numéro de téléphone, email, WhatsApp... tous vos moyens de contact."
              },
              {
                title: "Activités proposées",
                description: "Sélectionnez les activités proposées par votre établissement, exemple: Bar à Tapas, Parc d'attractions, etc... c'est très important de situer l'activité de votre établissement."
              }
            ],
            
            tips: [
              "📝 Une description attractive attire plus de clients",
              "📍 L'adresse exacte aide à la géolocalisation",
              "⏰ Les horaires permettent aux clients de vous contacter au bon moment"
            ]
          }
        };

      case 4:
        return {
          title: "Services et ambiances",
          icon: "🎨",
          content: {
            introduction: "Définissez les services que vous proposez et l'ambiance de votre établissement (Astuce : Utilisé la page à propos de votre établissement présent sur Google Maps pour vous aider) l'idée de cette page est de décrire avec des tags courts ce que vous proposez.",
            steps: [
              {
                title: "Services proposés",
                description: "Sélectionnez tous les services que vous proposez : restauration, boissons, snacks,terrasse, etc... cela aide les clients à comprendre ce que vous proposez."
              },
              {
                title: "Ambiance et Spécialités",
                description: "Décrivez l'ambiance (décontractée, branchée, familiale, etc...), Points forts (Burger, Pizza, concert, show, etc...), Populaire (pour qui ? pourquoi ?), Offres (conviennent aux végétariens, portion à partager, etc...), Clientèle (famille, couple, business, EVG, EVF (enterrement de vie de jeune garçon où de jeune fille) etc...), Enfants (animations, jeux, convient aux enfants, pour les - de 12 ans etc...)."
              },
              {
                title: "Moyens de paiement",
                description: "Indiquez les moyens de paiement acceptés : espèces, carte, tickets restaurants, pluxee, chèques vacances, etc."
              },
              {
                title: "Informations pratiques",
                description: "Accessibilité, parking, wifi, terrasse... toutes les informations utiles."
              }
            ],
            tips: [
              "🎯 Plus vous détaillez vos services, plus vous attirez les bons clients",
              "💳 Indiquez tous vos moyens de paiement",
              "♿ Les informations d'accessibilité sont importantes"
            ]
          }
        };

      case 5:
        return {
          title: "Envie de: et Tags personnalisés",
          icon: "🏷️",
          content: {
            introduction: "Écrivez dans la barre les envies qui correspondent le mieux à votre établissement jusqu'à 15 tags maximum.",
            steps: [
              {
                title: "Tags envie de ",
                description: "écrivez les envies qui serait susceptibles d'être tapées dans la barre de recherche par les clients, en utilisant cette formule par exemple, envie de: regarder un match de rugby en mangeant des tapas, etc....."
              },
              {
                title: "Tags personnalisés",
                description: "Ajoutez des tags courts qui s'ajouteront à vos envies de tags exemple: cinéma, bar tapas, trampoline xxl, etc..."
              },
              
            ],
            tips: [
              "🔍 Les tags aident les clients à vous trouver",
              "✨ Ajoutez des tags uniques qui vous caractérisent",
              "📂 Les catégories facilitent la recherche"
            ]
          }
        };

      case 6:
        return {
          title: "Choix de votre abonnement",
          icon: "💳",
          content: {
            introduction: "Sélectionnez l'abonnement qui correspond à vos besoins.",
            steps: [
              {
                title: "Plan Gratuit",
                description: "Parfait pour commencer : profil Basic, 1 photo, présence sur la carte interactive et dans les recherches, statistiques de Base et fonctionnalités essentielles."
              },
              {
                title: "Plan Premium",
                description: "Pour les professionnels : jusqu'à 5 photos, analytics avancés, promotions, création d'événements, création de bons plans, Restaurateurs : Vos menus au format pdf, support prioritaire, lien vers votre site web, instagram, facebook, tiktok, youtube, the Fork, Uber Eats."
              },
              {
                title: "Fonctionnalités incluses",
                description: "Chaque plan inclut des fonctionnalités spécifiques adaptées à vos besoins."
              }
            ],
            tips: [
              "🚀 Commencez gratuitement, passez en Premium quand vous voulez",
              "📊 Le Premium offre des analytics détaillés, section événements, bons plans et upload de vos menus au format pdf.",
              "🎯 Choisissez selon vos besoins actuels"
            ]
          }
        };

      case 7:
        return {
          title: "Réseaux sociaux et liens",
          icon: "📱",
          content: {
            introduction: "Connectez vos réseaux sociaux pour maximiser votre visibilité.",
            steps: [
              {
                title: "Site web",
                description: "Lien vers votre site web officiel (optionnel mais recommandé)."
              },
              {
                title: "Instagram",
                description: "Votre compte Instagram pour partager vos photos et actualités."
              },
              {
                title: "Facebook",
                description: "Votre page Facebook pour communiquer avec vos clients."
              },
              {
                title: "TikTok, YouTube",
                description: "Vos autres réseaux sociaux pour diversifier votre présence."
              },
              {
                title: "Gamme de prix",
                description: "Indiquez votre fourchette de prix pour aider les clients à choisir."
              }
            ],
            tips: [
              "📸 Instagram est parfait pour montrer vos plats et votre ambiance",
              "💬 Facebook permet de communiquer avec vos clients",
              "💰 La gamme de prix aide les clients à choisir"
            ]
          }
        };

      case 8:
        return {
          title: "Récapitulatif et validation",
          icon: "✅",
          content: {
            introduction: "Vérifiez toutes vos informations avant de finaliser votre inscription.",
            steps: [
              {
                title: "Vérification des informations",
                description: "Relisez toutes vos informations pour vous assurer qu'elles sont correctes."
              },
              {
                title: "Modification possible",
                description: "Vous pouvez modifier n'importe quelle information en cliquant sur l'étape correspondante."
              },
              {
                title: "Validation finale",
                description: "Une fois tout vérifié, cliquez sur 'Créer l'établissement' pour finaliser."
              }
            ],
            tips: [
              "👀 Prenez le temps de vérifier toutes vos informations",
              "✏️ Vous pouvez encore tout modifier",
              "🎉 Une fois validé, votre établissement sera en ligne !"
            ]
          }
        };

      default:
        return {
          title: "Aide générale",
          icon: "❓",
          content: {
            introduction: "Besoin d'aide ? Nous sommes là pour vous accompagner.",
            steps: [
              {
                title: "Contact téléphonique",
                description: "Appelez-nous au 01 23 45 67 89 (Lun-Ven 9h-18h, Sam 10h-16h)"
              },
              {
                title: "Bouton d'aide",
                description: "Un bouton d'aide est disponible à chaque étape du processus."
              }
            ],
            tips: [
              "📞 Notre équipe est là pour vous aider",
              "⏰ Horaires : Lun-Ven 9h-18h, Sam 10h-16h"
            ]
          }
        };
    }
  };

  const helpData = getHelpContent(currentStep);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
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
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{helpData.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Besoin d'aide ?</h2>
                <p className="text-blue-100 mt-1">{helpData.title}</p>
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
              {helpData.content.introduction}
            </p>
          </div>

          {/* Étapes détaillées */}
          <div className="space-y-4">
            {helpData.content.steps.map((step, index) => (
              <div key={index} className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  {step.title}
                </h3>
                <p className="text-gray-700 ml-9">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Conseils */}
          {helpData.content.tips && (
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-green-500 mr-2">💡</span>
                Conseils pratiques
              </h3>
              <div className="space-y-2">
                {helpData.content.tips.map((tip, index) => (
                  <p key={index} className="text-gray-700 text-sm">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Contact d'aide */}
          <div className="bg-orange-50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📞</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Besoin d'aide personnalisée ?
            </h3>
            <p className="text-gray-700 mb-4">
              Notre équipe est là pour vous accompagner
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Téléphone :</strong> 01 23 45 67 89</p>
              <p><strong>Horaires :</strong> Lun-Ven 9h-18h, Sam 10h-16h</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              J'ai compris, merci !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HelpModal;
