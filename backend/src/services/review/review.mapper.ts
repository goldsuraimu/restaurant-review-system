import { Prisma } from '@prisma/client'
import { resolveImageUrl } from '#/utils/resolve-image-url'

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
    restaurantUuid: r.restaurantUuid,
    restaurantName: r.restaurant.name,
    rating: r.rating,
    content: r.content,

    images: r.images.map(img => ({
      uuid: img.uuid,
      reviewUuid: img.reviewUuid,
      createdAt: img.createdAt,
      url: resolveImageUrl(img.url),
    })),

    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),

    userUuid: r.userUuid,
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

