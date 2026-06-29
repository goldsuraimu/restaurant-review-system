import { ApiError } from '#/utils/api-error'
import { checkRestaurantExists } from '#/services/restaurant/restaurant.helper'
import * as reviewRepo from '#/repositories/review/review.repo'
import { DBClient } from '#/types/database'


// #region 取得使用者個人資料（給其他 service 用的）  
export async function checkReviewExists(
  reviewUuid: string,
  userUuid?: string,
  tx?: DBClient
) {
  const review = await reviewRepo.findByUuid(reviewUuid, tx)
  if (!review) {
    throw new ApiError('評論不存在', {
      status: 404,
      code: 'REVIEW_NOT_FOUND',
    })
  }

  // 如果提供 userUuid，做權限檢查
  if (userUuid && review.user.uuid !== userUuid) {
    throw new ApiError('無權限', {
      status: 403,
      code: 'FORBIDDEN',
    })
  }

  return review
}
// #endregion

export async function checkOwnerReviewPermission(
  reviewUuid: string,
  ownerUuid: string
) {
  const review =
    await checkReviewExists(reviewUuid)

  const restaurant =
    await checkRestaurantExists(review.restaurant.uuid)

  if (restaurant.owner.uuid !== ownerUuid) {
    throw new ApiError('無權限', {
      status: 403,
      code: 'FORBIDDEN'
    })
  }

  return review
}