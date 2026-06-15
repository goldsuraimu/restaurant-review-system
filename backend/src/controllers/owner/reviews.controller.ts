import { Request, Response, NextFunction } from 'express'

import { parsePaginationQuery } from '#/utils/http/parse-pagination-query'
import * as ownerReviewService from '#/services/review/owner.service'

import { OWNER_REVIEW_SORT_FIELDS } from '#/types/domain'

import type {
  RestaurantParams,
  ReviewParams
} from '#/types/http'
import type {
  OwnerReviewSortField
} from '#/types/domain'

/**
 * GET /owner/restaurants/:restaurantUuid/reviews
 * 取得業者單一餐廳的評論列表（支援分頁、排序與篩選未回覆評論）
 */
export async function getRestaurantReviews(
  req: Request<RestaurantParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { restaurantUuid } = req.params
    const ownerUuid = req.auth.uuid

    const { page, limit, order } = parsePaginationQuery(req.query)

    function isOwnerReviewSortField(v: unknown): v is OwnerReviewSortField {
      return typeof v === 'string' &&
        OWNER_REVIEW_SORT_FIELDS.includes(v as OwnerReviewSortField)
    }

    const sort = isOwnerReviewSortField(req.query.sort)
      ? req.query.sort
      : undefined

    const unreplied =
      req.query.unreplied === 'true'

    const result =
      await ownerReviewService.getOwnerReviews({
        ownerUuid,
        scope: {
          type: 'RESTAURANT',
          restaurantUuid
        },
        page,
        limit,
        sort,
        order,
        unreplied
      })

    res.status(200).json(result)

  } catch (err) {
    next(err)
  }
}

/**
 * GET /owner/reviews
 * 取得業者所有餐廳評論（支援分頁、排序、篩選）
 */
export async function getOwnerReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ownerUuid = req.auth.uuid

    const { page, limit, order } = parsePaginationQuery(req.query)

    function isOwnerReviewSortField(v: unknown): v is OwnerReviewSortField {
      return typeof v === 'string' &&
        OWNER_REVIEW_SORT_FIELDS.includes(v as OwnerReviewSortField)
    }

    const sort = isOwnerReviewSortField(req.query.sort)
      ? req.query.sort
      : undefined

    const unreplied = req.query.unreplied === 'true'

    const result =
      await ownerReviewService.getOwnerReviews({
        ownerUuid,
        scope: {
          type: 'ALL'
        },
        page,
        limit,
        sort,
        order,
        unreplied
      })

    res.status(200).json(result)

  } catch (err) {
    next(err)
  }
}

/**
 * POST /owner/reviews/:reviewUuid/reply
 * 業者回覆評論
 */
export async function replyReview(
  req: Request<ReviewParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewUuid } = req.params
    const ownerUuid = req.auth.uuid
    const { content } = req.body

    const result =
      await ownerReviewService.replyReview({
        ownerUuid,
        reviewUuid,
        content
      })

    res.status(201).json({
      result
    })

  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /owner/reviews/:reviewUuid/reply
 * 業者編輯回覆
 */
export async function editReply(
  req: Request<ReviewParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewUuid } = req.params
    const ownerUuid = req.auth.uuid
    const { content } = req.body

    const result =
      await ownerReviewService.editReply({
        ownerUuid,
        reviewUuid,
        content
      })

    res.status(200).json({
      result
    })

  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /owner/reviews/:reviewUuid/reply
 * 業者刪除回覆
 */
export async function deleteReply(
  req: Request<ReviewParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewUuid } = req.params
    const ownerUuid = req.auth.uuid

    const result =
      await ownerReviewService.deleteReply({
        ownerUuid,
        reviewUuid
      })

    res.status(200).json({
      result
    })

  } catch (err) {
    next(err)
  }
}