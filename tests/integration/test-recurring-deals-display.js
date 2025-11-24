/**
 * Script de test manuel pour vérifier l'affichage des bons plans récurrents
 * À exécuter dans la console du navigateur ou avec Node.js
 */

// Simulation des fonctions de formatage
const formatDealTime = (deal) => {
  if (deal.isRecurring) {
    if (deal.recurrenceType === 'weekly' && deal.recurrenceDays && deal.recurrenceDays.length > 0) {
      const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      const selectedDays = deal.recurrenceDays.map(day => dayNames[day]);
      
      if (deal.heureDebut && deal.heureFin) {
        return `Tous les ${selectedDays.join(', ')} de ${deal.heureDebut} à ${deal.heureFin}`;
      }
      return `Tous les ${selectedDays.join(', ')}`;
    }
    
    if (deal.recurrenceType === 'monthly') {
      if (deal.heureDebut && deal.heureFin) {
        return `Tous les mois de ${deal.heureDebut} à ${deal.heureFin}`;
      }
      return 'Tous les mois';
    }
    
    if (deal.heureDebut && deal.heureFin) {
      return `Tous les jours de ${deal.heureDebut} à ${deal.heureFin}`;
    }
    return 'Tous les jours';
  }
  
  // Pour les bons plans non récurrents
  const dateDebut = new Date(deal.dateDebut);
  const dateFin = new Date(deal.dateFin);
  
  const isSameDay = dateDebut.toDateString() === dateFin.toDateString();
  
  if (isSameDay) {
    const today = new Date();
    const isToday = dateDebut.toDateString() === today.toDateString();
    
    if (isToday) {
      if (deal.heureDebut && deal.heureFin) {
        return `Aujourd'hui de ${deal.heureDebut} à ${deal.heureFin}`;
      }
      return 'Aujourd\'hui';
    } else {
      const dateStr = dateDebut.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      if (deal.heureDebut && deal.heureFin) {
        return `Le ${dateStr} de ${deal.heureDebut} à ${deal.heureFin}`;
      }
      return `Le ${dateStr}`;
    }
  }
  
  const dateDebutStr = dateDebut.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long' 
  });
  const dateFinStr = dateFin.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long' 
  });
  
  return `Du ${dateDebutStr} au ${dateFinStr}`;
};

const formatDateForFront = (deal) => {
  if (deal.isRecurring) {
    if (deal.recurrenceType === 'weekly' && deal.recurrenceDays && deal.recurrenceDays.length > 0) {
      const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      const selectedDays = deal.recurrenceDays.map(day => dayNames[day]);
      
      // Grouper les jours de semaine et weekend
      const weekdays = [1, 2, 3, 4, 5]; // Lundi à Vendredi
      const weekends = [6, 7]; // Samedi et Dimanche
      
      const hasWeekdays = deal.recurrenceDays.some(day => weekdays.includes(day));
      const hasWeekends = deal.recurrenceDays.some(day => weekends.includes(day));
      
      // Vérifier si c'est exactement tous les jours de semaine
      const isAllWeekdays = weekdays.every(day => deal.recurrenceDays.includes(day));
      // Vérifier si c'est exactement tous les jours de weekend
      const isAllWeekends = weekends.every(day => deal.recurrenceDays.includes(day));
      // Vérifier si c'est tous les jours
      const isAllDays = isAllWeekdays && isAllWeekends;
      
      if (isAllDays) {
        return 'Tous les jours';
      } else if (isAllWeekdays && !hasWeekends) {
        return 'En semaine';
      } else if (isAllWeekends && !hasWeekdays) {
        return 'Le weekend';
      } else {
        return `Tous les ${selectedDays.join(', ')}`;
      }
    }
    
    if (deal.recurrenceType === 'monthly') {
      return 'Tous les mois';
    }
    
    return 'Tous les jours';
  }
  
  // Pour les bons plans non récurrents
  const startDate = new Date(deal.dateDebut);
  const day = startDate.getDate().toString().padStart(2, '0');
  const month = startDate.toLocaleDateString('fr-FR', { month: 'long' });
  const year = startDate.getFullYear();
  
  return `Le ${day} ${month} ${year}`;
};

// Données de test
const testDeals = [
  {
    name: 'Happy Hours - Tous les jours',
    deal: {
      title: 'Happy Hours',
      isRecurring: true,
      recurrenceType: 'weekly',
      recurrenceDays: [1, 2, 3, 4, 5, 6, 7], // Tous les jours
      heureDebut: '17:00',
      heureFin: '19:00',
      dateDebut: '2024-01-01'
    }
  },
  {
    name: 'Happy Hours - En semaine',
    deal: {
      title: 'Happy Hours',
      isRecurring: true,
      recurrenceType: 'weekly',
      recurrenceDays: [1, 2, 3, 4, 5], // Lundi à Vendredi
      heureDebut: '17:00',
      heureFin: '19:00',
      dateDebut: '2024-01-01'
    }
  },
  {
    name: 'Happy Hours - Weekend',
    deal: {
      title: 'Happy Hours',
      isRecurring: true,
      recurrenceType: 'weekly',
      recurrenceDays: [6, 7], // Samedi et Dimanche
      heureDebut: '17:00',
      heureFin: '19:00',
      dateDebut: '2024-01-01'
    }
  },
  {
    name: 'Happy Hours - Jours spécifiques',
    deal: {
      title: 'Happy Hours',
      isRecurring: true,
      recurrenceType: 'weekly',
      recurrenceDays: [1, 3, 5], // Lundi, Mercredi, Vendredi
      heureDebut: '17:00',
      heureFin: '19:00',
      dateDebut: '2024-01-01'
    }
  },
  {
    name: 'Happy Hours - Mensuel',
    deal: {
      title: 'Happy Hours',
      isRecurring: true,
      recurrenceType: 'monthly',
      heureDebut: '17:00',
      heureFin: '19:00',
      dateDebut: '2024-01-01'
    }
  },
  {
    name: 'Happy Hours - Sans horaires',
    deal: {
      title: 'Happy Hours',
      isRecurring: true,
      recurrenceType: 'weekly',
      recurrenceDays: [1, 2, 3, 4, 5],
      heureDebut: null,
      heureFin: null,
      dateDebut: '2024-01-01'
    }
  },
  {
    name: 'Bon plan non récurrent',
    deal: {
      title: 'Soirée spéciale',
      isRecurring: false,
      dateDebut: '2024-10-17',
      dateFin: '2024-10-17',
      heureDebut: '20:00',
      heureFin: '23:00'
    }
  }
];

// Fonction de test
const runTests = () => {
  console.log('🧪 Tests d\'affichage des bons plans récurrents\n');
  console.log('=' .repeat(60));
  
  testDeals.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('-'.repeat(40));
    
    const dateDisplay = formatDateForFront(testCase.deal);
    const timeDisplay = formatDealTime(testCase.deal);
    
    console.log(`📅 Date: "${dateDisplay}"`);
    console.log(`⏰ Horaires: "${timeDisplay}"`);
    
    // Vérification des attentes
    const expectations = {
      'Happy Hours - Tous les jours': { date: 'Tous les jours', time: 'Tous les Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche de 17:00 à 19:00' },
      'Happy Hours - En semaine': { date: 'En semaine', time: 'Tous les Lundi, Mardi, Mercredi, Jeudi, Vendredi de 17:00 à 19:00' },
      'Happy Hours - Weekend': { date: 'Le weekend', time: 'Tous les Samedi, Dimanche de 17:00 à 19:00' },
      'Happy Hours - Jours spécifiques': { date: 'Tous les Lundi, Mercredi, Vendredi', time: 'Tous les Lundi, Mercredi, Vendredi de 17:00 à 19:00' },
      'Happy Hours - Mensuel': { date: 'Tous les mois', time: 'Tous les mois de 17:00 à 19:00' },
      'Happy Hours - Sans horaires': { date: 'En semaine', time: 'Tous les Lundi, Mardi, Mercredi, Jeudi, Vendredi' },
      'Bon plan non récurrent': { date: 'Le 17 octobre 2024', time: 'Le jeudi 17 octobre de 20:00 à 23:00' }
    };
    
    const expected = expectations[testCase.name];
    if (expected) {
      const dateMatch = dateDisplay === expected.date;
      const timeMatch = timeDisplay === expected.time;
      
      console.log(`✅ Date: ${dateMatch ? 'CORRECT' : 'ERREUR'}`);
      console.log(`✅ Horaires: ${timeMatch ? 'CORRECT' : 'ERREUR'}`);
      
      if (!dateMatch) {
        console.log(`   Attendu: "${expected.date}"`);
        console.log(`   Reçu: "${dateDisplay}"`);
      }
      if (!timeMatch) {
        console.log(`   Attendu: "${expected.time}"`);
        console.log(`   Reçu: "${timeDisplay}"`);
      }
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Tests terminés !');
};

// Exécuter les tests
if (typeof window !== 'undefined') {
  // Dans le navigateur
  console.log('Exécution des tests dans le navigateur...');
  runTests();
} else {
  // Dans Node.js
  runTests();
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, formatDealTime, formatDateForFront };
}
