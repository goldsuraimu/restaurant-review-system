import { ApiError } from '#/utils/api-error'
import { formatNumber } from '#/utils/number'

import type { Prisma } from '@prisma/client'

import {
  RestaurantImageType,
  RestaurantOwnerStatus,
} from '#/types/domain'



type RestaurantWithImages =
  Prisma.RestaurantGetPayload<{
    include: {
      images: true
    }
  }>

type RestaurantDraftWithImagesAndOwner =
  Prisma.RestaurantDraftGetPayload<{
    include: {
      images: true
      owner: {
        select: {
          uuid: true  
        }
      }
    }
  }>

type RestaurantDraftWithImages =
  Prisma.RestaurantDraftGetPayload<{
    include: {
      images: true
    }
  }>

type ImageGroup = {
  uuid: string
  publicId: string
  sortOrder: number
}

type OwnerRestaurantListRow =
  | {
    draft: RestaurantDraftWithImages
    publishedRestaurant: RestaurantWithImages | null
    displayStatus: RestaurantOwnerStatus
  }
  | {
    draft: null
    publishedRestaurant: RestaurantWithImages
    displayStatus: RestaurantOwnerStatus
  }

/**
   * =========================
   * 將 Prisma 查詢結果轉換成業者餐廳列表需要的格式
   * 這裡會處理一些邏輯，例如 draft 優先、狀態判斷等等
   * 前端需要的欄位和 Prisma 查詢結果不太一樣，所以需要一個 mapper 來轉換
   * =========================
   */
export function toOwnerRestaurantListItem(
  row: OwnerRestaurantListRow
) {

  /**
   * =========================
   * draft 優先
   * 因為 draft 才是最新資料
   * =========================
   */

  const target =
    row.draft ??
    row.publishedRestaurant

  const cover =
    target.images?.find(
      img => img.type === RestaurantImageType.COVER
    )

  const restaurantUuid =
    row.publishedRestaurant?.uuid ??
    row.draft?.restaurantUuid

  if (!restaurantUuid) {
    throw new ApiError('餐廳 UUID 缺失', {
      status: 500,
      code: 'RESTAURANT_UUID_MISSING',
    })
  }

  return {

    restaurantUuid,

    draftUuid:
      row.draft?.uuid ?? null,

    name: target.name,

    nameEn: target.nameEn,

    category: target.category,

    rating:
      row.publishedRestaurant
        ? formatNumber(
          row.publishedRestaurant.rating,
          1
        )
        : null,

    ratingCount:
      row.publishedRestaurant?.ratingCount ?? 0,

    reviewCount:
      row.publishedRestaurant?.reviewCount ?? 0,

    coverImage:
      cover
        ? {
          uuid: cover.uuid,

          publicId: cover.publicId,

          sortOrder:
            cover.sortOrder,
        }
        : null,

    /**
     * =========================
     * 前端用 displayStatus
     * =========================
     */

    displayStatus:
      row.displayStatus,

    /**
     * =========================
     * review note 只看 draft
     * =========================
     */

    reviewNote:
      row.draft?.reviewNote ?? null,

    rejectedAt:
      row.draft?.rejectedAt
        ?.toISOString() ?? null,

    /**
     * =========================
     * createdAt / updatedAt
     * draft 優先
     * =========================
     */

    createdAt:
      target.createdAt?.toISOString(),

    updatedAt:
      target.updatedAt?.toISOString(),
  }
}

// 用來處理 raw SQL 查詢結果的，給業者餐廳和審核使用
export function toRestaurantDraftDetail(row: RestaurantDraftWithImagesAndOwner) {
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
    draftUuid: row.uuid,
    restaurantUuid: row.restaurantUuid,
    ownerUuid: row.owner.uuid,
    name: row.name,
    nameEn: row.nameEn,
    category: row.category,
    location: row.location,
    description: row.description,
    phone: row.phone,
    reviewNote: row.reviewNote,
    images: imagesByType,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
  }
}
