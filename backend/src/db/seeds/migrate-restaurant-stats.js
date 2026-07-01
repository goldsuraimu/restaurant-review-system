const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const restaurants = await prisma.restaurant.findMany()

  await prisma.restaurantStats.createMany({
    data: restaurants.map(r => ({
      restaurantId: r.id,
      rating: r.rating,
      ratingCount: r.ratingCount,
      reviewCount: r.reviewCount,
      ratingSum: r.ratingSum,
    })),
    skipDuplicates: true,
  })

  console.log(`Migrated ${restaurants.length} restaurant stats.`)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })