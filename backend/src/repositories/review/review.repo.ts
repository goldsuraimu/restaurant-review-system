import { prisma } from '#/db/prisma'

import type { DBClient } from '#/types/database'


export interface FindReviewsCursorOptions {
  restaurantUuid: string
  cursor?: string
  limit: number
  sort: 'latest' | 'oldest' | 'rating_desc' | 'rating_asc'
}

export interface FindOwnerRestaurantReviewsOptions {
  ownerUuid: string
  restaurantUuid?: string
  page: number
  limit: number
  sort?: 'createdAt' | 'rating'
  order?: 'asc' | 'desc'
  unreplied?: boolean
}

// 取得餐廳評論（使用 cursor-based pagination）
export async function findByRestaurantUuidCursor({
  restaurantUuid,
  cursor,
  limit,
  sort,
}: FindReviewsCursorOptions,
  client: DBClient = prisma
) {

  const orderBy =
    sort === 'latest'
      ? [{ createdAt: 'desc' as const }, { uuid: 'desc' as const }]
      : sort === 'oldest'
        ? [{ createdAt: 'asc' as const }, { uuid: 'asc' as const }]
        : sort === 'rating_desc'
          ? [{ rating: 'desc' as const }, { createdAt: 'desc' as const }]
          : [{ rating: 'asc' as const }, { createdAt: 'desc' as const }]

  return client.review.findMany({
    where: { restaurantUuid },
    take: limit + 1,
    ...(cursor && {
      cursor: { uuid: cursor },
      skip: 1,
    }),
    orderBy,
    include: {
      user: {
        select: {
          uuid: true,
          username: true,
          nickname: true,
        },
      },
      restaurant: {
        select: {
          name: true
        }
      },
      images: true,
      reply: true,
    },
  })
}

// 取得餐廳評論（業主專用）
export async function findOwnerReviews({
  ownerUuid,
  restaurantUuid,
  page,
  limit,
  sort = 'createdAt',
  order = 'desc',
  unreplied
}: FindOwnerRestaurantReviewsOptions,
  client: DBClient = prisma
) {

  const skip = (page - 1) * limit

  const where: any = {
    restaurant: {
      ownerUuid,
      ...(restaurantUuid ? { uuid: restaurantUuid } : {})
    }
  }

  if (unreplied) {
    where.reply = null
  }

  const total = await client.review.count({ where })

  const rows = await client.review.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sort]: order
    },
    include: {
      user: {
        select: {
          uuid: true,
          username: true,
          nickname: true
        }
      },
      restaurant: {
        select: {
          name: true
        }
      },
      images: true,
      reply: true
    }
  })

  return { total, rows }
}

// 取得使用者對餐廳的評論（如果有的話）
export async function findMyReview(
  restaurantUuid: string,
  userUuid: string,
  client: DBClient = prisma
) {
  return client.review.findFirst({
    where: {
      restaurantUuid,
      userUuid,
    },
    include: {
      images: true,
      user: {
        select: {
          uuid: true,
          username: true,
          nickname: true,
        },
      },
      restaurant: {
        select: {
          name: true
        }
      },
      reply: true
    },
  })
}

// 取得餐廳評論
export async function findByUuid(
  uuid: string,
  client: DBClient = prisma
) {
  return client.review.findUnique({
    where: { uuid },
    include: {
      images: true,
      user: {
        select: {
          uuid: true,
          username: true,
          nickname: true,
        },
      },
      restaurant: {
        select: {
          name: true
        }
      },
      reply: true
    },
  })
}

// 新增評論
export async function createReview(
  data: {
    uuid: string
    rating: number
    content?: string
    restaurantUuid: string
    userUuid: string
  },
  client: DBClient = prisma
) {
  return client.review.create({
    data: {
      uuid: data.uuid,
      rating: data.rating,
      content: data.content,
      restaurant: {
        connect: { uuid: data.restaurantUuid },
      },
      user: {
        connect: { uuid: data.userUuid },
      },
    },
  })
}

// 更新評論
export async function updateReview(
  uuid: string,
  data: {
    rating: number
    content?: string
  },
  client: DBClient = prisma
) {
  return client.review.update({
    where: { uuid },
    data: {
      rating: data.rating,
      content: data.content,
    },
  })
}

// 刪除評論
export async function deleteReview(
  uuid: string,
  client: DBClient = prisma
) {
  return client.review.delete({
    where: { uuid },
  })
}

// 新增評論圖片
export async function createImages(
  images: { 
    uuid: string; 
    reviewUuid: string; 
    url: string;  
    publicId: string; 
  }[],
  client: DBClient = prisma
) {
  return client.reviewImage.createMany({
    data: images,
  })
}

// 刪除評論圖片
export async function deleteImagesByUuid(
  imageUuids: string[],
  client: DBClient = prisma
) {
  return client.reviewImage.deleteMany({
    where: { uuid: { in: imageUuids } },
  })
}

// 新增業者回覆
export async function createReply(data: {
  uuid: string
  reviewUuid: string
  content: string
},
  client: DBClient = prisma
) {
  return client.reviewReply.create({
    data: {
      uuid: data.uuid,
      reviewUuid: data.reviewUuid,
      content: data.content
    }
  })
}

// 更新業者回覆
export async function updateReply(
  uuid: string,
  data: {
    content: string
  },
  client: DBClient = prisma
) {

  return client.reviewReply.update({
    where: {
      uuid
    },
    data: {
      content: data.content
    }
  })
}

// 刪除業者回覆
export async function deleteReply(
  uuid: string,
  client: DBClient = prisma
) {

  return client.reviewReply.delete({
    where: {
      uuid
    }
  })

}