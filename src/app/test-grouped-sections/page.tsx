import EstablishmentGroupedSection from '@/components/EstablishmentGroupedSection';

export default function TestGroupedSectionsPage() {
  // Données de test pour différents types d'établissements
  const testEstablishments = [
    {
      id: 'restaurant',
      name: 'Restaurant Test',
      activities: ['restaurant_italien'],
      services: ['Déjeuner', 'Dîner', 'Service à table', 'Livraison'],
      ambiance: ['Ambiance décontractée', 'Romantique', 'Familial'],
      specialties: ['Pizza', 'Pâtes', 'Vins italiens'],
      atmosphere: ['Cosy', 'Moderne', 'Authentique'],
      detailedServices: ['WiFi', 'Terrasse', 'Parking', 'Climatisation'],
      clienteleInfo: ['Groupes', 'Familles', 'Couples'],
      informationsPratiques: ['Réservation recommandée', 'Espace non-fumeurs'],
      activities: ['Anniversaire', 'Mariage', 'Événements privés']
    },
    {
      id: 'bar',
      name: 'Bar Test',
      activities: ['bar_cocktails'],
      services: ['Cocktails', 'Boissons', 'Snacks', 'Happy Hour'],
      ambiance: ['Ambiance décontractée', 'Festif', 'Branché'],
      specialties: ['Cocktails', 'Whisky', 'Champagne'],
      atmosphere: ['Cosy', 'Vintage', 'Industriel'],
      detailedServices: ['WiFi', 'Terrasse', 'Parking'],
      clienteleInfo: ['Groupes', 'Couples', 'Étudiants'],
      informationsPratiques: ['Réservation recommandée', 'Animaux acceptés'],
      activities: ['Concerts', 'DJ', 'Karaoké']
    },
    {
      id: 'bowling',
      name: 'Bowling Test',
      activities: ['bowling'],
      services: ['Bowling', 'Équipements', 'Encadrement'],
      ambiance: ['Ambiance décontractée', 'Festif', 'Familial'],
      specialties: ['Bowling', 'Snack-bar', 'Boissons'],
      atmosphere: ['Moderne', 'Coloré', 'Énergique'],
      detailedServices: ['Parking', 'Vestiaires', 'WiFi'],
      clienteleInfo: ['Groupes', 'Familles', 'Enfants'],
      informationsPratiques: ['Réservation obligatoire', 'Équipements fournis'],
      activities: ['Anniversaire', 'Team Building', 'Compétitions']
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
            <EstablishmentGroupedSection
              establishment={establishment}
              establishmentType={establishment.activities[0]}
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
