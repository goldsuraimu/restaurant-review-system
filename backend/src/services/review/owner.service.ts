import { v4 as uuidv4 } from 'uuid'

import { handleServiceError } from '#/utils/service-error'

import { validateReplyContent } from '#/validators/review.validator'
import { checkRestaurantExists } from '#/services/restaurant/restaurant.helper'
import { checkReviewExists, checkOwnerReviewPermission } from './review.helper'
import { toReviewItem } from '#/services/review/review.mapper'

import * as reviewRepo from '#/repositories/review/review.repo'

import { ApiError } from '#/utils/api-error'

import type { OwnerReviewScope } from '#/types/domain/review'

// 取得業者餐廳的評論列表（支援分頁、排序與篩選未回覆評論）
export async function getOwnerReviews(
  query: {
    ownerUuid: string
    scope: OwnerReviewScope
    page?: number
    limit?: number
    sort?: 'createdAt' | 'rating'
    order?: 'asc' | 'desc'
    unreplied?: boolean
  }
) {

  try {
    const {
      ownerUuid,
      scope,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      unreplied
    } = query

    let restaurantUuid: string | undefined
    let restaurantInfo: { uuid: string; name: string } | undefined

    switch (scope.type) {
      case 'RESTAURANT':
        const restaurant = await checkRestaurantExists(scope.restaurantUuid)

        if (restaurant.ownerUuid !== ownerUuid) {
          throw new ApiError('無權限查看此餐廳評論', {
            status: 403,
            code: 'FORBIDDEN'
          })
        }

        restaurantUuid = scope.restaurantUuid

        restaurantInfo = {
          uuid: restaurant.uuid,
          name: restaurant.name
        }

        break

      case 'ALL':
        restaurantUuid = undefined
        break
    }

    const safePage = page > 0 ? page : 1
    const safeLimit = limit > 0 ? limit : 20

    const { total, rows } =
      await reviewRepo.findOwnerReviews({
        ownerUuid,
        restaurantUuid,
        page: safePage,
        limit: safeLimit,
        sort,
        order,
        unreplied
      })

    const results = rows.map(toReviewItem)

    return {
      results,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit)
      },
      ...(restaurantInfo && { restaurant: restaurantInfo })
    }

  } catch (err) {
    handleServiceError(err, '取得評論失敗')
  }
}


// 新增業者回覆
export async function replyReview(
  query: {
    ownerUuid: string
    reviewUuid: string
    content: string
  }
) {
  try {
    const {
      ownerUuid,
      reviewUuid,
      content
    } = query
    validateReplyContent(content)

    const review =
      await checkOwnerReviewPermission(
        reviewUuid,
        ownerUuid
      )

    if (review.reply) {
      throw new ApiError('評論已回覆', {
        status: 400,
        code: 'REVIEW_ALREADY_REPLIED'
      })
    }

    const replyUuid = uuidv4()

    await reviewRepo.createReply({
      uuid: replyUuid,
      reviewUuid,
      content
    })

    const updatedReview = await checkReviewExists(reviewUuid)

    return {
      review: toReviewItem(updatedReview)
    }

  } catch (err) {
    handleServiceError(err, '回覆評論失敗')
  }
}


// 編輯業者回覆
export async function editReply(
  query: {
    ownerUuid: string
    reviewUuid: string
    content: string
  }
) {
  try {
    const {
      ownerUuid,
      reviewUuid,
      content
    } = query
    const normalizedContent = content.trim()

    validateReplyContent(normalizedContent)

    const review =
      await checkOwnerReviewPermission(
        reviewUuid,
        ownerUuid
      )

    // 必須已經有回覆
    if (!review.reply) {
      throw new ApiError('評論尚未回覆', {
        status: 400,
        code: 'REPLY_NOT_FOUND'
      })
    }

    // 如果內容沒有變更，直接回傳原本的評論資料
    if (review.reply.content === normalizedContent) {
      return {
        review: toReviewItem(review)
      }
    }

    await reviewRepo.updateReply(
      review.reply.uuid,
      {
        content: normalizedContent
      }
    )

    const updatedReview =
      await checkReviewExists(reviewUuid)

    return {
      review: toReviewItem(updatedReview)
    }

  } catch (err) {
    handleServiceError(err, '編輯回覆失敗')
  }

}

// 刪除業者回覆
export async function deleteReply(
  query: {
    ownerUuid: string
    reviewUuid: string
  }
) {
  try {
    const {
      ownerUuid,
      reviewUuid
    } = query

    const review =
      await checkOwnerReviewPermission(
        reviewUuid,
        ownerUuid
      )

    // 必須已經有回覆
    if (!review.reply) {
      throw new ApiError('評論尚未回覆', {
        status: 400,
        code: 'REPLY_NOT_FOUND'
      })
    }

    await reviewRepo.deleteReply(
      review.reply.uuid
    )

    const updatedReview =
      await checkReviewExists(reviewUuid)

    return {
      review: toReviewItem(updatedReview)
    }

  } catch (err) {
    handleServiceError(err, '刪除回覆失敗')
  }
}