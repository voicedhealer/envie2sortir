import EstablishmentMainSections from '@/components/EstablishmentMainSections';

export default function TestGroupedSectionsPage() {
  // Données de test pour différents types d'établissements
  const testEstablishments = [
    {
      id: 'restaurant',
      name: 'Restaurant Test',
      description: 'Un restaurant italien authentique au cœur de la ville, proposant des plats traditionnels dans une ambiance chaleureuse et familiale.',
      activities: ['restaurant_italien'],
      services: ['Déjeuner', 'Dîner', 'Service à table', 'Livraison'],
      ambiance: ['Ambiance décontractée', 'Romantique', 'Familial'],
      specialties: ['Pizza', 'Pâtes', 'Vins italiens'],
      atmosphere: ['Cosy', 'Moderne', 'Authentique'],
      detailedServices: ['WiFi gratuit', 'Climatisation', 'Chauffage', 'Toilettes'],
      clienteleInfo: ['Groupes', 'Familles', 'Couples'],
      informationsPratiques: ['Réservation recommandée', 'Espace non-fumeurs'],
      paymentMethods: ['Carte bancaire', 'Espèces', 'Ticket Restaurant'],
      accessibilite: true,
      parking: true,
      terrasse: true
    },
    {
      id: 'vr-center',
      name: 'DreamAway VR Center',
      description: 'Centre de réalité virtuelle proposant des expériences immersives uniques pour tous les âges.',
      activities: ['VR Experience', 'Escape Game VR', 'Simulation'],
      services: ['Séances VR', 'Équipements', 'Encadrement'],
      ambiance: ['Futuriste', 'Immersif', 'Technologique'],
      specialties: ['Réalité virtuelle', 'Simulations', 'Jeux immersifs'],
      atmosphere: ['Moderne', 'Coloré', 'Énergique'],
      detailedServices: ['Casques VR', 'WiFi gratuit', 'Climatisation', 'Vestiaires'],
      clienteleInfo: ['Groupes', 'Familles', 'Adolescents', 'Adultes'],
      informationsPratiques: ['Réservation obligatoire', 'Casques désinfectés', 'Pauses recommandées'],
      paymentMethods: ['Carte bancaire', 'Espèces'],
      accessibilite: true,
      parking: true,
      terrasse: false
    },
    {
      id: 'bowling',
      name: 'Bowling Test',
      description: 'Centre de bowling moderne avec 12 pistes, snack-bar et espace détente.',
      activities: ['Bowling', 'Snack-bar', 'Boissons'],
      services: ['Bowling', 'Équipements', 'Encadrement'],
      ambiance: ['Ambiance décontractée', 'Festif', 'Familial'],
      specialties: ['Bowling', 'Snack-bar', 'Boissons'],
      atmosphere: ['Moderne', 'Coloré', 'Énergique'],
      detailedServices: ['Parking gratuit', 'Vestiaires', 'WiFi', 'Snack-bar'],
      clienteleInfo: ['Groupes', 'Familles', 'Enfants'],
      informationsPratiques: ['Réservation obligatoire', 'Équipements fournis'],
      paymentMethods: ['Carte bancaire', 'Espèces'],
      accessibilite: true,
      parking: true,
      terrasse: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 Test des Sections Groupées
          </h1>
          <p className="text-gray-600">
            Démonstration du nouveau système de sections groupées utilisant les champs Prisma existants
          </p>
        </div>

        {testEstablishments.map((establishment) => (
          <div key={establishment.id} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {establishment.name} ({establishment.activities[0]})
            </h2>
            <EstablishmentMainSections
              establishment={establishment}
            />
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ✨ Avantages du nouveau système
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• <strong>Structure cohérente</strong> : Une section principale avec des sous-sections thématiques</li>
            <li>• <strong>Utilisation des champs Prisma</strong> : Respect de l'architecture existante</li>
            <li>• <strong>Support multi-activités</strong> : Restaurants, bars, bowling, etc.</li>
            <li>• <strong>Adaptation automatique</strong> : Les titres s'adaptent au type d'établissement</li>
            <li>• <strong>Interface harmonisée</strong> : Design cohérent avec l'existant</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
