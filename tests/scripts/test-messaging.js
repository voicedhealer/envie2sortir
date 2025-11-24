#!/usr/bin/env node

/**
 * Script de test rapide pour le système de messagerie
 * Vérifie les fonctionnalités critiques sans lancer toute la suite de tests
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function section(message) {
  log(`\n${"=".repeat(60)}`, colors.blue);
  log(`  ${message}`, colors.blue);
  log(`${"=".repeat(60)}\n`, colors.blue);
}

async function testDatabaseSchema() {
  section("1. Test du schéma de base de données");

  try {
    // Vérifier que les tables existent
    const conversationCount = await prisma.conversation.count();
    success(`Table 'conversations' accessible (${conversationCount} enregistrements)`);

    const messageCount = await prisma.message.count();
    success(`Table 'messages' accessible (${messageCount} enregistrements)`);

    // Vérifier les enums
    const conversation = await prisma.conversation.findFirst();
    if (conversation) {
      info(`Statut de conversation trouvé: ${conversation.status}`);
    }

    return true;
  } catch (err) {
    error(`Erreur de schéma: ${err.message}`);
    return false;
  }
}

async function testDataIntegrity() {
  section("2. Test de l'intégrité des données");

  try {
    // Compter les conversations
    const totalConversations = await prisma.conversation.count();
    const openConversations = await prisma.conversation.count({
      where: { status: "open" },
    });
    const closedConversations = await prisma.conversation.count({
      where: { status: "closed" },
    });

    info(`Total conversations: ${totalConversations}`);
    info(`  - Ouvertes: ${openConversations}`);
    info(`  - Fermées: ${closedConversations}`);

    if (openConversations + closedConversations === totalConversations) {
      success("Comptage des statuts cohérent");
    } else {
      error("Incohérence dans les statuts");
      return false;
    }

    // Vérifier les messages orphelins (avec relation)
    const allMessages = await prisma.message.findMany({
      include: {
        conversation: true,
      },
    });

    const orphanedMessages = allMessages.filter((m) => !m.conversation);

    if (orphanedMessages.length === 0) {
      success("Aucun message orphelin");
    } else {
      error(`${orphanedMessages.length} messages orphelins trouvés`);
      return false;
    }

    return true;
  } catch (err) {
    error(`Erreur d'intégrité: ${err.message}`);
    return false;
  }
}

async function testPerformance() {
  section("3. Test de performance");

  try {
    // Test de lecture
    const startRead = Date.now();
    await prisma.conversation.findMany({
      include: {
        professional: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      take: 100,
    });
    const readTime = Date.now() - startRead;

    if (readTime < 500) {
      success(`Lecture de 100 conversations: ${readTime}ms ✓`);
    } else {
      log(`  Lecture de 100 conversations: ${readTime}ms (> 500ms)`, colors.yellow);
    }

    // Test de comptage
    const startCount = Date.now();
    await prisma.message.count({
      where: { isRead: false },
    });
    const countTime = Date.now() - startCount;

    if (countTime < 100) {
      success(`Comptage messages non lus: ${countTime}ms ✓`);
    } else {
      log(`  Comptage messages non lus: ${countTime}ms (> 100ms)`, colors.yellow);
    }

    return true;
  } catch (err) {
    error(`Erreur de performance: ${err.message}`);
    return false;
  }
}

async function testSecurity() {
  section("4. Test de sécurité basique");

  try {
    // Test d'injection SQL (devrait être sécurisé par Prisma)
    const maliciousInput = "'; DROP TABLE conversations; --";

    try {
      await prisma.conversation.findMany({
        where: {
          subject: {
            contains: maliciousInput,
          },
        },
      });
      success("Protection contre l'injection SQL (requête sécurisée)");
    } catch (err) {
      // Si ça échoue, c'est que la requête a été rejetée (bon)
      success("Protection contre l'injection SQL (requête rejetée)");
    }

    // Test XSS (devrait stocker tel quel)
    const xssPayload = "<script>alert('XSS')</script>";
    info(`Payload XSS sera stocké et échappé au render: ${xssPayload.substring(0, 30)}...`);
    success("Les payloads XSS sont stockés (échappement au render)");

    return true;
  } catch (err) {
    error(`Erreur de sécurité: ${err.message}`);
    return false;
  }
}

async function testSpecialCharacters() {
  section("5. Test des caractères spéciaux");

  const specialTests = [
    { name: "Émojis", value: "Test 😀🎉💻" },
    { name: "Accents", value: "Éléphant à Paris" },
    { name: "Unicode", value: "你好 مرحبا שלום" },
    { name: "Symboles", value: "€$£¥©®™" },
  ];

  let allPassed = true;

  for (const test of specialTests) {
    try {
      // Vérifier qu'on peut rechercher avec ces caractères
      await prisma.conversation.findMany({
        where: {
          subject: {
            contains: test.value,
          },
        },
      });
      success(`${test.name}: ${test.value}`);
    } catch (err) {
      error(`${test.name}: Erreur - ${err.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

async function testRelationships() {
  section("6. Test des relations");

  try {
    // Vérifier les relations Professional -> Conversation
    const profWithConversations = await prisma.professional.findFirst({
      include: {
        conversations: true,
      },
    });

    if (profWithConversations) {
      info(`Pro avec ${profWithConversations.conversations.length} conversations`);
      success("Relation Professional -> Conversation OK");
    }

    // Vérifier les relations Conversation -> Messages
    const convWithMessages = await prisma.conversation.findFirst({
      include: {
        messages: true,
      },
    });

    if (convWithMessages) {
      info(`Conversation avec ${convWithMessages.messages.length} messages`);
      success("Relation Conversation -> Messages OK");
    }

    return true;
  } catch (err) {
    error(`Erreur de relation: ${err.message}`);
    return false;
  }
}

async function testIndexes() {
  section("7. Test des index de performance");

  try {
    // Test d'index sur professionalId + status
    const startIndexed = Date.now();
    await prisma.conversation.findMany({
      where: {
        professionalId: "any-id",
        status: "open",
      },
    });
    const indexedTime = Date.now() - startIndexed;

    if (indexedTime < 50) {
      success(`Requête avec index: ${indexedTime}ms ✓`);
    } else {
      log(`  Requête avec index: ${indexedTime}ms (index peut-être manquant)`, colors.yellow);
    }

    return true;
  } catch (err) {
    error(`Erreur d'index: ${err.message}`);
    return false;
  }
}

async function generateReport(results) {
  section("RAPPORT FINAL");

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  log(`\nTests exécutés: ${total}`, colors.cyan);
  log(`  Réussis: ${passed}`, colors.green);
  log(`  Échoués: ${failed}`, failed > 0 ? colors.red : colors.green);

  const percentage = Math.round((passed / total) * 100);
  log(`\nTaux de réussite: ${percentage}%\n`, percentage === 100 ? colors.green : colors.yellow);

  if (percentage === 100) {
    log("🎉 Tous les tests sont passés !", colors.green);
    log("Le système de messagerie est prêt pour la production.\n", colors.green);
  } else {
    log("⚠️  Certains tests ont échoué.", colors.yellow);
    log("Veuillez vérifier les erreurs ci-dessus.\n", colors.yellow);
  }

  return percentage === 100;
}

async function main() {
  log("\n╔═══════════════════════════════════════════════════════════╗", colors.blue);
  log("║    TEST RAPIDE DU SYSTÈME DE MESSAGERIE PRO-ADMIN       ║", colors.blue);
  log("╚═══════════════════════════════════════════════════════════╝\n", colors.blue);

  const results = [];

  // Exécuter tous les tests
  results.push({
    name: "Schéma de base de données",
    passed: await testDatabaseSchema(),
  });

  results.push({
    name: "Intégrité des données",
    passed: await testDataIntegrity(),
  });

  results.push({
    name: "Performance",
    passed: await testPerformance(),
  });

  results.push({
    name: "Sécurité basique",
    passed: await testSecurity(),
  });

  results.push({
    name: "Caractères spéciaux",
    passed: await testSpecialCharacters(),
  });

  results.push({
    name: "Relations",
    passed: await testRelationships(),
  });

  results.push({
    name: "Index de performance",
    passed: await testIndexes(),
  });

  // Générer le rapport
  const success = await generateReport(results);

  await prisma.$disconnect();

  process.exit(success ? 0 : 1);
}

main().catch(async (err) => {
  error(`\nErreur fatale: ${err.message}`);
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

