import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Prisma } from '@prisma/client'

import { ApiError } from '#/utils/api-error'
import { withPrismaTransaction } from '#/utils/prisma-transaction'
import { handleServiceError } from '#/utils/service-error'
import { formatNumber } from '#/utils/number'
import { validateReviewRating, validateReviewContent } from '#/validators/review.validator'
import { toReviewItem } from '#/services/review/review.mapper'
import { deleteCloudFolder, deleteCloudinaryImages } from '#/services/upload/upload.service'

import * as reviewRepo from '#/repositories/review/review.repo'
import * as restaurantRepo from '#/repositories/restaurant/restaurant.repo'
import { checkRestaurantExists } from '#/services/restaurant/restaurant.helper'
import {
  checkReviewExists,
} from './review.helper'
import {
  calculateFinalRating,
  calculateRatingDiff
} from '#/domains/restaurant.domain'

import type {
  UploadedImage,
} from '#/types/common/uploaded-image'

import type {
  ReviewImage,
} from '#/types/db/review'


// #region 取得個人評論
export async function getMyReview(
  restaurantUuid: string,
  userUuid: string
) {
  try {
    await checkRestaurantExists(restaurantUuid)

    const review = await reviewRepo.findMyReview(
      restaurantUuid,
      userUuid
    )

    if (!review) {
      return { review: null }
    }

    return {
      review: toReviewItem(review)
    }
  } catch (err) {
    handleServiceError(err, '取得個人評論失敗')
  }
}
// #endregion

// #region 建立評論
export async function createReview(
  restaurantUuid: string,
  reviewUuid: string,
  userUuid: string,
  rating: string | number,
  content?: string,
  reviewImagesInput?: UploadedImage[]
) {
  try {
    const parsedRating = validateReviewRating(rating)
    validateReviewContent(content)

    const restaurant = await checkRestaurantExists(restaurantUuid)

    if (restaurant.owner.uuid === userUuid) {
      throw new ApiError('不能評論自己的餐廳', {
        status: 403,
        code: 'CANNOT_REVIEW_OWN_RESTAURANT'
      })
    }

    const reviewImages = reviewImagesInput ?? []

    // 建立評論
    const result = await withPrismaTransaction(async tx => {
      const review = await reviewRepo.createReview({
        uuid: reviewUuid,
        rating: parsedRating,
        content,
        restaurantUuid,
        userUuid,
      }, tx
      )

      if (reviewImages.length) {
        const imagesToCreate: {
          uuid: string
          reviewId: number
          url: string
          publicId: string
        }[] = reviewImages.map(img => ({
          uuid: uuidv4(),
          reviewId: review.id,
          url: img.url,
          publicId: img.publicId,
        }))

        await reviewRepo.createImages(imagesToCreate, tx)
      }

      // #region 新增評論後，更新餐廳的 ratingSum 和 reviewCount  
      const restaurant = await restaurantRepo.incrementRestaurantRating(
        restaurantUuid,
        parsedRating,
        tx
      )

      const finalRating = calculateFinalRating(
        restaurant.ratingSum,
        restaurant.reviewCount
      )

      const updatedRestaurant = await restaurantRepo.updateRestaurantRatingFinal(
        restaurantUuid,
        finalRating,
        restaurant.reviewCount,
        tx
      )

      return { updatedRestaurant }
      // #endregion
    })

    const review = await checkReviewExists(reviewUuid)

    return {
      review: toReviewItem(review),
      restaurantRating: {
        rating: formatNumber(result.updatedRestaurant.rating, 1),
        ratingCount: result.updatedRestaurant.ratingCount,
        reviewCount: result.updatedRestaurant.reviewCount,
      }
    }
  } catch (err) {
    // Prisma 特定錯誤在這裡統一處理
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ApiError('您已評論過此餐廳', {
        status: 400,
        code: 'REVIEW_EXISTS',
      })
    }

    handleServiceError(err, '建立評論失敗')
  }
}
// #endregion

// #region 更新評論
export async function updateReview(
  reviewUuid: string,
  userUuid: string,
  rating: string | number,
  content?: string,
  newImages?: UploadedImage[],
  deletedImageUuids?: string[]
) {
  try {
    const parsedRating = validateReviewRating(rating)
    validateReviewContent(content)

    // 確保評論存在且屬於該使用者，沒有的話會丟錯誤
    const review = await checkReviewExists(reviewUuid, userUuid)

    const restaurantUuid = review.restaurant.uuid

    const result = await withPrismaTransaction(async tx => {
      // #region 如果評分有變動，才調整餐廳的 ratingSum
      let updatedRestaurant: any = null
      if (review.rating !== parsedRating) {
        const diff = calculateRatingDiff(review.rating, parsedRating)

        const restaurant = await restaurantRepo.adjustRestaurantRatingSum(
          restaurantUuid,
          diff,
          tx
        )

        const finalRating = calculateFinalRating(
          restaurant.ratingSum,
          restaurant.reviewCount
        )

        updatedRestaurant = await restaurantRepo.updateRestaurantRatingFinal(
          restaurantUuid,
          finalRating,
          restaurant.reviewCount,
          tx
        )
      } else {
        // 評分沒變 → 只拿最新 rating 資訊
        updatedRestaurant = await restaurantRepo.getRatingInfoByUuid(
          restaurantUuid,
          tx
        );
      }
      // #endregion

      await reviewRepo.updateReview(reviewUuid, {
        rating: parsedRating,
        content,
      }, tx
      )

      // 刪除圖片資料庫紀錄
      let imagesToDelete: ReviewImage[] = []
      if (deletedImageUuids?.length) {
        imagesToDelete = review.images.filter(img => deletedImageUuids.includes(img.uuid))
        if (imagesToDelete.length) {
          const uuidsToDelete = imagesToDelete.map(img => img.uuid)
          await reviewRepo.deleteImagesByUuid(uuidsToDelete, tx)
        }
      }

      if (newImages?.length) {
        const imagesToCreate = newImages.map(img => ({
          uuid: uuidv4(),         // 新增每張圖片的 uuid
          reviewId: review.id,             // 對應到該評論
          url: img.url,           // 圖片網址
          publicId: img.publicId, // Cloudinary publicId
        }))
        await reviewRepo.createImages(imagesToCreate, tx)
      }

      return { updatedRestaurant, imagesToDelete }
    })

    // transaction 結束後再刪除 Cloudinary 圖片（不阻塞主要流程） 
    if (result.imagesToDelete.length) {
      deleteCloudinaryImages(
        result.imagesToDelete.map(img => img.publicId)
      )
    }

    const updatedReview = await checkReviewExists(reviewUuid)

    return {
      review: toReviewItem(updatedReview),
      restaurantRating: {
        rating: formatNumber(result.updatedRestaurant.rating, 1),
        ratingCount: result.updatedRestaurant.ratingCount,
        reviewCount: result.updatedRestaurant.reviewCount,
      }
    }
  } catch (err) {
    // 捕捉 Prisma 已知錯誤（例如 transaction 失敗）
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError('資料庫操作失敗', {
        status: 500,
        code: 'DB_ERROR',
        debugMessage: err.message,
        cause: err,
      })
    }

    handleServiceError(err, '更新評論失敗')
  }
}
// #endregion


// #region 刪除評論
export async function deleteReview(
  reviewUuid: string,
  userUuid: string
) {
  try {
    // 確保評論存在且屬於該使用者，沒有的話會丟錯誤
    const review = await checkReviewExists(reviewUuid, userUuid)

    const restaurantUuid = review.restaurant.uuid

    const result = await withPrismaTransaction(async tx => {

      await reviewRepo.deleteReview(reviewUuid, tx)

      const restaurant = await restaurantRepo.decrementRestaurantRating(
        restaurantUuid,
        review.rating,
        tx
      )

      const finalRating = calculateFinalRating(
        restaurant.ratingSum,
        restaurant.reviewCount
      )

      const updatedRestaurant = await restaurantRepo.updateRestaurantRatingFinal(
        restaurantUuid,
        finalRating,
        restaurant.reviewCount,
        tx
      )
      return { updatedRestaurant }
    })

    const folderPath = `uploads/restaurants-images/${restaurantUuid}/reviews/${reviewUuid}`
    deleteCloudFolder(folderPath)

    return {
      restaurantRating: {
        rating: formatNumber(result.updatedRestaurant.rating, 1),
        ratingCount: result.updatedRestaurant.ratingCount,
        reviewCount: result.updatedRestaurant.reviewCount,
      }
    }
  } catch (err) {
    // 捕捉 Prisma 已知錯誤（例如 transaction 失敗）
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError('資料庫操作失敗', {
        status: 500,
        code: 'DB_ERROR',
        debugMessage: err.message,
        cause: err,
      })
    }

    handleServiceError(err, '刪除評論失敗')
  }
}
// #endregion