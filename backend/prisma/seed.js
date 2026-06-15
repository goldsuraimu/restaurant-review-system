const { PrismaClient } = require('@prisma/client');

const seedUsers = require('../src/db/seeds/001_seed_users');
const seedRestaurants = require('../src/db/seeds/002_seed_restaurants');
const seedReviews = require('../src/db/seeds/003_seed_reviews');
const seedOwnerReplies = require('../src/db/seeds/004_seed_owner_replies');
const seedRestaurantDrafts = require('../src/db/seeds/005_seed_restaurant_drafts');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await seedUsers(prisma);
  await seedRestaurants(prisma);
  await seedRestaurantDrafts(prisma)

  await seedReviews(prisma);
  await seedOwnerReplies(prisma);

  console.log('✅ Seed finished');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
