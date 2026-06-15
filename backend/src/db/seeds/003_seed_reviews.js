const { v4: uuidv4 } = require('uuid')
const {
  generateReviewContent,
} = require('./helpers/review-content')

function randomDateWithin7Days() {
  const now = new Date()
  const past = new Date(now)
  past.setDate(now.getDate() - 7)

  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  )
}

// 評分策略
function ratingByType(type) {
  if (type === 'high') {
    return Math.random() < 0.8
      ? 4 + Math.floor(Math.random() * 2) // 4~5
      : 1 + Math.floor(Math.random() * 3)
  }

  if (type === 'low') {
    return Math.random() < 0.8
      ? 1 + Math.floor(Math.random() * 2) // 1~2
      : 3 + Math.floor(Math.random() * 3)
  }

  return 1 + Math.floor(Math.random() * 5)
}

module.exports = async function (prisma) {
  await prisma.review.deleteMany()

  const users = await prisma.user.findMany({ where: { role: 'user' } })
  const restaurants = await prisma.restaurant.findMany()

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i]

    // 👉 分類餐廳
    let type = 'normal'
    if (i % 3 === 0) type = 'high'
    if (i % 3 === 1) type = 'low'

    // 👉 決定評論數
    let reviewCount = 0

    if (i % 4 === 0) {
      reviewCount = 0 // 沒評論
    } else if (i % 4 === 1) {
      reviewCount = 20 + Math.floor(Math.random() * 10) // 20+
    } else {
      reviewCount = Math.floor(Math.random() * 10)
    }

    const shuffled = [...users].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, reviewCount)

    let ratingSum = 0

    for (const user of selected) {
      const rating = ratingByType(type)
      const createdAt = randomDateWithin7Days()

      await prisma.review.create({
        data: {
          uuid: uuidv4(),
          restaurantUuid: restaurant.uuid,
          userUuid: user.uuid,
          rating,
          content: generateReviewContent(rating),
          createdAt,
        },
      })

      ratingSum += rating
    }

    if (selected.length > 0) {
      await prisma.restaurant.update({
        where: { uuid: restaurant.uuid },
        data: {
          rating: Number((ratingSum / selected.length).toFixed(1)),
          ratingSum,
          reviewCount: selected.length,
          ratingCount: selected.length,
        },
      })
    }
  }

  console.log('✅ Reviews seeded (KPI ready)')
}