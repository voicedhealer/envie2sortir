const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding de la base de données de test...');

  // Nettoyage de la base de données
  await prisma.etablissementTag.deleteMany({});
  await prisma.establishment.deleteMany({});
  
  // Création d'établissements de test
  const establishment1 = await prisma.establishment.create({
    data: {
      name: 'Le Bar à Pizza',
      description: 'Les meilleures pizzas de la ville, dans une ambiance conviviale.',
      latitude: 47.3220,
      longitude: 5.0415,
      status: 'APPROVED',
      horairesOuverture: { /* ... horaires valides ... */ },
      tags: {
        create: [
          { tag: { create: { name: 'pizza', poids: 9 } } },
          { tag: { create: { name: 'bar', poids: 7 } } },
        ],
      },
    },
  });

  const establishment2 = await prisma.establishment.create({
    data: {
      name: 'Le Billard Club',
      description: 'Venez jouer au billard entre amis.',
      latitude: 47.3230,
      longitude: 5.0425,
      status: 'APPROVED',
      horairesOuverture: { /* ... horaires valides ... */ },
      tags: {
        create: [
          { tag: { create: { name: 'billard', poids: 10 } } },
          { tag: { create: { name: 'bar', poids: 6 } } },
        ],
      },
    },
  });

  console.log(`✅ Seeding terminé : ${await prisma.establishment.count()} établissements créés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
