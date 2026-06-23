import { ApiError } from '#/utils/api-error'
import { normalizeKeywords } from '#/utils/normalize-keywords'
import { handleServiceError } from '#/utils/service-error'
import { buildMeta } from '#/utils/pagination-meta'

import * as restaurantRepo from '#/repositories/restaurant/restaurant.repo'
import * as restaurantSearchRepo from '#/repositories/restaurant/restaurant-search.raw'
import {
  toRestaurantListItemFromRaw,
  toPublicRestaurantListItemFromPrisma,
  toRestaurantDetail,
} from './restaurant.mapper'

import type {
  RestaurantSortField,
  SortOrder
} from '#/types/http'


interface ListRestaurantsQuery {
  qRaw?: string
  page?: number
  limit?: number
  sort?: RestaurantSortField
  order?: SortOrder
}


// #region 取得餐廳列表
export async function listRestaurants(query: ListRestaurantsQuery) {
  try {
    const {
      qRaw,
      page = 1,
      limit = 12,
      sort = 'createdAt',
      order = 'desc',
    } = query

    const keywords = normalizeKeywords(qRaw)

    const safePage = page > 0 ? page : 1
    const safeLimit = limit > 0 ? limit : 12
    const sortOrder: SortOrder = order === 'asc' ? 'asc' : 'desc'

    // relevance 搜尋
    if (sort === 'relevance') {

      const { total, rows } =
        await restaurantSearchRepo.findRestaurantListWithRelevance({
          keywords,
          page: safePage,
          limit: safeLimit,
        })

      return {
        results: rows.map(toRestaurantListItemFromRaw),
        meta: buildMeta(total, safePage, safeLimit),
      }
    }

    // 一般搜尋
    const { total, rows } = await restaurantRepo.findSimpleList({
      keywords,
      page: safePage,
      limit: safeLimit,
      sortColumn: sort,
      sortOrder,
    })

    return {
      results: rows.map(toPublicRestaurantListItemFromPrisma),
      meta: buildMeta(total, safePage, safeLimit),
    }
  } catch (err) {
    handleServiceError(err, '取得餐廳列表失敗')
  }
}
// #endregion

// #region 取得單一餐廳
export async function getRestaurantByUuid(restaurantUuid: string) {
  try {
    const restaurant = await restaurantRepo.findByUUID(restaurantUuid)

    if (!restaurant) {
      throw new ApiError('找不到餐廳', {
        status: 404,
        code: 'RESTAURANT_NOT_FOUND',
      })
    }

    return toRestaurantDetail(restaurant)
  } catch (err) {
    handleServiceError(err, '取得餐廳失敗')
  }
}
// #endregion

