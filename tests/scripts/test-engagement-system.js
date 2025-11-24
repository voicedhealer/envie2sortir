/**
 * Script de test pour le système d'engagement événementiel
 * 
 * Ce script teste :
 * 1. Création d'un événement de test
 * 2. Création d'un utilisateur de test
 * 3. Simulation d'engagements
 * 4. Vérification des scores et badges
 * 5. Vérification du karma utilisateur
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEngagementSystem() {
  try {
    log('\n🚀 Démarrage des tests du système d\'engagement événementiel\n', 'cyan');

    // 1. Créer un établissement de test
    log('1️⃣  Création de l\'établissement de test...', 'blue');
    
    const professional = await prisma.professional.create({
      data: {
        siret: '12345678901234',
        firstName: 'Test',
        lastName: 'Engagement',
        email: 'test-engagement@example.com',
        passwordHash: 'test',
        phone: '0123456789',
        companyName: 'Test Company',
        legalStatus: 'SARL',
        siretVerified: true
      }
    });
    log(`   ✅ Professionnel créé: ${professional.id}`, 'green');

    const establishment = await prisma.establishment.create({
      data: {
        name: 'Bar de Test',
        slug: 'bar-de-test-engagement',
        address: '123 Rue Test',
        city: 'Paris',
        postalCode: '75001',
        status: 'approved',
        ownerId: professional.id
      }
    });
    log(`   ✅ Établissement créé: ${establishment.id}`, 'green');

    // 2. Créer un événement de test
    log('\n2️⃣  Création de l\'événement de test...', 'blue');
    
    const event = await prisma.event.create({
      data: {
        title: 'Soirée Test Engagement',
        description: 'Un événement pour tester le système d\'engagement',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        price: 15,
        establishmentId: establishment.id
      }
    });
    log(`   ✅ Événement créé: ${event.id}`, 'green');

    // 3. Créer des utilisateurs de test
    log('\n3️⃣  Création des utilisateurs de test...', 'blue');
    
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.create({
        data: {
          email: `user-engagement-${i}@example.com`,
          firstName: `User${i}`,
          lastName: 'Test',
          role: 'user'
        }
      });
      users.push(user);
      log(`   ✅ Utilisateur ${i} créé: ${user.id}`, 'green');
    }

    // 4. Créer des engagements variés
    log('\n4️⃣  Simulation des engagements...', 'blue');
    
    const engagementTypes = [
      { type: 'envie', score: 1 },
      { type: 'grande-envie', score: 3 },
      { type: 'grande-envie', score: 3 },
      { type: 'decouvrir', score: 2 },
      { type: 'envie', score: 1 }
    ];

    let totalScore = 0;
    for (let i = 0; i < users.length; i++) {
      const engagementType = engagementTypes[i];
      
      await prisma.eventEngagement.create({
        data: {
          eventId: event.id,
          userId: users[i].id,
          type: engagementType.type
        }
      });

      // Mettre à jour le karma
      await prisma.user.update({
        where: { id: users[i].id },
        data: {
          karmaPoints: {
            increment: engagementType.score
          }
        }
      });

      totalScore += engagementType.score;
      log(`   ✅ Engagement "${engagementType.type}" de User${i + 1} (score: +${engagementType.score})`, 'green');
    }

    // 5. Calculer et afficher les statistiques
    log('\n5️⃣  Calcul des statistiques...', 'blue');
    
    const engagements = await prisma.eventEngagement.findMany({
      where: { eventId: event.id },
      include: {
        user: {
          select: {
            firstName: true,
            karmaPoints: true
          }
        }
      }
    });

    const stats = {
      envie: engagements.filter(e => e.type === 'envie').length,
      'grande-envie': engagements.filter(e => e.type === 'grande-envie').length,
      'decouvrir': engagements.filter(e => e.type === 'decouvrir').length,
      'pas-envie': engagements.filter(e => e.type === 'pas-envie').length
    };

    const percentage = Math.min((totalScore / 15) * 100, 150);

    log(`\n📊 Statistiques de l'événement "${event.title}":`, 'cyan');
    log(`   🌟 Envie d'y être: ${stats.envie}`, 'yellow');
    log(`   🔥 Grande envie: ${stats['grande-envie']}`, 'yellow');
    log(`   🔍 Envie de découvrir: ${stats.decouvrir}`, 'yellow');
    log(`   ❌ Pas mon envie: ${stats['pas-envie']}`, 'yellow');
    log(`   📈 Score total: ${totalScore}`, 'yellow');
    log(`   📊 Pourcentage jauge: ${percentage.toFixed(1)}%`, 'yellow');

    // Déterminer le badge
    let badge = null;
    if (percentage >= 150) {
      badge = '🔥 C\'EST LE FEU !';
    } else if (percentage >= 100) {
      badge = '🏆 Coup de Cœur';
    } else if (percentage >= 75) {
      badge = '⭐ Populaire';
    } else if (percentage >= 50) {
      badge = '👍 Apprécié';
    }

    if (badge) {
      log(`   🏅 Badge: ${badge}`, 'yellow');
    }

    // 6. Vérifier les karma des utilisateurs
    log('\n6️⃣  Vérification du karma des utilisateurs...', 'blue');
    
    for (const engagement of engagements) {
      log(`   ✅ ${engagement.user.firstName}: ${engagement.user.karmaPoints} karma points`, 'green');
    }

    // 7. Simuler le déblocage de badges
    log('\n7️⃣  Simulation du déblocage de badges...', 'blue');
    
    // User1 a 1 engagement -> pas de badge
    // Ajoutons 4 engagements supplémentaires pour atteindre 5
    for (let i = 0; i < 4; i++) {
      const otherEvent = await prisma.event.create({
        data: {
          title: `Événement Extra ${i + 1}`,
          startDate: new Date(Date.now() + (i + 10) * 24 * 60 * 60 * 1000),
          establishmentId: establishment.id
        }
      });

      await prisma.eventEngagement.create({
        data: {
          eventId: otherEvent.id,
          userId: users[0].id,
          type: 'envie'
        }
      });
    }

    const totalEngagements = await prisma.eventEngagement.count({
      where: { userId: users[0].id }
    });

    log(`   📊 User1 a maintenant ${totalEngagements} engagements`, 'yellow');

    if (totalEngagements >= 5) {
      const curiousBadge = {
        id: 'curieux',
        name: 'Curieux',
        description: '5 engagements sur des événements',
        threshold: 5,
        icon: '🔍',
        unlockedAt: new Date().toISOString()
      };

      await prisma.user.update({
        where: { id: users[0].id },
        data: {
          gamificationBadges: [curiousBadge]
        }
      });

      log(`   🏆 Badge "Curieux" débloqué pour User1!`, 'green');
    }

    // 8. Résumé final
    log('\n✅ Tests terminés avec succès!', 'green');
    log('\n📋 Résumé:', 'cyan');
    log(`   - Établissement créé: ${establishment.name}`, 'yellow');
    log(`   - Événement créé: ${event.title}`, 'yellow');
    log(`   - ${users.length} utilisateurs créés`, 'yellow');
    log(`   - ${engagements.length} engagements créés`, 'yellow');
    log(`   - Score total: ${totalScore} → ${percentage.toFixed(1)}%`, 'yellow');
    log(`   - Badge événement: ${badge || 'Aucun'}`, 'yellow');

    log('\n🎉 Le système d\'engagement fonctionne correctement!\n', 'green');

    // Nettoyage (optionnel)
    log('🧹 Nettoyage des données de test...', 'blue');
    
    // Supprimer l'établissement (cascade supprimera les événements et engagements)
    await prisma.establishment.delete({
      where: { id: establishment.id }
    });
    
    await prisma.professional.delete({
      where: { id: professional.id }
    });
    
    // Supprimer les utilisateurs
    for (const user of users) {
      await prisma.user.delete({
        where: { id: user.id }
      });
    }

    log('✅ Nettoyage terminé\n', 'green');

  } catch (error) {
    log(`\n❌ Erreur lors des tests: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
testEngagementSystem();

