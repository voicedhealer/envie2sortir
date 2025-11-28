import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Politique de confidentialité</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Comment nous collectons, utilisons et protégeons vos données personnelles
            </p>
          </div>
        </div>
      </section>

      {/* Contenu de la politique de confidentialité */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Envie2Sortir s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme.
                </p>
                <p>
                  En utilisant notre service, vous acceptez les pratiques décrites dans cette politique de confidentialité. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
              </div>
            </div>

            {/* Données collectées */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Données que nous collectons</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Données d'identification</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Nom et prénom</li>
                    <li>• Adresse email</li>
                    <li>• Numéro de téléphone (optionnel)</li>
                    <li>• Date de naissance (pour les professionnels)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Données de localisation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Ville de résidence</li>
                    <li>• Coordonnées GPS (avec votre consentement)</li>
                    <li>• Adresse postale (pour les professionnels)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Données d'utilisation</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Pages visitées et temps passé</li>
                    <li>• Recherches effectuées</li>
                    <li>• Établissements consultés</li>
                    <li>• Interactions avec le contenu</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Données techniques</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Adresse IP</li>
                    <li>• Type de navigateur et version</li>
                    <li>• Système d'exploitation</li>
                    <li>• Cookies et technologies similaires</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Utilisation des données */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Comment nous utilisons vos données</h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Fourniture du service</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Personnalisation de votre expérience</li>
                    <li>• Recommandations d'établissements</li>
                    <li>• Géolocalisation pour trouver des lieux près de chez vous</li>
                    <li>• Communication avec notre équipe</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Amélioration du service</h3>
                  <ul className="space-y-2 text-green-800">
                    <li>• Analyse des tendances d'utilisation</li>
                    <li>• Développement de nouvelles fonctionnalités</li>
                    <li>• Optimisation des performances</li>
                    <li>• Recherche et développement</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-orange-900 mb-4">Communication</h3>
                  <ul className="space-y-2 text-orange-800">
                    <li>• Newsletter et notifications</li>
                    <li>• Informations sur les nouveaux établissements</li>
                    <li>• Support client</li>
                    <li>• Enquêtes de satisfaction</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Partage des données */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Partage de vos données</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :
                </p>
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-yellow-900 mb-4">Cas d'exception</h3>
                  <ul className="space-y-2 text-yellow-800">
                    <li>• <strong>Avec votre consentement explicite</strong></li>
                    <li>• <strong>Prestataires de services</strong> (hébergement, analytics, traitement des paiements) sous contrat de confidentialité</li>
                    <li>• <strong>Obligations légales</strong> (réquisition judiciaire, protection des droits)</li>
                    <li>• <strong>Protection de nos droits</strong> (prévention de la fraude, sécurité)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">💳 Prestataire de paiement : Stripe</h3>
                  <div className="space-y-3 text-blue-800">
                    <p>
                      Pour le traitement des paiements des abonnements Premium, nous utilisons <strong>Stripe</strong>, un prestataire de paiement certifié et conforme aux normes PCI-DSS.
                    </p>
                    <p>
                      <strong>Données partagées avec Stripe :</strong>
                    </p>
                    <ul className="space-y-1 ml-4 text-sm">
                      <li>• Informations de paiement (numéro de carte, date d'expiration, CVV) - uniquement pour le traitement de la transaction</li>
                      <li>• Nom et adresse email associés au compte</li>
                      <li>• Montant et date de la transaction</li>
                    </ul>
                    <p className="text-sm mt-4">
                      <strong>Important :</strong> Stripe ne partage pas vos informations de paiement avec nous. Nous ne stockons aucune donnée bancaire sur nos serveurs. 
                      Toutes les données de paiement sont gérées exclusivement par Stripe selon leurs normes de sécurité strictes.
                    </p>
                    <p className="text-sm">
                      Pour plus d'informations sur la manière dont Stripe traite vos données, consultez leur 
                      <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline ml-1">
                        politique de confidentialité
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sécurité de vos données</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous mettons en place des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sécurité technique</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Chiffrement SSL/TLS</li>
                      <li>• Authentification sécurisée</li>
                      <li>• Sauvegardes régulières</li>
                      <li>• Monitoring 24/7</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sécurité organisationnelle</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Accès restreint aux données</li>
                      <li>• Formation du personnel</li>
                      <li>• Procédures de sécurité</li>
                      <li>• Audit régulier</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Vos droits */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Vos droits</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Droit d'accès</h3>
                    <p className="text-green-800 text-sm">Obtenir une copie de vos données</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Droit de rectification</h3>
                    <p className="text-blue-800 text-sm">Corriger des données inexactes</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">Droit d'effacement</h3>
                    <p className="text-red-800 text-sm">Supprimer vos données</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Droit à la portabilité</h3>
                    <p className="text-purple-800 text-sm">Récupérer vos données</p>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-6">
                  <p className="text-orange-800">
                    <strong>Pour exercer ces droits :</strong> Contactez-nous à <a href="mailto:contact@envie2sortir.fr" className="text-orange-600 hover:text-orange-700">contact@envie2sortir.fr</a> 
                    en précisant votre demande et en joignant une copie de votre pièce d'identité.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies et technologies similaires</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous utilisons des cookies pour améliorer votre expérience sur notre site :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-red-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-red-900 mb-4">Cookies essentiels</h3>
                    <p className="text-red-800 mb-4">Nécessaires au fonctionnement du site</p>
                    <ul className="space-y-2 text-red-700 text-sm">
                      <li>• Authentification utilisateur</li>
                      <li>• Sécurité et prévention de la fraude</li>
                      <li>• Préférences de langue</li>
                      <li>• Panier d'achat (si applicable)</li>
                      <li>• Géolocalisation de base</li>
                      <li>• Traitement des paiements (Stripe) - cookies nécessaires pour sécuriser les transactions</li>
                    </ul>
                    <p className="text-red-600 text-xs mt-4">
                      <strong>Durée :</strong> Session ou 30 jours maximum
                    </p>
                    <p className="text-red-600 text-xs mt-2">
                      <strong>Note :</strong> Les cookies de paiement Stripe sont essentiels et ne peuvent pas être désactivés car ils sont nécessaires au traitement sécurisé des transactions.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Cookies de performance</h3>
                    <p className="text-blue-800 mb-4">Mesure de l'audience et des performances</p>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• Statistiques de visite (Google Analytics)</li>
                      <li>• Temps passé sur les pages</li>
                      <li>• Pages les plus consultées</li>
                      <li>• Sources de trafic</li>
                      <li>• Taux de conversion</li>
                    </ul>
                    <p className="text-blue-600 text-xs mt-4">
                      <strong>Durée :</strong> 2 ans maximum
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-green-900 mb-4">Cookies de fonctionnalité</h3>
                    <p className="text-green-800 mb-4">Personnalisation de votre expérience</p>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• Préférences de recherche</li>
                      <li>• Établissements favoris</li>
                      <li>• Paramètres d'affichage</li>
                      <li>• Recommandations personnalisées</li>
                      <li>• Historique de navigation</li>
                    </ul>
                    <p className="text-green-600 text-xs mt-4">
                      <strong>Durée :</strong> 1 an maximum
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestion de vos cookies</h3>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Vous pouvez contrôler et gérer les cookies de plusieurs façons :
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Paramètres du navigateur</h4>
                        <ul className="space-y-1 text-gray-600 text-sm">
                          <li>• Chrome : Paramètres &gt; Confidentialité et sécurité</li>
                          <li>• Firefox : Options &gt; Vie privée et sécurité</li>
                          <li>• Safari : Préférences &gt; Confidentialité</li>
                          <li>• Edge : Paramètres &gt; Cookies et autorisations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Bannières de consentement</h4>
                        <ul className="space-y-1 text-gray-600 text-sm">
                          <li>• Choix par catégorie de cookies</li>
                          <li>• Modification à tout moment</li>
                          <li>• Retrait du consentement</li>
                          <li>• Préférences sauvegardées</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-yellow-900 mb-4">⚠️ Important</h3>
                  <div className="space-y-2 text-yellow-800">
                    <p>
                      <strong>Cookies essentiels :</strong> Ces cookies sont nécessaires au fonctionnement du site. 
                      Si vous les désactivez, certaines fonctionnalités peuvent ne pas être disponibles.
                    </p>
                    <p>
                      <strong>Cookies optionnels :</strong> Vous pouvez refuser les cookies de performance et de fonctionnalité 
                      sans affecter la navigation de base sur le site.
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-orange-900 mb-4">Technologies utilisées</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">Cookies HTTP</h4>
                      <p className="text-orange-700 text-sm">Petits fichiers texte stockés sur votre appareil</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">Local Storage</h4>
                      <p className="text-orange-700 text-sm">Stockage local pour les préférences utilisateur</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">Session Storage</h4>
                      <p className="text-orange-700 text-sm">Données temporaires de session</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">Pixels de suivi</h4>
                      <p className="text-orange-700 text-sm">Images invisibles pour mesurer l'efficacité</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modifications */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Modifications de cette politique</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications importantes vous seront notifiées par email ou via une notification sur notre site.
                </p>
                <p>
                  <strong>Dernière mise à jour :</strong> Janvier 2025
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact</h2>
              <div className="bg-orange-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email :</strong> contact@envie2sortir.fr</p>
                  <p><strong>Téléphone :</strong> 06.61.32.38.03</p>
                  <p><strong>Adresse :</strong> 7 rue magedeleine, 21800 Neuilly-Crimolois</p>
                  <p><strong>Fondateur :</strong> Vivien Bernardot - Statut auto-entrepreneur</p>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  Vous pouvez également contacter notre délégué à la protection des données (DPO) à l'adresse dpo@envie2sortir.fr
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions sur vos données ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Notre équipe est à votre disposition pour toute question concernant la protection de vos données personnelles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors text-lg"
            >
              Nous contacter
            </Link>
            <Link 
              href="/mentions-legales" 
              className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg border-2 border-orange-500"
            >
              Mentions légales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
