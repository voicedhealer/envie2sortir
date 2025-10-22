/**
 * Test d'intégration pour vérifier l'API des bons plans récurrents
 * Simule les appels API et vérifie les réponses
 */

// Simulation de l'API deals/active
const simulateApiCall = (establishmentId, deals) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  // Filtrer les bons plans selon la logique de l'API
  const activeDeals = deals.filter(deal => {
    if (!deal.isActive) return false;
    
    if (deal.isRecurring) {
      // Pour les bons plans récurrents, vérifier la date de fin de récurrence
      if (deal.recurrenceEndDate) {
        const recurrenceEnd = new Date(deal.recurrenceEndDate);
        if (now > recurrenceEnd) return false;
      }
      return true; // Actif selon leur logique
    } else {
      // Pour les bons plans non récurrents, vérifier les dates
      const dateDebut = new Date(deal.dateDebut);
      const dateFin = new Date(deal.dateFin);
      return now >= dateDebut && now <= dateFin;
    }
  });
  
  return {
    success: true,
    deals: activeDeals
  };
};

// Simulation de isDealActive
const isDealActive = (deal) => {
  if (!deal.isActive) return false;

  const now = new Date();
  
  // Pour les bons plans récurrents
  if (deal.isRecurring) {
    // Vérifier si on n'a pas dépassé la date de fin de récurrence
    if (deal.recurrenceEndDate) {
      const recurrenceEnd = new Date(deal.recurrenceEndDate);
      if (now > recurrenceEnd) {
        return false;
      }
    }
    
    // Vérifier les jours de la semaine pour la récurrence hebdomadaire
    if (deal.recurrenceType === 'weekly' && deal.recurrenceDays && deal.recurrenceDays.length > 0) {
      const currentDay = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
      const adjustedDay = currentDay === 0 ? 7 : currentDay; // Convertir dimanche de 0 à 7
      
      if (!deal.recurrenceDays.includes(adjustedDay)) {
        return false;
      }
    }
  } else {
    // Pour les bons plans non récurrents, vérifier les dates
    const dateDebut = new Date(deal.dateDebut);
    const dateFin = new Date(deal.dateFin);

    if (now < dateDebut || now > dateFin) {
      return false;
    }
  }

  // Vérifier les horaires (pour tous les types de bons plans)
  if (!deal.heureDebut && !deal.heureFin) {
    return true; // Actif toute la journée
  }

  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Si seulement heure de début définie
  if (deal.heureDebut && !deal.heureFin) {
    return currentTime >= deal.heureDebut;
  }
  
  // Si seulement heure de fin définie
  if (!deal.heureDebut && deal.heureFin) {
    return currentTime <= deal.heureFin;
  }
  
  // Si les deux heures sont définies
  return currentTime >= deal.heureDebut && currentTime <= deal.heureFin;
};

// Données de test
const testDeals = [
  {
    id: 'deal-1',
    title: 'Happy Hours',
    description: 'Bières à moitié prix',
    originalPrice: 6.80,
    discountedPrice: 3.40,
    isActive: true,
    isRecurring: true,
    recurrenceType: 'weekly',
    recurrenceDays: [1, 2, 3, 4, 5], // Lundi à Vendredi
    heureDebut: '17:00',
    heureFin: '19:00',
    dateDebut: '2024-01-01',
    dateFin: '2099-12-31'
  },
  {
    id: 'deal-2',
    title: 'Happy Hours Weekend',
    description: 'Bières à moitié prix le weekend',
    originalPrice: 6.80,
    discountedPrice: 3.40,
    isActive: true,
    isRecurring: true,
    recurrenceType: 'weekly',
    recurrenceDays: [6, 7], // Samedi et Dimanche
    heureDebut: '17:00',
    heureFin: '19:00',
    dateDebut: '2024-01-01',
    dateFin: '2099-12-31'
  },
  {
    id: 'deal-3',
    title: 'Soirée spéciale',
    description: 'Soirée à thème',
    originalPrice: 15.00,
    discountedPrice: 10.00,
    isActive: true,
    isRecurring: false,
    dateDebut: '2024-10-17',
    dateFin: '2024-10-17',
    heureDebut: '20:00',
    heureFin: '23:00'
  },
  {
    id: 'deal-4',
    title: 'Happy Hours expiré',
    description: 'Bon plan expiré',
    originalPrice: 6.80,
    discountedPrice: 3.40,
    isActive: true,
    isRecurring: true,
    recurrenceType: 'weekly',
    recurrenceDays: [1, 2, 3, 4, 5],
    recurrenceEndDate: '2024-01-01', // Expiré
    heureDebut: '17:00',
    heureFin: '19:00',
    dateDebut: '2024-01-01',
    dateFin: '2099-12-31'
  }
];

// Test d'intégration
const runIntegrationTests = () => {
  console.log('🔗 Tests d\'intégration API des bons plans récurrents\n');
  console.log('=' .repeat(60));
  
  // Test 1: Appel API
  console.log('\n1. Test de l\'API deals/active');
  console.log('-'.repeat(40));
  
  const apiResponse = simulateApiCall('establishment-1', testDeals);
  console.log(`✅ API Response: ${apiResponse.success ? 'SUCCESS' : 'ERROR'}`);
  console.log(`📊 Deals trouvés: ${apiResponse.deals.length}`);
  
  apiResponse.deals.forEach((deal, index) => {
    console.log(`   ${index + 1}. ${deal.title} (${deal.isRecurring ? 'Récurrent' : 'Ponctuel'})`);
  });
  
  // Test 2: Vérification de l'activité
  console.log('\n2. Test de isDealActive');
  console.log('-'.repeat(40));
  
  testDeals.forEach((deal, index) => {
    const isActive = isDealActive(deal);
    const status = isActive ? '🟢 ACTIF' : '🔴 INACTIF';
    console.log(`${index + 1}. ${deal.title}: ${status}`);
    
    if (deal.isRecurring) {
      console.log(`   Type: ${deal.recurrenceType}`);
      console.log(`   Jours: ${deal.recurrenceDays ? deal.recurrenceDays.join(', ') : 'N/A'}`);
      console.log(`   Horaires: ${deal.heureDebut || 'N/A'} - ${deal.heureFin || 'N/A'}`);
    } else {
      console.log(`   Date: ${deal.dateDebut} - ${deal.dateFin}`);
      console.log(`   Horaires: ${deal.heureDebut || 'N/A'} - ${deal.heureFin || 'N/A'}`);
    }
  });
  
  // Test 3: Simulation d'affichage sur la page publique
  console.log('\n3. Simulation d\'affichage sur la page publique');
  console.log('-'.repeat(40));
  
  const activeDealsForDisplay = apiResponse.deals.filter(deal => isDealActive(deal));
  console.log(`🎯 Deals à afficher: ${activeDealsForDisplay.length}`);
  
  activeDealsForDisplay.forEach((deal, index) => {
    console.log(`\n${index + 1}. ${deal.title}`);
    console.log(`   Description: ${deal.description}`);
    console.log(`   Prix: ${deal.originalPrice}€ → ${deal.discountedPrice}€`);
    
    if (deal.isRecurring) {
      if (deal.recurrenceType === 'weekly' && deal.recurrenceDays) {
        const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const selectedDays = deal.recurrenceDays.map(day => dayNames[day]);
        
        // Logique d'affichage simplifiée
        const weekdays = [1, 2, 3, 4, 5];
        const weekends = [6, 7];
        const isAllWeekdays = weekdays.every(day => deal.recurrenceDays.includes(day));
        const isAllWeekends = weekends.every(day => deal.recurrenceDays.includes(day));
        const isAllDays = isAllWeekdays && isAllWeekends;
        
        let dateDisplay;
        if (isAllDays) {
          dateDisplay = 'Tous les jours';
        } else if (isAllWeekdays && !deal.recurrenceDays.some(day => weekends.includes(day))) {
          dateDisplay = 'En semaine';
        } else if (isAllWeekends && !deal.recurrenceDays.some(day => weekdays.includes(day))) {
          dateDisplay = 'Le weekend';
        } else {
          dateDisplay = `Tous les ${selectedDays.join(', ')}`;
        }
        
        console.log(`   📅 Date: ${dateDisplay}`);
        console.log(`   ⏰ Horaires: ${deal.heureDebut} - ${deal.heureFin}`);
      }
    } else {
      console.log(`   📅 Date: ${deal.dateDebut}`);
      console.log(`   ⏰ Horaires: ${deal.heureDebut} - ${deal.heureFin}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Tests d\'intégration terminés !');
  
  // Résumé
  console.log('\n📊 Résumé:');
  console.log(`   • Total deals: ${testDeals.length}`);
  console.log(`   • Deals actifs (API): ${apiResponse.deals.length}`);
  console.log(`   • Deals à afficher: ${activeDealsForDisplay.length}`);
  console.log(`   • Deals récurrents: ${testDeals.filter(d => d.isRecurring).length}`);
  console.log(`   • Deals ponctuels: ${testDeals.filter(d => !d.isRecurring).length}`);
};

// Exécuter les tests
runIntegrationTests();





