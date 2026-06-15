// src/db/seeds/005_seed_restaurant_drafts.js

const { v4: uuidv4 } = require('uuid')

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

function randomImage(seed) {
  return `https://picsum.photos/seed/${seed}/1200/800`
}

function buildDraftImages(seedPrefix) {
  return {
    cover: [
      randomImage(`${seedPrefix}-cover`)
    ],

    gallery: Array.from(
      {
        length: randomInt(0, 6),
      },
      (_, i) =>
        randomImage(
          `${seedPrefix}-gallery-${i}`
        )
    ),

    menu: Array.from(
      {
        length: randomInt(1, 6),
      },
      (_, i) =>
        randomImage(
          `${seedPrefix}-menu-${i}`
        )
    ),
  }
}

async function createDraftImages(
  prisma,
  restaurantDraftUuid,
  images,
  sourceType = 'DRAFT_UPLOAD'
) {
  // cover
  for (let i = 0; i < images.cover.length; i++) {
    await prisma.restaurantDraftImage.create({
      data: {
        uuid: uuidv4(),

        restaurantDraftUuid,

        type: 'cover',

        url: images.cover[i],

        sourceType,

        publicId:
          `restaurants-drafts/${restaurantDraftUuid}/cover/${i}`,

        sortOrder: i,
      },
    })
  }

  // gallery
  for (let i = 0; i < images.gallery.length; i++) {
    await prisma.restaurantDraftImage.create({
      data: {
        uuid: uuidv4(),

        restaurantDraftUuid,

        type: 'gallery',

        url: images.gallery[i],

        sourceType,

        publicId:
          `restaurants-drafts/${restaurantDraftUuid}/gallery/${i}`,

        sortOrder: i,
      },
    })
  }

  // menu
  for (let i = 0; i < images.menu.length; i++) {
    await prisma.restaurantDraftImage.create({
      data: {
        uuid: uuidv4(),

        restaurantDraftUuid,

        type: 'menu',

        url: images.menu[i],

        sourceType,

        publicId:
          `restaurants-drafts/${restaurantDraftUuid}/menu/${i}`,

        sortOrder: i,
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

        ownerUuid: ownerA.uuid,

        restaurantUuid: uuidv4(),

        name: '麵屋武藏 信義店',

        nameEn: 'Menya Musashi Xinyi',

        category: '日本料理',

        location: '台北市信義區松壽路 20 號',

        phone: '0227228899',

        description:
          '主打濃厚豚骨湯頭與炙燒叉燒拉麵。',

        status: 'PENDING',

        submittedAt: daysAgo(1),

        createdAt: daysAgo(2),

        updatedAt: daysAgo(1),
      },
    })

  await createDraftImages(
    prisma,
    ramenDraft.uuid,
    buildDraftImages('ramen-draft')
  )

  // =========================================================
  // 退件後重新送審
  // =========================================================

  const sushiDraftUuid = uuidv4()

  const sushiDraft =
    await prisma.restaurantDraft.create({
      data: {
        uuid: sushiDraftUuid,

        ownerUuid: ownerA.uuid,

        restaurantUuid: uuidv4(),

        name: '鮨川 本店',

        nameEn: 'Sushi Kawa',

        category: '日本料理',

        location: '台北市大安區仁愛路四段 88 號',

        phone: '0227012233',

        description:
          '提供每日新鮮直送握壽司與生魚片。',

        status: 'PENDING',

        reviewNote:
          '請補齊菜單照片與店內環境照。',

        rejectedAt: daysAgo(5),

        submittedAt: daysAgo(1),

        createdAt: daysAgo(7),

        updatedAt: daysAgo(1),
      },
    })

  await createDraftImages(
    prisma,
    sushiDraft.uuid,
    buildDraftImages('sushi-draft')
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

        ownerUuid: ownerA.uuid,

        restaurantUuid: uuidv4(),

        name: '晨間號 Brunch',

        nameEn: 'Morning House Brunch',

        category: '早餐',

        location: '台北市中山區民生東路二段 50 號',

        phone: '0225551122',

        description:
          '主打手作三明治與早午餐拼盤。',

        status: 'REJECTED',

        reviewNote:
          '封面圖片解析度不足。',

        rejectedAt: daysAgo(2),

        submittedAt: daysAgo(4),

        createdAt: daysAgo(5),

        updatedAt: daysAgo(2),
      },
    })

  await createDraftImages(
    prisma,
    breakfastDraft.uuid,
    buildDraftImages('breakfast-draft')
  )

  // =========================================================
  // 已發布餐廳修改中
  // =========================================================

  const published1 = restaurants[0]

  const updateDraft1 =
    await prisma.restaurantDraft.create({
      data: {
        uuid: uuidv4(),

        ownerUuid:
          published1.ownerUuid,

        restaurantUuid:
          published1.uuid,

        name:
          `${published1.name} 信義二店`,

        nameEn:
          published1.nameEn,

        category:
          published1.category,

        location:
          published1.location,

        phone:
          published1.phone,

        description:
          '新增晚餐限定菜單與套餐內容。',

        status: 'PENDING',

        submittedAt: daysAgo(1),

        createdAt: daysAgo(3),

        updatedAt: daysAgo(1),
      },
    })

  await createDraftImages(
    prisma,
    updateDraft1.uuid,
    {
      cover:
        published1.images
          .filter(
            (i) => i.type === 'cover'
          )
          .map((i) => i.url)
          .slice(0, 1),

      gallery:
        published1.images
          .filter(
            (i) =>
              i.type === 'gallery'
          )
          .map((i) => i.url),

      menu:
        published1.images
          .filter(
            (i) => i.type === 'menu'
          )
          .map((i) => i.url),
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

        ownerUuid:
          published2.ownerUuid,

        restaurantUuid:
          published2.uuid,

        name:
          published2.name,

        nameEn:
          published2.nameEn,

        category:
          published2.category,

        location:
          published2.location,

        phone:
          published2.phone,

        description:
          '新增雙人套餐與商業午餐。',

        status: 'PENDING',

        reviewNote:
          '請重新上傳封面圖片。',

        rejectedAt: daysAgo(5),

        submittedAt: daysAgo(1),

        createdAt: daysAgo(7),

        updatedAt: daysAgo(1),
      },
    })

  await createDraftImages(
    prisma,
    updateDraft2.uuid,
    buildDraftImages('update-draft-2')
  )

  // =========================================================
  // 已發布餐廳修改退件
  // =========================================================

  const published3 = restaurants[2]

  const updateDraft3 =
    await prisma.restaurantDraft.create({
      data: {
        uuid: uuidv4(),

        ownerUuid:
          published3.ownerUuid,

        restaurantUuid:
          published3.uuid,

        name:
          published3.name,

        nameEn:
          published3.nameEn,

        category:
          published3.category,

        location:
          published3.location,

        phone:
          published3.phone,

        description:
          '更新酒單與晚間現場演出資訊。',

        status: 'REJECTED',

        reviewNote:
          '菜單照片過少，請補充。',

        rejectedAt: daysAgo(2),

        submittedAt: daysAgo(4),

        createdAt: daysAgo(6),

        updatedAt: daysAgo(2),
      },
    })

  await createDraftImages(
    prisma,
    updateDraft3.uuid,
    buildDraftImages('update-draft-3')
  )

  console.log(
    '✅ Restaurant drafts seeded'
  )
}