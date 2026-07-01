import { formatNumber } from '#/utils/number'

import type { Prisma } from '@prisma/client'
import type { RestaurantWithScoreRow } from '#/repositories/restaurant/restaurant-search.raw'

type RestaurantWithImagesandOwner = Prisma.RestaurantGetPayload<{
  include: { 
    stats: true
    images: true 
    owner: {
      select: {
        uuid: true  
      }
    }
  }
}>

type RestaurantWithImages = Prisma.RestaurantGetPayload<{
  include: {
    stats: true
    images: true
  }
}>


type ImageGroup = {
  uuid: string
  publicId: string
  sortOrder: number
}

export type OwnerRestaurantRankingRow = {
  restaurantUuid: string
  restaurantName: string
  avgRating: number | null
  reviewCount: number
  rank: number
}

export type OwnerRestaurantRankingItem = {
  restaurantUuid: string
  restaurantName: string
  avgRating: number | null
  reviewCount: number
  rank: number
}

// 用來處理 Prisma 查詢結果的，因為欄位命名和 API 回應格式不太一樣
// 用於public的餐廳列表(不包含狀態和審核備註)
export function toPublicRestaurantListItemFromPrisma(
  row: RestaurantWithImages
) {
  const cover = row.images?.[0]

  return {
    uuid: row.uuid,
    name: row.name,
    nameEn: row.nameEn,
    category: row.category,
    rating: formatNumber(row.stats?.rating ?? 0, 1),
    ratingCount: row.stats?.ratingCount ?? 0,
    reviewCount: row.stats?.reviewCount ?? 0,
    coverImage: cover
      ? {
        uuid: cover.uuid,
        publicId: cover.publicId,
        sortOrder: cover.sortOrder,
      }
      : null,

    createdAt: row.createdAt.toISOString(),

    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

// 用來處理 raw SQL 查詢結果的，因為欄位命名和 Prisma 物件不太一樣
export function toRestaurantListItemFromRaw(row: RestaurantWithScoreRow) {
  return {
    uuid: row.uuid,
    name: row.name,
    nameEn: row.nameEn,
    category: row.category,
    rating: formatNumber(row.rating, 1),
    ratingCount: row.ratingCount,
    reviewCount: row.reviewCount,
    coverImage: row.coverPublicId
      ? {
        uuid: row.coverUuid,
        publicId: row.coverPublicId,
        sortOrder: row.coverSortOrder,
      }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

export function toRestaurantDetail(row: RestaurantWithImagesandOwner) {
  const imagesByType: Record<'cover' | 'gallery' | 'menu', ImageGroup[]> = {
    cover: [],
    gallery: [],
    menu: [],
  }

  row.images.forEach(img => {
    imagesByType[img.type as 'cover' | 'gallery' | 'menu'].push({
      uuid: img.uuid,
      publicId: img.publicId,
      sortOrder: img.sortOrder,
    })
  })

  return {
    uuid: row.uuid,
    ownerUuid: row.owner.uuid,
    name: row.name,
    nameEn: row.nameEn,
    category: row.category,
    location: row.location,
    description: row.description,
    phone: row.phone,
    rating: formatNumber(row.stats?.rating ?? 0, 1),
    ratingCount: row.stats?.ratingCount ?? 0,
    reviewCount: row.stats?.reviewCount ?? 0,
    images: imagesByType,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }
}

// 將餐廳排名資料格式化為 API 回應格式
export function formatOwnerRestaurantRanking(
  rows: OwnerRestaurantRankingRow[]
): OwnerRestaurantRankingItem[] {
  return rows.map(r => ({
    restaurantUuid: r.restaurantUuid,
    restaurantName: r.restaurantName,
    avgRating: formatNumber(r.avgRating, 1),
    reviewCount: r.reviewCount,
    rank: r.rank
  }))
}