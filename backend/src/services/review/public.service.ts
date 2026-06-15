import { handleServiceError } from '#/utils/service-error'

import { checkRestaurantExists } from '#/services/restaurant/restaurant.helper'
import { toReviewItem } from '#/services/review/review.mapper'
import * as reviewRepo from '#/repositories/review/review.repo'


// #region 取得餐廳評論（Cursor 分頁）
export async function getReviewsByRestaurant(
  restaurantUuid: string,
  options: {
    cursor?: string
    limit?: number
    sort?: 'latest' | 'oldest' | 'rating_desc' | 'rating_asc'
  }
) {
  try {
    await checkRestaurantExists(restaurantUuid)

    const {
      cursor,
      limit = 10,
      sort = 'latest',
    } = options

    const safeLimit =
      limit > 0 && limit <= 50
        ? limit
        : 10

    const rows = await reviewRepo.findByRestaurantUuidCursor({
      restaurantUuid,
      cursor,
      limit: safeLimit,
      sort,
    })

    const hasNext = rows.length > safeLimit
    const sliced = hasNext ? rows.slice(0, safeLimit) : rows

    const results = sliced.map(toReviewItem)

    return {
      results,
      nextCursor: hasNext ? sliced[sliced.length - 1].uuid : null,
      hasNext,
    }

  } catch (err) {
    handleServiceError(err, '取得餐廳評論失敗')
  }
}
// #endregion