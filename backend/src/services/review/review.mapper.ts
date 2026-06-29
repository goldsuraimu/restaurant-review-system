import { Prisma } from '@prisma/client'

type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    user: {
      select: {
        uuid: true
        username: true
        nickname: true
      }
    },
    restaurant: {
      select: {
        uuid: true
        name: true
      }
    },
    images: true,
    reply: true
  }
}>

// 轉換 Prisma 查詢結果為 API 回應格式
export function toReviewItem(r: ReviewWithRelations) {
  return {
    uuid: r.uuid,
    restaurantUuid: r.restaurant.uuid,
    restaurantName: r.restaurant.name,
    rating: r.rating,
    content: r.content,

    images: r.images.map(img => ({
      uuid: img.uuid,
      reviewUuid: r.uuid,
      createdAt: img.createdAt,
      publicId: img.publicId,
    })),

    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),

    userUuid: r.user.uuid,
    nickname: r.user.nickname,
    userName: r.user.nickname || r.user.username,

    reply: r.reply
      ? {
        content: r.reply.content,
        createdAt: r.reply.createdAt.toISOString(),
        updatedAt: r.reply.updatedAt.toISOString() ?? null
      }
      : null
  }
}

