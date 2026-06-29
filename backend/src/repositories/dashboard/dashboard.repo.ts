import { prisma } from '#/db/prisma'

import type { DBClient } from '#/types/database'


// 餐廳數量
export async function countOwnerRestaurants(
  ownerUuid: string,
  client: DBClient = prisma
) {
  return client.restaurant.count({
    where: { 
      owner: { uuid: ownerUuid } 
     }
  })
}

// 待回覆評論數
export async function countUnrepliedReviews(
  ownerUuid: string,
  client: DBClient = prisma
) {
  return client.review.count({
    where: {
      restaurant: {
        owner: { uuid: ownerUuid }
      },
      reply: null
    }
  })
} 

// 今日評論數
export async function countTodayReviews(
  ownerUuid: string,
  startOfToday: Date, 
  startOfNextDay: Date,
  client: DBClient = prisma
) {
  return client.review.count({
    where: {
      restaurant: {
        owner: { uuid: ownerUuid }
      },
      createdAt: {
        gte: startOfToday,
        lt: startOfNextDay
      }
    }
  })
}

// 平均評分
export async function getAverageRating(
  ownerUuid: string,
  client: DBClient = prisma
) {
  const result = await client.restaurant.aggregate({
    where: {
      owner: { uuid: ownerUuid },
      rating: { not: null }
    },
    _avg: {
      rating: true
    }
  })

  return result._avg.rating ?? null
}

// 回覆率
export async function getReplyRate(
  ownerUuid: string,
  client: DBClient = prisma
) {
  const total = await client.review.count({
    where: {
      restaurant: { owner: { uuid: ownerUuid } }
    }
  })

  const replied = await client.review.count({
    where: {
      restaurant: { owner: { uuid: ownerUuid } },
      reply: {
        isNot: null
      }
    }
  })

  return total === 0 ? null : replied / total
}

export async function getReviewTrend(
  ownerUuid: string,
  since: number,
  until: number,
  client: DBClient = prisma
) {
  const sinceSec = since / 1000
  const untilSec = until / 1000

  const rows = await client.$queryRaw<{ day_index: number; count: number }[]>`
    SELECT
      CAST((EXTRACT(EPOCH FROM r."createdAt") - ${sinceSec}) / 86400 AS INTEGER) as day_index,
      COUNT(*) as "count"
    FROM "Review" r
    JOIN "Restaurant" res ON r."restaurantId" = res."id"
    JOIN "User" u ON res."userId" = u."id"
    WHERE u."uuid" = ${ownerUuid}
    AND EXTRACT(EPOCH FROM r."createdAt") >= ${sinceSec}
    AND EXTRACT(EPOCH FROM r."createdAt") < ${untilSec}
    GROUP BY day_index
    ORDER BY day_index
    `

  return rows.map(row => ({
    date: Number(row.day_index),
    count: Number(row.count)
  }))

}


// 餐廳評分分布（ratingDistribution）
export async function findTopOwnerRestaurantsByBayesian(
  ownerUuid: string,
  limit = 5,
  client: DBClient = prisma
) {
  const avgResult = await client.restaurant.aggregate({
    where: {
      owner: { uuid: ownerUuid },
      rating: { not: null }
    },
    _avg: {
      rating: true
    }
  })

  const C = avgResult._avg.rating ?? 0
  const m = 10

  const rawRows = await client.$queryRaw<
    {
      restaurantUuid: string
      restaurantName: string
      avgRating: number
      reviewCount: number
    }[]
  >`
    SELECT
      r."uuid" as "restaurantUuid",
      r."name" as "restaurantName",
      r."rating" as "avgRating",
      r."reviewCount" as "reviewCount"
    FROM "Restaurant" r
    JOIN "User" u ON r."userId" = u."id"
    WHERE u."uuid" = ${ownerUuid}
      AND r."rating" IS NOT NULL
      AND r."reviewCount" > 0
    ORDER BY (
      (r."reviewCount" * 1.0 / (r."reviewCount" + ${m})) * r."rating" +
      (${m} * 1.0 / (r."reviewCount" + ${m})) * ${C}
    ) DESC
    LIMIT ${limit}
  `

  return rawRows.map(r => ({
    ...r,
    reviewCount: Number(r.reviewCount)
  }))
}

// 回覆時間統計（平均、P50、P90、慢回覆率）
export async function getReplyTimeStats(
  ownerUuid: string,
  client: DBClient = prisma
) {
  return client.$queryRaw<
    {
      avgReplyTime: number | null
      p50: number | null
      p90: number | null
      slowRate: number
    }[]
  >`
    WITH reply_times AS (
      SELECT
        EXTRACT(EPOCH FROM (rr."createdAt" - r."createdAt")) * 1000 AS diff
      FROM "Review" r
      JOIN "Restaurant" res ON r."restaurantId" = res."id"
      JOIN "ReviewReply" rr ON rr."reviewId" = r."id"
      JOIN "User" u ON res."userId" = u."id"
      WHERE u."uuid" = ${ownerUuid}
    )

    SELECT
      AVG(diff) AS "avgReplyTime",
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY diff) AS "p50",
      PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY diff) AS "p90",
      COALESCE(
        SUM(CASE WHEN diff > 3600000 THEN 1 ELSE 0 END) * 1.0 / NULLIF(COUNT(*), 0),
        0
      ) AS "slowRate"
    FROM reply_times
  `
}