import { request } from '@/utils/http/request'

import type { AxiosRequestConfig } from 'axios'
import type {
  RestaurantOwnerListApiResponse,
  RestaurantOwnerListQuery,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  RestaurantOwnerDetailApiResponse,
  RestaurantDisplayStatus,
} from '@/types/restaurant'

const BASE_PATH = 'api/owner/restaurants'

// 取得店家餐廳列表
export function fetchOwnerRestaurantsApi(
  query: RestaurantOwnerListQuery,
  options?: AxiosRequestConfig
) {
  return request<RestaurantOwnerListApiResponse>({
    method: 'GET',
    url: BASE_PATH,
    params: query,
    ...options
  })
}

// 取得單一餐廳
export function fetchOwnerRestaurantDetailApi(
  restaurantUuid: string,
) {
  return request<RestaurantOwnerDetailApiResponse>({
    method: 'GET',
    url: `${BASE_PATH}/${restaurantUuid}`,
  })
}

// 新增餐廳
export function createRestaurantApi(
  payload: CreateRestaurantRequest
) {
  return request<void>({
    method: 'POST',
    url: BASE_PATH,
    data: payload,
  })
}

// 更新餐廳
export function updateRestaurantApi(
  restaurantUuid: string,
  payload: UpdateRestaurantRequest
) {
  return request<void>({
    method: 'PATCH',
    url: `${BASE_PATH}/${restaurantUuid}`,
    data: payload,
  })
}


// 刪除餐廳
export function deleteRestaurantApi(
  restaurantUuid: string,
  displayStatus: RestaurantDisplayStatus
) {
  return request<void>({
    method: 'DELETE',
    url: `${BASE_PATH}/${restaurantUuid}`,
    data: {
      displayStatus
    }
  })
}