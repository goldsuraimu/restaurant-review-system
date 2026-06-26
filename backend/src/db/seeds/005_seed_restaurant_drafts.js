const { v4: uuidv4 } = require('uuid')

const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME

function cloudinaryUrl(publicId) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`
}

function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function randomInt(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min
}

function getCoverImage(slug) {
  return `restaurants/${slug}/cover`
}

function getRandomUniqueImages(
  folder,
  maxImageNumber,
  count
) {
  const numbers = Array.from(
    { length: maxImageNumber },
    (_, i) => i + 1
  )

  const shuffled = numbers.sort(
    () => Math.random() - 0.5
  )

  return shuffled
    .slice(0, count)
    .map((num) =>
      `restaurants/gallery/${folder}-${num}`
    )
}

function getRandomMenus(count) {
  const numbers = Array.from(
    { length: 25 },
    (_, i) => i + 1
  )

  const shuffled = numbers.sort(
    () => Math.random() - 0.5
  )

  return shuffled
    .slice(0, count)
    .map((num) =>
      `menu-${num}`
    )
}


function buildRandomImages() {

  const interiorCount = randomInt(1, 3)

  const foodCount = randomInt(1, 4)

  const drinkCount = randomInt(1, 3)

  const menuCount = randomInt(1, 10)

  return {
    cover: getCoverImage('cover'),

    gallery: [
      ...getRandomUniqueImages(
        "interior",
        12,
        interiorCount
      ),

      ...getRandomUniqueImages(
        "food",
        23,
        foodCount
      ),

      ...getRandomUniqueImages(
        "drink",
        16,
        drinkCount
      ),
    ].sort(() => Math.random() - 0.5),

    menu: getRandomMenus(menuCount),
  }
}

async function createDraftImages(
  prisma,
  restaurantDraftUuid,
  images,
  sourceType = 'DRAFT_UPLOAD'
) {
  // cover
  await prisma.restaurantDraftImage.create({
    data: {
      uuid: uuidv4(),
      type: 'cover',
      url: cloudinaryUrl(images.cover),
      sourceType,
      publicId: images.cover,
      sortOrder: 0,
      restaurantDraft: {
        connect: { uuid: restaurantDraftUuid }
      }
    },
  })

  // gallery
  for (let i = 0; i < images.gallery.length; i++) {
    await prisma.restaurantDraftImage.create({
      data: {
        uuid: uuidv4(),
        type: 'gallery',
        url: cloudinaryUrl(images.gallery[i]),
        sourceType,
        publicId: images.gallery[i],
        sortOrder: i,
        restaurantDraft: {
          connect: { uuid: restaurantDraftUuid }
        }
      },
    })
  }

  // menu
  for (let i = 0; i < images.menu.length; i++) {
    await prisma.restaurantDraftImage.create({
      data: {
        uuid: uuidv4(),
        type: 'menu',
        url: cloudinaryUrl(images.menu[i]),
        sourceType,
        publicId: images.menu[i],
        sortOrder: i,
        restaurantDraft: {
          connect: { uuid: restaurantDraftUuid }
        }
      },
    })
  }
}

module.exports = async function (prisma) {
  await prisma.restaurantDraftImage.deleteMany()

  await prisma.restaurantDraft.deleteMany()

  const owners = await prisma.user.findMany({
    where: {
      role: 'owner',
    },
  })

  const restaurants =
    await prisma.restaurant.findMany({
      include: {
        images: true,
      },
    })

  const ownerA = owners[0]

  // =========================================================
  // 初次建立送審
  // =========================================================

  const ramenDraftUuid = uuidv4()

  const ramenDraft =
    await prisma.restaurantDraft.create({
      data: {
        uuid: ramenDraftUuid,
        restaurantUuid: uuidv4(),
        name: '麵屋武藏 信義店',
        nameEn: 'Menya Musashi Xinyi',
        category: '日本料理',
        location: '台北市信義區松壽路 20 號',
        phone: '0227228899',
        description: '主打濃厚豚骨湯頭與炙燒叉燒拉麵。',
        status: 'PENDING',
        submittedAt: daysAgo(1),
        createdAt: daysAgo(2),
        updatedAt: daysAgo(1),
        owner: {
          connect: { uuid: ownerA.uuid }
        }
      },
    })

  await createDraftImages(
    prisma,
    ramenDraft.uuid,
    buildRandomImages('menya')
  )

  // =========================================================
  // 退件後重新送審
  // =========================================================

  const sushiDraftUuid = uuidv4()

  const sushiDraft =
    await prisma.restaurantDraft.create({
      data: {
        uuid: sushiDraftUuid,
        restaurantUuid: uuidv4(),
        name: '鮨川 本店',
        nameEn: 'Sushi Kawa',
        category: '日本料理',
        location: '台北市大安區仁愛路四段 88 號',
        phone: '0227012233',
        description: '提供每日新鮮直送握壽司與生魚片。',
        status: 'PENDING',
        reviewNote: '請補齊菜單照片與店內環境照。',
        rejectedAt: daysAgo(5),
        submittedAt: daysAgo(1),
        createdAt: daysAgo(7),
        updatedAt: daysAgo(1),
        owner: {
          connect: { uuid: ownerA.uuid }
        }
      },
    })

  await createDraftImages(
    prisma,
    sushiDraft.uuid,
    buildRandomImages('sushi-kawa')
  )

  // =========================================================
  // 已退件
  // =========================================================

  const breakfastDraftUuid =
    uuidv4()

  const breakfastDraft =
    await prisma.restaurantDraft.create({
      data: {
        uuid: breakfastDraftUuid,
        restaurantUuid: uuidv4(),
        name: '晨間號 Brunch',
        nameEn: 'Morning House Brunch',
        category: '早餐',
        location: '台北市中山區民生東路二段 50 號',
        phone: '0225551122',
        description: '主打手作三明治與早午餐拼盤。',
        status: 'REJECTED',
        reviewNote: '封面圖片解析度不足。',
        rejectedAt: daysAgo(2),
        submittedAt: daysAgo(4),
        createdAt: daysAgo(5),
        updatedAt: daysAgo(2),
        owner: {
          connect: { uuid: ownerA.uuid }
        }
      },
    })

  await createDraftImages(
    prisma,
    breakfastDraft.uuid,
    buildRandomImages('morning-house')
  )

  // =========================================================
  // 已發布餐廳修改中
  // =========================================================

  const published1 = restaurants[0]

  const updateDraft1 =
    await prisma.restaurantDraft.create({
      data: {
        uuid: uuidv4(),
        restaurantUuid: published1.uuid,
        name: `${published1.name} 信義二店`,
        nameEn: published1.nameEn,
        category: published1.category,
        location: published1.location,
        phone: published1.phone,
        description: '新增晚餐限定菜單與套餐內容。',
        status: 'PENDING',
        submittedAt: daysAgo(1),
        createdAt: daysAgo(3),
        updatedAt: daysAgo(1),
        owner: {
          connect: { id: published1.userId }
        }
      },
    })

  await createDraftImages(
    prisma,
    updateDraft1.uuid,
    {
      cover: published1.images
        .filter((i) => i.type === 'cover')
        .map((i) => i.publicId)
        .slice(0, 1)[0],

      gallery: published1.images
        .filter((i) => i.type === 'gallery')
        .map((i) => i.publicId),

      menu: published1.images
        .filter((i) => i.type === 'menu')
        .map((i) => i.publicId),
    },
    'PUBLISHED'
  )

  // =========================================================
  // 已發布餐廳重新送審
  // =========================================================

  const published2 = restaurants[1]

  const updateDraft2 =
    await prisma.restaurantDraft.create({
      data: {
        uuid: uuidv4(),
        restaurantUuid: published2.uuid,
        name: published2.name,
        nameEn: published2.nameEn,
        category: published2.category,
        location: published2.location,
        phone: published2.phone,
        description: '新增雙人套餐與商業午餐。',
        status: 'PENDING',
        reviewNote: '請重新上傳封面圖片。',
        rejectedAt: daysAgo(5),
        submittedAt: daysAgo(1),
        createdAt: daysAgo(7),
        updatedAt: daysAgo(1),
        owner: {
          connect: { id: published2.userId }
        }
      },
    })

  await createDraftImages(
    prisma,
    updateDraft2.uuid,
    {
      cover: published2.images
        .filter((i) => i.type === 'cover')
        .map((i) => i.publicId)
        .slice(0, 1)[0],

      gallery: published2.images
        .filter((i) => i.type === 'gallery')
        .map((i) => i.publicId),

      menu: published2.images
        .filter((i) => i.type === 'menu')
        .map((i) => i.publicId),
    },
    'PUBLISHED'
  )

  // =========================================================
  // 已發布餐廳修改退件
  // =========================================================

  const published3 = restaurants[2]

  const updateDraft3 =
    await prisma.restaurantDraft.create({
      data: {
        uuid: uuidv4(),
        restaurantUuid: published3.uuid,
        name: published3.name,
        nameEn: published3.nameEn,
        category: published3.category,
        location: published3.location,
        phone: published3.phone,
        description: '更新酒單與晚間現場演出資訊。',
        status: 'REJECTED',
        reviewNote: '菜單照片過少，請補充。',
        rejectedAt: daysAgo(2),
        submittedAt: daysAgo(4),
        createdAt: daysAgo(6),
        updatedAt: daysAgo(2),
        owner: {
          connect: { id: published3.userId }
        }
      },
    })

  await createDraftImages(
    prisma,
    updateDraft3.uuid,
    {
      cover: published3.images
        .filter((i) => i.type === 'cover')
        .map((i) => i.publicId)
        .slice(0, 1)[0],

      gallery: published3.images
        .filter((i) => i.type === 'gallery')
        .map((i) => i.publicId),

      menu: published3.images
        .filter((i) => i.type === 'menu')
        .map((i) => i.publicId),
    },
    'PUBLISHED'
  )

  console.log(
    '✅ Restaurant drafts seeded'
  )
}