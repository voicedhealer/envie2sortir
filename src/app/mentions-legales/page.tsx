import Link from "next/link";

export default function LegalMentionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Mentions légales</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Informations légales et réglementaires concernant Envie2Sortir
            </p>
          </div>
        </div>
      </section>

      {/* Contenu des mentions légales */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Éditeur du site */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Éditeur du site</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  <strong>Envie2Sortir</strong><br />
                  Plateforme ultra-locale de divertissements
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Adresse :</strong> 7 rue magedeleine, 21800 Neuilly-Crimolois<br />
                  <strong>Email :</strong> contact@envie2sortir.fr<br />
                  <strong>Téléphone :</strong> 06.61.32.38.03<br />
                  <strong>Fondateur :</strong> Vivien Bernardot - Statut auto-entrepreneur
                </p>
                <p className="text-gray-700">
                  <strong>Directeur de la publication :</strong> Vivien, Fondateur
                </p>
              </div>
            </div>

            {/* Hébergement */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Hébergement</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  <strong>Hébergeur :</strong> Vercel Inc.<br />
                  <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
                  <strong>Site web :</strong> <a href="https://vercel.com" className="text-orange-600 hover:text-orange-700" target="_blank" rel="noopener noreferrer">vercel.com</a>
                </p>
              </div>
            </div>

            {/* Propriété intellectuelle */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Propriété intellectuelle</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
                  Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
                <p>
                  La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                </p>
                <p>
                  La marque "Envie2Sortir" ainsi que le logo sont des marques déposées. Toute reproduction non autorisée de ces marques, dessins et modèles constitue une contrefaçon passible de sanctions pénales.
                </p>
              </div>
            </div>

            {/* Responsabilité */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Responsabilité</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
                </p>
                <p>
                  Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email, à l'adresse contact@envie2sortir.fr, en décrivant le problème de la manière la plus précise possible.
                </p>
                <p>
                  Tout contenu téléchargé se fait aux risques et périls de l'utilisateur et sous sa seule responsabilité. En conséquence, ne saurait être tenu responsable d'un quelconque dommage subi par l'ordinateur de l'utilisateur ou d'une quelconque perte de données consécutives au téléchargement.
                </p>
              </div>
            </div>

            {/* Liens hypertextes */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Liens hypertextes</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Des liens hypertextes peuvent être présents sur le site. L'utilisateur est informé qu'en cliquant sur ces liens, il sortira du site envie2sortir.fr. 
                  Ce dernier n'a pas de contrôle sur les pages web sur lesquelles aboutissent ces liens et ne saurait en aucun cas être responsable de leur contenu.
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Le site envie2sortir.fr peut être amené à vous demander l'acceptation des cookies pour des besoins de statistiques et d'affichage. 
                  Un cookie est une information déposée sur votre disque dur par le serveur du site que vous visitez.
                </p>
                <p>
                  Il contient plusieurs données qui sont stockées sur votre ordinateur dans un simple fichier texte auquel un serveur accède pour lire et enregistrer des informations. 
                  Certaines parties de ce site ne peuvent être fonctionnelles sans l'acceptation de cookies.
                </p>
              </div>
            </div>

            {/* Droit applicable */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Droit applicable</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Tant le présent site que les modalités et conditions de son utilisation sont régis par le droit français, quel que soit le lieu d'utilisation. 
                  En cas de contestation éventuelle, et après l'échec de toute tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents pour connaître de ce litige.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact</h2>
              <div className="bg-orange-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email :</strong> contact@envie2sortir.fr</p>
                  <p><strong>Téléphone :</strong> 06.61.32.38.03</p>
                  <p><strong>Adresse :</strong> 7 rue magedeleine, 21800 Neuilly-Crimolois</p>
                  <p><strong>Fondateur :</strong> Vivien Bernardot - Statut auto-entrepreneur</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Besoin d'informations supplémentaires ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Notre équipe est à votre disposition pour toute question concernant nos mentions légales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors text-lg"
            >
              Nous contacter
            </Link>
            <Link 
              href="/politique-confidentialite" 
              className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg border-2 border-orange-500"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
