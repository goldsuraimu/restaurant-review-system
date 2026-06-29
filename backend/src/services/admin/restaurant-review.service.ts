import { v4 as uuidv4 } from 'uuid'

import * as restaurantDraftRepo from '#/repositories/restaurant/restaurant-draft.repo'
import * as restaurantImageRepo from '#/repositories/restaurant/restaurant-image.repo'

import { deleteCloudinaryImages } from '#/services/upload/upload.service'
import { diffRemovedPublishedImages } from '#/services/admin/restaurant-review.helper'

import * as restaurantRepo from '#/repositories/restaurant/restaurant.repo'

import {
  toRestaurantDraftDetail
} from '../restaurant/owner-restaurant.mapper'

import { withPrismaTransaction } from '#/utils/prisma-transaction'
import { ApiError } from '#/utils/api-error'
import { handleServiceError } from '#/utils/service-error'
import { buildMeta } from '#/utils/pagination-meta'

import {
  RestaurantDraftStatus,
  RestaurantImageType,
} from '#/types/domain'

import {
  AdminRestaurantSortField,
  SortOrder
} from '#/types/http'


type AdminRestaurantListQuery = {
  page?: number
  limit?: number
  sort?: AdminRestaurantSortField
  order?: SortOrder
}


// 批准餐廳審核 
export async function approveRestaurant(draftUuid: string) {

  try {

    const result = await withPrismaTransaction(async tx => {

      const draft = await restaurantDraftRepo.findByDraftUuid(
        draftUuid,
        tx
      )

      if (!draft) {
        throw new ApiError('找不到餐廳草稿', {
          status: 404,
          code: 'RESTAURANT_DRAFT_NOT_FOUND',
        })
      }

      if (draft.status === RestaurantDraftStatus.REJECTED) {
        throw new ApiError('此餐廳草稿已被退件', {
          status: 409,
          code: 'RESTAURANT_DRAFT_ALREADY_REJECTED',
        })
      }

      const restaurantUuid = draft.restaurantUuid
      const publishedRestaurant =
        await restaurantRepo.findByUUID(
          restaurantUuid,
          tx
        )

      const isPublished = !!publishedRestaurant

      let removedPublishedImages: {
        publicId: string
      }[] = []


      // 已上線餐廳編輯
      if (isPublished) {

        const publishedRestaurant = await restaurantRepo.findByUUID(
          restaurantUuid,
          tx
        )

        if (!publishedRestaurant) {
          throw new ApiError('找不到正式餐廳', {
            status: 404,
            code: 'RESTAURANT_NOT_FOUND',
          })
        }

        // 找出被移除的正式圖片
        removedPublishedImages = diffRemovedPublishedImages({
          publishedImages: publishedRestaurant.images,
          draftImages: draft.images,
        })


        // 更新正式餐廳資料
        await restaurantRepo.updatePublishedRestaurant(
          {
            uuid: restaurantUuid,
            data: {
              name: draft.name,
              nameEn: draft.nameEn,
              category: draft.category,
              location: draft.location,
              phone: draft.phone,
              description: draft.description,
            },
          },
          tx
        )


        // 先刪正式圖片 DB
        if (publishedRestaurant.images.length) {

          await restaurantImageRepo.deleteImagesByUuid(
            publishedRestaurant.images.map(img => img.uuid),
            tx
          )
        }


        // draft 圖片 -> 正式圖片
        if (draft.images.length) {

          await restaurantImageRepo.insertImages(
            draft.images.map(img => ({
              uuid: uuidv4(),

              restaurantId:publishedRestaurant.id,

              type: img.type as RestaurantImageType,

              url: img.url,

              publicId: img.publicId,

              sortOrder: img.sortOrder,
            })),
            tx
          )
        }

        // 初次建立餐廳
      } else {

        const publishedRestaurant = await restaurantRepo.createPublishedRestaurant(
          {
            uuid: restaurantUuid,
            ownerId: draft.userId,

            name: draft.name,
            nameEn: draft.nameEn,
            category: draft.category,
            location: draft.location,
            phone: draft.phone,
            description: draft.description,
          },
          tx
        )


        if (draft.images.length) {

          await restaurantImageRepo.insertImages(
            draft.images.map(img => ({
              uuid: uuidv4(),

              restaurantId: publishedRestaurant.id,

              type: img.type as RestaurantImageType,

              url: img.url,
              publicId: img.publicId,

              sortOrder: img.sortOrder,
            })),
            tx
          )
        }
      }

      // 刪除 draft
      await restaurantDraftRepo.deleteDraft(
        draft.uuid,
        tx
      )


      return {
        restaurantUuid,
        removedPublishedImages,
      }
    })
    // transaction 外刪除 Cloudinary
    if (result.removedPublishedImages.length) {

      deleteCloudinaryImages(
        result.removedPublishedImages.map(
          img => img.publicId
        )
      )
    }


    return 

  } catch (err) {
    handleServiceError(err, '審核餐廳失敗')
  }
}


// 拒絕餐廳審核
export async function rejectRestaurant(
  draftUuid: string,
  reason: string
) {

  try {

    if (!reason) {
      throw new ApiError('需提供拒絕原因', {
        status: 400,
        code: 'REJECTION_REASON_REQUIRED',
      })
    }

    const draft = await restaurantDraftRepo.findByDraftUuid(draftUuid)

    if (!draft) {
      throw new ApiError('找不到餐廳草稿', {
        status: 404,
        code: 'RESTAURANT_DRAFT_NOT_FOUND',
      })
    }

    if (draft.status === RestaurantDraftStatus.REJECTED) {
      throw new ApiError('此餐廳草稿已被退件', {
        status: 409,
        code: 'RESTAURANT_DRAFT_ALREADY_REJECTED',
      })
    }

    // 改成更新 draft 
    await restaurantDraftRepo.updateDraft(
      {
        uuid: draftUuid,
        data: {
          status: RestaurantDraftStatus.REJECTED,
          reviewNote: reason,
          rejectedAt: new Date(),
        },
      }
    )

    return 

  } catch (err) {
    handleServiceError(err, '審核餐廳失敗')
  }
}


// 取得待審核餐廳列表
export async function getPendingRestaurants(query: AdminRestaurantListQuery) {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'submittedAt',
      order = 'asc',
    } = query

    const safePage = page > 0 ? page : 1
    const safeLimit = limit > 0 ? Math.min(limit, 20) : 20
    const sortOrder: SortOrder = order === 'desc' ? 'desc' : 'asc'


    const { total, rows } =
      await restaurantDraftRepo.findPendingRestaurants({
        page: safePage,
        limit: safeLimit,
        sortColumn: sort,
        sortOrder
      })

    return {
      results: rows,
      meta: buildMeta(total, page, limit),
    }
  } catch (err) {
    handleServiceError(err, '取得待審核餐廳列表失敗')
  }
}


// 取得餐廳詳細資訊（供審核使用） 
export async function getRestaurantDetail(uuid: string) {

  try {

    const restaurantDraft = await restaurantDraftRepo.findByDraftUuidWithOwner(uuid)

    if (!restaurantDraft) {
      throw new ApiError('找不到餐廳草稿', {
        status: 404,
        code: 'RESTAURANT_DRAFT_NOT_FOUND',
      })
    }


    return toRestaurantDraftDetail(restaurantDraft)

  } catch (err) {
    handleServiceError(err, '取得餐廳詳細資料失敗')
  }
}