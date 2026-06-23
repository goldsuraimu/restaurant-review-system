const { v4: uuidv4 } = require('uuid');
const {
  restaurants,
} = require('./data/restaurants')

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME

function cloudinaryUrl(publicId) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`
}

module.exports = async function seedRestaurants(prisma) {
  
  await prisma.restaurantDraftImage.deleteMany()
  await prisma.restaurantDraft.deleteMany()

  // 注意順序，有 FK，先刪子表再刪父表
  await prisma.restaurantImage.deleteMany();
  await prisma.restaurant.deleteMany();

  // 取得所有的業者
  const owners = await prisma.user.findMany({
    where: { role: 'owner' }
  });

  if (owners.length < 3) throw new Error('Not enough owners for seeding');

  const ownerA = owners[0]; // 業者A
  const ownerB = owners[1]; // 業者B
  const ownerC = owners[2]; // 業者C

  // 我們將餐廳分配給這三個業者
  const restaurantsForOwnerA = restaurants.slice(0, Math.floor(restaurants.length / 3));
  const restaurantsForOwnerB = restaurants.slice(Math.floor(restaurants.length / 3), Math.floor((2 * restaurants.length) / 3));
  const restaurantsForOwnerC = restaurants.slice(Math.floor((2 * restaurants.length) / 3));

  // 為業者A創建餐廳
  await createRestaurantsForOwner(prisma, restaurantsForOwnerA, ownerA);

  // 為業者B創建餐廳
  await createRestaurantsForOwner(prisma, restaurantsForOwnerB, ownerB);

  // 為業者C創建餐廳
  await createRestaurantsForOwner(prisma, restaurantsForOwnerC, ownerC);

  console.log('✅ Restaurants seeded successfully');
};

// Helper function to create restaurants for a specific owner
async function createRestaurantsForOwner(prisma, restaurants, owner) {
  for (const r of restaurants) {
    const restaurantUuid = uuidv4();

    const restaurant = await prisma.restaurant.create({
      data: {
        uuid: restaurantUuid,
        ownerUuid: owner.uuid,
        name: r.name,
        nameEn: r.name_en || null,
        category: r.category,
        location: r.location || null,
        phone: r.phone || null,
        description: r.description || null,
      },
    });


    await createRestaurantImages(
      prisma,
      restaurant.uuid,
      r.images
    )
  }
}

async function createRestaurantImages(
  prisma,
  restaurantUuid,
  images
) {

  if (!images) return

  // =====================================================
  // cover
  // =====================================================

  if (images.cover) {

    await prisma.restaurantImage.create({
      data: {

        uuid: uuidv4(),

        restaurantUuid,

        type: 'cover',

        url: cloudinaryUrl(images.cover),

        publicId: images.cover,

        sortOrder: 0,
      },
    })
  }

  // =====================================================
  // gallery
  // =====================================================

  for (
    let i = 0;
    i < (images.gallery || []).length;
    i++
  ) {

    await prisma.restaurantImage.create({
      data: {

        uuid: uuidv4(),

        restaurantUuid,

        type: 'gallery',

        url: cloudinaryUrl(images.gallery[i]),

        publicId: images.gallery[i],

        sortOrder: i + 1,
      },
    })
  }

  // =====================================================
  // menu
  // =====================================================

  for (
    let i = 0;
    i < (images.menu || []).length;
    i++
  ) {

    await prisma.restaurantImage.create({
      data: {

        uuid: uuidv4(),

        restaurantUuid,

        type: 'menu',

        url:
          cloudinaryUrl(images.menu[i]),

        publicId: images.menu[i],

        sortOrder: i + 1,
      },
    })
  }
}