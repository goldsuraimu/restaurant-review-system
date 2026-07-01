import { prisma } from '#/db/prisma'
import type { Prisma } from '@prisma/client'

import type { DBClient } from '#/types/database'

export interface FindSimpleListOptions {
  keywords: string[]
  page: number
  limit: number
  sortColumn: 'createdAt' | 'rating' | 'ratingCount' | 'reviewCount'
  sortOrder: 'asc' | 'desc'
}


// #region 取得餐廳列表（簡易版，不會根據關聯性加權排序）
export async function findSimpleList({
  keywords,
  page,
  limit,
  sortColumn,
  sortOrder,
}: FindSimpleListOptions,
  client: DBClient = prisma
) {
  const skip = (page - 1) * limit

  const where =
    keywords.length > 0
      ? {
        AND: [
          {
            OR: keywords.map(kw => ({
              OR: [
                { name: { contains: kw } },
                { nameEn: { contains: kw } },
                { category: { contains: kw } },
                { location: { contains: kw } },
                { description: { contains: kw } },
              ],
            })),
          },
        ],
      }
      : {}

  const total = await client.restaurant.count({ where })

  const orderBy: Prisma.RestaurantOrderByWithRelationInput[] = []

  if (sortColumn === 'createdAt') {
    orderBy.push({ createdAt: sortOrder })
  } else {
    orderBy.push({
      stats: {
        [sortColumn]: sortOrder
      }
    })
  }

  if (sortColumn !== 'rating') {
    orderBy.push({
      stats: {
        rating: 'desc'
      }
    })
  }

  if (sortColumn !== 'reviewCount') {
    orderBy.push({
      stats: {
        reviewCount: 'desc'
      }
    })
  }

  const rows = await client.restaurant.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      stats: true,
      images: {
        where: { type: 'cover' },
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return { total, rows }
}
// #endregion


// #region依照 UUID 取得餐廳（包含圖片）
export async function findByUUID(
  uuid: string, 
  client: DBClient = prisma
) {
  return client.restaurant.findUnique({
    where: { uuid },
    include: { images: true },
  })
}
// #endregion

// #region依照 UUID 取得餐廳（包含圖片、業者）
export async function findByUUIDWithOwner(
  uuid: string,
  client: DBClient = prisma
) {
  return client.restaurant.findUnique({
    where: { uuid },
    include: { 
      stats: true,
      images: true,
      owner: {
        select: {
          uuid: true,
        }
      }
    },
  })
}
// #endregion

// #region 計算業者餐廳排名（Bayesian 平均）
export async function findOwnerRestaurantRankings(
  {
    ownerUuid,
    page,
    limit
  }: {
    ownerUuid: string
    page: number
    limit: number
  },
  client: DBClient = prisma
) {
  const skip = (page - 1) * limit

  // 先算全部平均 C
  const avgResult = await client.restaurantStats.aggregate({
    where: {
      restaurant: {
        owner: {
          uuid: ownerUuid
        }
      },
      rating: {
        not: null
      }
    },
    _avg: {
      rating: true
    }
  })

  const C = avgResult._avg.rating ?? 0
  const m = 10

  // Bayesian + 排序 + rank
  const rawRows = await client.$queryRaw<
    {
      restaurantUuid: string
      restaurantName: string
      avgRating: number
      reviewCount: number
      rank: number
    }[]
  >`
    WITH ranked AS (
      SELECT
        r.uuid as "restaurantUuid",
        r.name as "restaurantName",
        rs.rating as "avgRating",
        rs."reviewCount" as "reviewCount",
        (
          (rs."reviewCount" * 1.0 / (rs."reviewCount" + ${m})) * rs.rating +
          (${m} * 1.0 / (rs."reviewCount" + ${m})) * ${C}
        ) as score
      FROM "Restaurant" r
      JOIN "RestaurantStats" rs
      ON rs."restaurantId"=r."id"
      JOIN "User" u ON r."userId" = u."id"
      WHERE u."uuid" = ${ownerUuid}
        AND rs.rating IS NOT NULL
        AND rs."reviewCount" > 0
    )
    SELECT
      "restaurantUuid",
      "restaurantName",
      "avgRating",
      "reviewCount",
      ROW_NUMBER() OVER (ORDER BY score DESC) as rank
    FROM ranked
    ORDER BY score DESC
    LIMIT ${limit}
    OFFSET ${skip}
  `

  const rows = rawRows.map(r => ({
    ...r,
    reviewCount: Number(r.reviewCount),
    rank: Number(r.rank)
  }))

  const total = await client.restaurantStats.count({
    where: {
      restaurant: {
        owner: {
          uuid: ownerUuid
        }
      },
      rating: {
        not: null
      },
      reviewCount: {
        gt: 0
      }
    }
  })

  return { total, rows }
}
// #endregion


// #region 建立正式餐廳
export async function createPublishedRestaurant(
  data: {
    uuid: string
    ownerId: number

    name: string
    nameEn?: string | null
    category: string
    location: string
    phone?: string | null
    description?: string | null
  },
  client: DBClient = prisma
) {
  const { ownerId, ...rest } = data;

  return client.restaurant.create({
    data: {
      ...rest,
      userId: ownerId,

      stats: {
        create: {}   // 這裡會自動建立一個 RestaurantStats 的空紀錄，ratingSum、ratingCount、reviewCount 都會預設為 0
      }
    }
  })
}
// #endregion

// #region 更新正式餐廳
export async function updatePublishedRestaurant(
  params: {
    uuid: string
    data: {
      name: string
      nameEn?: string | null
      category: string
      location: string
      phone?: string | null
      description?: string | null
    }
  },
  client: DBClient = prisma
) {
  return client.restaurant.update({
    where: {
      uuid: params.uuid,
    },
    data: params.data,
  })
}
// #endregion

// #region 刪除餐廳
export async function deleteRestaurant(
  restaurantId: number,
  client: DBClient = prisma
) {
  return client.restaurant.delete({
    where: { id: restaurantId },
  })
}
// #endregion

// #region 評論增加後更新餐廳的 rating 和 ratingCount
export async function incrementRestaurantRating(
  restaurantId: number,
  rating: number,
  client: DBClient = prisma
) {
  return client.restaurantStats.update({
    where: {
      restaurantId
    },
    data: {
      ratingSum: {
        increment: rating
      },
      reviewCount: {
        increment: 1
      }
    }
  })
}
// #endregion

// #region 評論刪除後更新餐廳的 rating 和 ratingCount
export async function decrementRestaurantRating(
  restaurantId: number,
  rating: number,
  client: DBClient = prisma
) {
  return client.restaurantStats.update({
    where: {
      restaurantId
    },
    data: {
      ratingSum: {
        decrement: rating
      },
      reviewCount: { 
        decrement: 1 
      }
    }
  })
}
// #endregion

// #region 取得餐廳的評分資訊
export async function getRatingInfoByUuid(
  restaurantId: number,
  client: DBClient = prisma
) {
  return client.restaurantStats.findUnique({
    where: {
      restaurantId
    },
    select: {
      rating: true,
      ratingCount: true,
      reviewCount: true,
    },
  })
}
// #endregion

// #region 最終更新餐廳的 rating 和 ratingCount
export async function updateRestaurantRatingFinal(
  restaurantId: number,
  rating: number | null,
  ratingCount: number,
  client: DBClient = prisma
) {
  return client.restaurantStats.update({
    where: {
      restaurantId
    },
    data: {
      rating,
      ratingCount
    },
    select: {
      rating: true,
      ratingCount: true,
      reviewCount: true
    }
  })
}
// #endregion


// #region 評論評分修改後更新餐廳的 ratingSum（用於計算最終 rating）
export async function adjustRestaurantRatingSum(
  restaurantId: number,
  diff: number,
  client: DBClient = prisma
) {
  return client.restaurantStats.update({
    where: {
      restaurantId
    },
    data: {
      ratingSum: { 
        increment: diff 
      },
      // reviewCount 不變
    },
  })
}
// #endregion
