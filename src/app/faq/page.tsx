"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqData = [
  {
    category: "Première utilisation",
    id: "premiere-utilisation",
    questions: [
      {
        question: "Comment utiliser Envie2Sortir pour la première fois ?",
        answer: "C'est très simple ! Commencez par décrire votre envie dans la barre de recherche (ex: 'boire un verre et danser'), sélectionnez votre ville ou utilisez la géolocalisation, puis explorez les résultats personnalisés qui s'affichent."
      },
      {
        question: "Dois-je créer un compte pour utiliser la plateforme ?",
        answer: "Non, vous pouvez utiliser Envie2Sortir sans créer de compte pour découvrir les établissements. Cependant, créer un compte vous permet de sauvegarder vos favoris, recevoir des recommandations personnalisées et accéder à des fonctionnalités avancées."
      },
      {
        question: "Comment fonctionne la géolocalisation ?",
        answer: "La géolocalisation vous permet de découvrir les établissements dans un rayon de 5km autour de votre position actuelle. Vous devez autoriser l'accès à votre localisation dans votre navigateur pour utiliser cette fonctionnalité."
      }
    ]
  },
  {
    category: "Recherche et découverte",
    id: "recherche-avancee",
    questions: [
      {
        question: "Comment bien formuler ma recherche ?",
        answer: "Soyez naturel ! Décrivez simplement ce que vous avez envie de faire : 'manger du sushi', 'danser en boîte', 'boire un café en terrasse', 'faire du bowling'. Notre système comprend le langage naturel et vous proposera les meilleurs établissements correspondants."
      },
      {
        question: "Que signifient les différents filtres ?",
        answer: "• Populaire : Établissements les plus consultés\n• Désirés ++ : Établissements les plus ajoutés aux favoris\n• Les - cher : Établissements avec les prix les plus bas\n• Notre sélection : Établissements premium recommandés par notre équipe\n• Nouveaux : Établissements récemment ajoutés\n• Mieux notés : Établissements avec les meilleures notes"
      },
      {
        question: "Comment voir les établissements sur une carte ?",
        answer: "Cliquez sur 'Carte interactive' dans le menu ou utilisez le lien dans le footer. La carte vous montre tous les établissements de votre zone avec des marqueurs colorés. Vous pouvez cliquer sur chaque marqueur pour voir les détails de l'établissement."
      }
    ]
  },
  {
    category: "Référencer un établissement",
    id: "referent-etablissement",
    questions: [
      {
        question: "Comment ajouter mon établissement ?",
        answer: "Cliquez sur 'Ajouter un établissement' dans le menu ou le footer. Vous devrez créer un compte professionnel, puis remplir le formulaire avec les informations de votre établissement. Notre équipe validera votre demande sous 24-48h."
      },
      {
        question: "Quels types d'établissements sont acceptés ?",
        answer: "Nous acceptons tous les établissements de divertissement : restaurants, bars, cafés, boîtes de nuit, cinémas, théâtres, musées, parcs d'attractions, parc de loisirs indoor, établissements de sport indoor, bowling, réalité virtuelle et bien plus encore !"
      },
      {
        question: "Combien coûte le référencement ?",
        answer: "Le référencement basique est gratuit ! Nous proposons également une option premium pour augmenter votre visibilité et accéder à une suite d'outils pour gérer votre établissement de facon optimale. Consultez nos tarifs dans votre espace professionnel."
      },
      {
        question: "Comment gérer mon établissement une fois référencé ?",
        answer: "Connectez-vous à votre espace professionnel pour mettre à jour vos informations, ajouter des photos, gérer vos horaires, et consulter vos statistiques de visites et de clics."
      }
    ]
  },
  {
    category: "Compte et profil",
    questions: [
      {
        question: "Comment créer un compte ?",
        answer: "Cliquez sur 'Se connecter' puis 'Créer un compte'. Remplissez le formulaire avec vos informations personnelles. Vous recevrez un email de confirmation pour activer votre compte."
      },
      {
        question: "J'ai oublié mon mot de passe",
        answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié' et saisissez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe."
      },
      {
        question: "Comment modifier mes informations personnelles ?",
        answer: "Connectez-vous à votre compte, allez dans 'Mon profil' et modifiez les informations que vous souhaitez changer. N'oubliez pas de sauvegarder vos modifications."
      }
    ]
  },
  {
    category: "Problèmes techniques",
    questions: [
      {
        question: "La carte ne s'affiche pas correctement",
        answer: "Vérifiez que JavaScript est activé dans votre navigateur. Si le problème persiste, essayez de rafraîchir la page ou de vider le cache de votre navigateur."
      },
      {
        question: "Les résultats de recherche ne correspondent pas à ma recherche",
        answer: "Essayez de reformuler votre recherche avec des mots plus simples. Notre système fonctionne mieux avec des descriptions naturelles comme 'boire un verre' plutôt que 'consommation d'alcool'."
      },
      {
        question: "Le site est lent à charger",
        answer: "Vérifiez votre connexion internet. Si le problème persiste, essayez de vider le cache de votre navigateur ou contactez notre support technique."
      }
    ]
  }
];

export default function FAQPage() {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const toggleSection = (category: string) => {
    setOpenSections(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(q => q !== questionId)
        : [...prev, questionId]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">FAQ</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions les plus fréquentes
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {faqData.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <button
                  onClick={() => toggleSection(section.category)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-gray-900">{section.category}</h2>
                  {openSections.includes(section.category) ? (
                    <ChevronUp className="w-6 h-6 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-500" />
                  )}
                </button>
                
                {openSections.includes(section.category) && (
                  <div className="border-t border-gray-100">
                    {section.questions.map((faq, questionIndex) => {
                      const questionId = `${sectionIndex}-${questionIndex}`;
                      return (
                        <div key={questionIndex} className="border-b border-gray-50 last:border-b-0">
                          <button
                            onClick={() => toggleQuestion(questionId)}
                            className="w-full px-8 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                            {openQuestions.includes(questionId) ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          
                          {openQuestions.includes(questionId) && (
                            <div className="px-8 pb-4">
                              <div className="text-gray-600 whitespace-pre-line">
                                {faq.answer}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Notre équipe support est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors text-lg"
            >
              Nous contacter
            </a>
            <a 
              href="/support" 
              className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg border-2 border-orange-500"
            >
              Centre d'aide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
