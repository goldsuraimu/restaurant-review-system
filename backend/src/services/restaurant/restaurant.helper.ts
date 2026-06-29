import { ApiError } from '#/utils/api-error'
import * as restaurantRepo from '#/repositories/restaurant/restaurant.repo'

import { DBClient } from '#/types/database'

// #region 檢查餐廳是否存在（供其他 service 呼叫）
export async function checkRestaurantExists(uuid: string, tx?: DBClient) {
  const restaurant = await restaurantRepo.findByUUIDWithOwner(uuid, tx)
  if (!restaurant) {
    throw new ApiError('找不到餐廳', {
      status: 404,
      code: 'RESTAURANT_NOT_FOUND',
    })
  }
  return restaurant
}
// #endregion
