import * as reviewPublicService from '#/services/review/public.service'
import * as reviewUserService from '#/services/review/user.service'

import { Request, Response, NextFunction } from 'express'

import { REVIEW_SORT_FIELDS } from '#/types/domain'

import type {
  RestaurantParams,
  ReviewWithRestaurantParams
} from '#/types/http'

import type {
  ReviewSortField
} from '#/types/domain'


/**
 * GET /restaurants/:restaurantUuid/reviews
 * 取得餐廳的評論列表（支援分頁與排序）
 */
export async function getByRestaurant(
  req: Request<RestaurantParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { restaurantUuid } = req.params

    const cursor =
      typeof req.query.cursor === 'string'
        ? req.query.cursor
        : undefined

    const limit =
      typeof req.query.limit === 'string'
        ? Number(req.query.limit)
        : undefined

    function isReviewSortField(v: unknown): v is ReviewSortField {
      return typeof v === 'string' &&
        REVIEW_SORT_FIELDS.includes(v as ReviewSortField)
    }

    const sort = isReviewSortField(req.query.sort)
      ? req.query.sort
      : undefined

    const result = await reviewPublicService.getReviewsByRestaurant(
      restaurantUuid,
      { cursor, limit, sort }
    )

    res.json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /restaurants/:restaurantUuid/my-review
 * 取得該餐廳我的評論（如果有的話）
 */
export async function getMyReview(
  req: Request<RestaurantParams>,
  res: Response,
  next: NextFunction
) {
  try {

    const { restaurantUuid } = req.params
    const userUuid = req.auth.uuid

    if (!userUuid) {
      return res.json({ result: { review: null } })
    }

    const result = await reviewUserService.getMyReview(
      restaurantUuid,
      userUuid
    )

    res.json({ result })

  } catch (err) {
    next(err)
  }
}

/**
 * POST /restaurants/:restaurantUuid/reviews
 * 新增評論（包含圖片上傳）
 * - 需要驗證使用者身份
 * - 接收 multipart/form-data（僅文字資料，不包含檔案）
 * - 文字欄位：
 *   - rating（評分）
 *   - content（評論內容）
 *   - reviewUuid（評論 UUID）
 *   - reviewImages（內容為 { url, publicId }）
 * - 圖片已由前端先上傳至 Cloudinary
 * - 回傳新增的評論資料跟新的餐廳評分相關資料(例如：餐廳平均評分、評論總數等)
 * - 錯誤處理：驗證失敗、檔案上傳失敗、服務層錯誤等
 * */
export async function create(req: Request<RestaurantParams>, res: Response, next: NextFunction) {
  try {
    const { 
      restaurantUuid, 
    } = req.params
    const userUuid = req.auth.uuid
    const { 
      rating, 
      content, 
      reviewUuid,
      reviewImages
    } = req.body


    const result = await reviewUserService.createReview(
      restaurantUuid,
      reviewUuid,
      userUuid,
      rating,
      content,
      reviewImages
    )

    res.status(201).json({ result })
  } catch (err: unknown) {
    next(err)
  }
}

/**
 * PUT /restaurants/:restaurantUuid/reviews/:reviewUuid
 * 更新評論（包含圖片上傳）
 */
export async function update(req: Request<ReviewWithRestaurantParams>, res: Response, next: NextFunction) {
  try {
    const {
      reviewUuid
    } = req.params
    const userUuid = req.auth.uuid
    const {
      rating,
      content,
      reviewImages,     
      deletedImages     
    } = req.body


    // 取得要刪除的圖片 uuid
    const deletedImageUuids: string[] = deletedImages ?? []

    const result = await reviewUserService.updateReview(
      reviewUuid,
      userUuid,
      rating,
      content,
      reviewImages,
      deletedImageUuids
    )

    res.status(200).json({ result })
  } catch (err: unknown) {
    next(err)
  }
}

/**
 * DELETE /restaurants/:restaurantUuid/reviews/:reviewUuid
 * 刪除評論
 */
export async function remove(req: Request<ReviewWithRestaurantParams>, res: Response) {
  const { 
    reviewUuid 
  } = req.params
  const userUuid = req.auth.uuid

  const result = await reviewUserService.deleteReview(reviewUuid, userUuid)

  res.status(200).json({ result })
}
