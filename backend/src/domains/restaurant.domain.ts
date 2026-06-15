import { ApiError } from '#/utils/api-error'

// 計算餐廳最終評分
export function calculateFinalRating(
  ratingSum: number,
  reviewCount: number
): number | null {
  if (reviewCount === 0) return null
  if (reviewCount < 0) {
    throw new ApiError('評論數異常，不能小於 0', {
      status: 500,
      code: 'INVALID_REVIEW_COUNT',
    })
  }
  return ratingSum / reviewCount
}

// 計算更新評分時的差值
export function calculateRatingDiff(
  oldRating: number,
  newRating: number
): number {
  return newRating - oldRating
}