import Link from "next/link";

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Conditions Générales de Vente</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Les règles applicables aux abonnements et services proposés par Envie2Sortir
            </p>
          </div>
        </div>
      </section>

      {/* Contenu des CGV */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les présentes Conditions Générales de Vente (ci-après les "CGV") régissent les relations commerciales entre Envie2Sortir et les professionnels utilisant la plateforme pour référencer leurs établissements.
                </p>
                <p>
                  Toute souscription à un abonnement implique l'acceptation sans réserve des présentes CGV.
                </p>
              </div>
            </div>

            {/* Objet */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Objet</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Envie2Sortir propose deux formules d'abonnement aux professionnels :
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-3">•</span>
                      <div>
                        <strong>Plan Basic (Gratuit) :</strong> Référencement gratuit de votre établissement avec les informations de base
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-400 mr-3">•</span>
                      <div>
                        <strong>Plan Premium (Payant) :</strong> Référencement premium avec visibilité renforcée, photos mises en avant, et fonctionnalités avancées
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Prix et modalités de paiement */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Prix et modalités de paiement</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Le plan Basic est gratuit et sans engagement. Le plan Premium est payant selon les tarifs en vigueur lors de la souscription.
                </p>
                <p>
                  Le paiement s'effectue par carte bancaire lors de la souscription. Les abonnements Premium sont renouvelés automatiquement sauf résiliation.
                </p>
                
                <div className="bg-blue-50 rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">💳 Traitement sécurisé des paiements</h3>
                  <div className="space-y-3 text-blue-800">
                    <p>
                      Les paiements sont traités de manière sécurisée via <strong>Stripe</strong>, notre prestataire de paiement certifié PCI-DSS.
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li>• <strong>Sécurité maximale :</strong> Toutes les transactions sont chiffrées et sécurisées</li>
                      <li>• <strong>Protection des données :</strong> Aucune donnée bancaire n'est stockée sur nos serveurs</li>
                      <li>• <strong>Conformité :</strong> Stripe est conforme aux normes internationales de sécurité des paiements</li>
                      <li>• <strong>Modes de paiement :</strong> Cartes bancaires (Visa, Mastercard, American Express)</li>
                    </ul>
                    <p className="text-sm mt-4">
                      En effectuant un paiement, vous acceptez que vos informations de paiement soient traitées par Stripe conformément à leur 
                      <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline ml-1">
                        politique de confidentialité
                      </a>.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 mt-4">
                  <h3 className="text-xl font-semibold text-yellow-900 mb-3">⚠️ Important</h3>
                  <p className="text-yellow-800 text-sm">
                    En cas de problème de paiement ou de remboursement, veuillez nous contacter à <strong>support@envie2sortir.fr</strong>. 
                    Les remboursements sont traités selon notre politique de remboursement et peuvent prendre 5 à 10 jours ouvrés.
                  </p>
                </div>
              </div>
            </div>

            {/* Durée et résiliation */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Durée et résiliation</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les abonnements Premium sont souscrits pour une durée minimale d'un mois. Ils se renouvellent automatiquement à l'échéance sauf résiliation effectuée au moins 7 jours avant le renouvellement.
                </p>
                <p>
                  Vous pouvez résilier votre abonnement à tout moment depuis votre espace professionnel.
                </p>
              </div>
            </div>

            {/* Obligations des parties */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Obligations des parties</h2>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Envie2Sortir s'engage à :</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Héberger et afficher les informations de votre établissement</li>
                    <li>• Assurer la disponibilité technique de la plateforme</li>
                    <li>• Respecter la confidentialité de vos données</li>
                    <li>• Fournir un support client réactif</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Vous vous engagez à :</h3>
                  <ul className="space-y-2 text-green-800">
                    <li>• Fournir des informations exactes et à jour</li>
                    <li>• Respecter les règles de modération</li>
                    <li>• Payer les factures d'abonnement en cas de plan Premium</li>
                    <li>• Respecter les droits de propriété intellectuelle</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Responsabilité */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Responsabilité et garantie</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Envie2Sortir s'efforce de fournir un service de qualité mais ne peut garantir un trafic ou un nombre de clients spécifique.
                </p>
                <p>
                  Nous ne sommes pas responsables des dommages indirects résultant de l'utilisation de la plateforme.
                </p>
              </div>
            </div>

            {/* Données personnelles */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Données personnelles</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  La collecte et le traitement de vos données personnelles sont régis par notre 
                  <Link href="/politique-confidentialite" className="text-orange-600 hover:text-orange-500 underline">
                    {" "}Politique de Confidentialité
                  </Link>.
                </p>
              </div>
            </div>

            {/* Droit applicable */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Droit applicable</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les présentes CGV sont régies par le droit français. Tout litige relève de la compétence des tribunaux français.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Contact</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Pour toute question concernant les présentes CGV, contactez-nous à :
                </p>
                <div className="bg-orange-50 rounded-xl p-6">
                  <p className="font-semibold text-orange-900">Envie2Sortir</p>
                  <p className="text-orange-800">Email : contact@envie2sortir.fr</p>
                  <p className="text-orange-800">Service client : support@envie2sortir.fr</p>
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
                href="/etablissements/nouveau"
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
