import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Conditions Générales d'Utilisation</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Les règles et conditions d'utilisation de la plateforme Envie2Sortir
            </p>
          </div>
        </div>
      </section>

      {/* Contenu des CGU */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les présentes Conditions Générales d'Utilisation (ci-après les "CGU") régissent l'utilisation de la plateforme Envie2Sortir accessible à l'adresse www.envie2sortir.fr.
                </p>
                <p>
                  En accédant et en utilisant notre plateforme, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
              </div>
            </div>

            {/* Objet */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Objet</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Envie2Sortir est une plateforme web permettant aux utilisateurs de découvrir et de réserver des activités de loisirs et de sorties dans leur région.
                </p>
                <p>
                  La plateforme permet également aux professionnels de référencer leurs établissements et de proposer leurs services.
                </p>
              </div>
            </div>

            {/* Acceptation des CGU */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Acceptation des CGU</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  En créant un compte sur Envie2Sortir, vous déclarez avoir lu, compris et accepté les présentes CGU.
                </p>
                <p>
                  Ces CGU peuvent être modifiées à tout moment. Il est de votre responsabilité de consulter régulièrement cette page pour prendre connaissance des modifications.
                </p>
              </div>
            </div>

            {/* Inscription et compte utilisateur */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Inscription et compte utilisateur</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Création de compte</h3>
                  <p className="text-gray-700 mb-4">
                    Pour utiliser les fonctionnalités complètes de la plateforme, vous devez créer un compte en fournissant des informations exactes et à jour.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Vous devez être âgé d'au moins 18 ans ou avoir l'autorisation d'un parent/tuteur</li>
                    <li>• Vous êtes responsable de la confidentialité de vos identifiants</li>
                    <li>• Vous devez nous notifier de tout accès non autorisé à votre compte</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Responsabilités</h3>
                  <p className="text-blue-800">
                    Vous êtes responsable de toutes les activités effectuées sous votre compte utilisateur.
                  </p>
                </div>
              </div>
            </div>

            {/* Utilisation de la plateforme */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Utilisation de la plateforme</h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-4">Interdictions</h3>
                  <p className="text-red-800 mb-4">Il est strictement interdit de :</p>
                  <ul className="space-y-2 text-red-700">
                    <li>• Utiliser la plateforme à des fins illégales ou frauduleuses</li>
                    <li>• Publier du contenu diffamatoire, offensant ou illégal</li>
                    <li>• Porter atteinte aux droits de propriété intellectuelle</li>
                    <li>• Tenter de perturber le fonctionnement de la plateforme</li>
                    <li>• Utiliser des robots, scripts automatisés ou autres outils similaires</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Utilisation autorisée</h3>
                  <p className="text-green-800">
                    Vous pouvez consulter, rechercher et réserver des activités pour votre usage personnel et non commercial.
                  </p>
                </div>
              </div>
            </div>

            {/* Avis et commentaires utilisateurs */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4.1. Avis et commentaires utilisateurs</h2>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">📝 Règles de publication des avis</h3>
                  <div className="space-y-3 text-blue-800">
                    <p>
                      Les utilisateurs peuvent laisser un avis et une note sur chaque établissement de la plateforme. 
                      Ces avis sont soumis aux règles suivantes :
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Un seul avis par établissement</strong> : Chaque utilisateur peut laisser maximum un avis par établissement</li>
                      <li>• <strong>Authenticité</strong> : L'avis doit refléter une expérience réelle et authentique</li>
                      <li>• <strong>Respect</strong> : Les propos doivent être respectueux et constructifs</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                  <h3 className="text-xl font-semibold text-red-900 mb-4">⚠️ Contenus interdits - Sous réserve de réfutation</h3>
                  <p className="text-red-800 mb-3 font-semibold">
                    Tout avis contenant les éléments suivants peut être supprimé sans préavis :
                  </p>
                  <ul className="space-y-2 text-red-700">
                    <li>• <strong>Propos offensants</strong> ou discriminatoires (race, religion, origine, sexe, etc.)</li>
                    <li>• <strong>Propos insultants</strong> ou injurieux à l'égard de l'établissement, du personnel ou d'autres utilisateurs</li>
                    <li>• <strong>Contenu diffamatoire</strong> ou portant atteinte à la réputation sans fondement factuel</li>
                    <li>• <strong>Langage injurieux</strong>, obscène ou vulgaire</li>
                    <li>• <strong>Faux avis</strong> ou manipulation de note (fausses évaluations, avis commandités)</li>
                    <li>• <strong>Contenu promotionnel</strong> ou publicitaire non sollicité</li>
                    <li>• <strong>Information personnelle</strong> d'autres utilisateurs ou du personnel</li>
                    <li>• <strong>Liens externes</strong> vers d'autres sites ou plateformes</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                  <h3 className="text-xl font-semibold text-yellow-900 mb-4">⚖️ Droit de réfutation</h3>
                  <div className="space-y-3 text-yellow-800">
                    <p>
                      <strong>Droit de l'établissement :</strong> Tout établissement peut demander la suppression ou la modification 
                      d'un avis qu'il estime non conforme aux règles de la plateforme.
                    </p>
                    <p>
                      <strong>Procédure :</strong> Pour exercer ce droit, l'établissement doit contacter Envie2Sortir en fournissant :
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• L'identifiant de l'établissement</li>
                      <li>• Le lien vers l'avis concerné</li>
                      <li>• Les motifs de la demande de réfutation</li>
                    </ul>
                    <p className="pt-2">
                      <strong>Délai de traitement :</strong> Nous nous engageons à examiner toute demande dans un délai de 48 heures ouvrables.
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-orange-900 mb-4">🔒 Confidentialité et protection</h3>
                  <div className="space-y-3 text-orange-800">
                    <p>
                      <strong>Modération automatique :</strong> Tous les avis sont soumis à une modération automatique 
                      avant publication pour détecter les contenus interdits.
                    </p>
                    <p>
                      <strong>Signalement :</strong> Tout utilisateur peut signaler un avis inapproprié. 
                      Les avis signalés font l'objet d'un contrôle renforcé.
                    </p>
                    <p>
                      <strong>Droit de réponse :</strong> Les établissements peuvent publier une réponse à un avis 
                      afin d'apporter des éclaircissements ou rectifier des informations.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Transparence des avis</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      Envie2Sortir s'engage à maintenir la transparence et l'authenticité des avis publiés. 
                      Toute tentative de manipulation des avis ou des notes peut entraîner :
                    </p>
                    <ul className="space-y-1 ml-4 text-gray-600">
                      <li>• La suppression immédiate des avis concernés</li>
                      <li>• La suspension ou la fermeture du compte utilisateur</li>
                      <li>• Des poursuites judiciaires en cas de fraude caractérisée</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Contenu</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Le contenu de la plateforme (textes, images, logos, etc.) est protégé par le droit d'auteur et appartient à Envie2Sortir ou à ses partenaires.
                </p>
                <p>
                  Vous vous engagez à ne pas reproduire, copier, vendre ou exploiter tout ou partie du contenu sans autorisation écrite préalable.
                </p>
              </div>
            </div>

            {/* Responsabilité */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Responsabilité et garantie</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Envie2Sortir s'efforce de fournir des informations exactes et à jour. Cependant, nous ne garantissons pas l'exactitude, l'exhaustivité ou la pertinence des informations diffusées.
                </p>
                <p>
                  Nous ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation de la plateforme.
                </p>
              </div>
            </div>

            {/* Liens externes */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Liens externes</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  La plateforme peut contenir des liens vers des sites tiers. Nous n'avons aucun contrôle sur ces sites et déclinons toute responsabilité quant à leur contenu.
                </p>
              </div>
            </div>

            {/* Paiements */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Paiements et traitement des transactions</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Pour les abonnements payants (Plan Premium), les paiements sont traités de manière sécurisée via notre prestataire de paiement Stripe.
                </p>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Sécurité des paiements</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Les transactions sont sécurisées et chiffrées conformément aux normes PCI-DSS</li>
                    <li>• Aucune donnée bancaire n'est stockée sur nos serveurs</li>
                    <li>• Les informations de paiement sont gérées exclusivement par Stripe</li>
                    <li>• En utilisant notre service de paiement, vous acceptez les conditions d'utilisation de Stripe</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600">
                  Pour plus d'informations sur la protection de vos données de paiement, consultez la 
                  <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500 underline ml-1">
                    politique de confidentialité de Stripe
                  </a>.
                </p>
              </div>
            </div>

            {/* Données personnelles */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Données personnelles</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  La collecte et le traitement de vos données personnelles sont régis par notre 
                  <Link href="/politique-confidentialite" className="text-orange-600 hover:text-orange-500 underline">
                    {" "}Politique de Confidentialité
                  </Link>.
                </p>
              </div>
            </div>

            {/* Modification des CGU */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">10. Modification des CGU</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications prendront effet dès leur publication sur cette page.
                </p>
              </div>
            </div>

            {/* Droit applicable */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">11. Droit applicable</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les présentes CGU sont régies par le droit français. Tout litige relatif à leur application relève de la compétence des tribunaux français.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">12. Contact</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Pour toute question concernant les présentes CGU, vous pouvez nous contacter à :
                </p>
                <div className="bg-orange-50 rounded-xl p-6">
                  <p className="font-semibold text-orange-900">Envie2Sortir</p>
                  <p className="text-orange-800">Email : contact@envie2sortir.fr</p>
                  <p className="text-orange-800">Téléphone : 06.61.32.38.03</p>
                  <p className="text-orange-800">Adresse : 7 rue magedeleine, 21800 Neuilly-Crimolois</p>
                  <p className="text-orange-800">Fondateur : Vivien Bernardot - Statut auto-entrepreneur</p>
                </div>
              </div>
            </div>

            {/* Date de mise à jour */}
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-gray-600">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Bouton retour */}
            <div className="mt-12 text-center">
              <Link 
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Retour à l'inscription
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
