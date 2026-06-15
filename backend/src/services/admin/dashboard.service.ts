import * as restaurantDraftRepo
  from '#/repositories/restaurant/restaurant-draft.repo'

import {
  handleServiceError,
} from '#/utils/service-error'

export async function getDashboardSummary() {

  try {

    const pendingRestaurantCount =
      await restaurantDraftRepo.countPendingRestaurants()

    return {
      pendingRestaurantCount,
    }

  } catch (err) {
    handleServiceError(
      err,
      '取得管理員 dashboard 摘要失敗'
    )
  }
}