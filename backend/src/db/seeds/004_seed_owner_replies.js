const { v4: uuidv4 } = require('uuid')
const {
  generateReplyContent,
} = require('./helpers/review-content')

function addHours(date, h) {
  const d = new Date(date)
  return new Date(d.getTime() + h * 60 * 60 * 1000)
}

module.exports = async function (prisma) {
  await prisma.reviewReply.deleteMany()

  const reviews = await prisma.review.findMany({
    include: { restaurant: true },
  })

  const restaurants = await prisma.restaurant.findMany()

  // 👉 assign owner type
  const ownerTypeMap = {}

  restaurants.forEach((r, i) => {
    if (i % 3 === 0) ownerTypeMap[r.uuid] = 'fast'
    else if (i % 3 === 1) ownerTypeMap[r.uuid] = 'slow'
    else ownerTypeMap[r.uuid] = 'random'
  })

  for (const review of reviews) {
    const type = ownerTypeMap[review.restaurantUuid]

    let shouldReply = false
    let replyDelayHours = 0

    if (type === 'fast') {
      shouldReply = true
      replyDelayHours = Math.random() * 1 // 平均1小時內
    }

    if (type === 'slow') {
      shouldReply = Math.random() < 0.3
      replyDelayHours = Math.random() * 72 // 最多3天
    }

    if (type === 'random') {
      shouldReply = Math.random() < 0.6
      replyDelayHours = Math.random() * 24
    }

    if (!shouldReply) continue

    const replyTime = addHours(review.createdAt, replyDelayHours)

    await prisma.reviewReply.create({
      data: {
        uuid: uuidv4(),
        reviewUuid: review.uuid,
        content: generateReplyContent(
          review.rating
        ),
        createdAt: replyTime,
      },
    })
  }

  console.log('✅ Replies seeded (KPI ready)')
}