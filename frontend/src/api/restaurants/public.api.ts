import { request } from '@/utils/http/request'
import type { AxiosRequestConfig } from 'axios'
import { createRequestCancelable } from '@/utils/http/request-cancelable'
import type {
  RestaurantPublicListApiResponse,
  RestaurantDetailApiResponse,
  RestaurantPublicListQuery
} from '@/types/restaurant'

const BASE_PATH = '/api/restaurants'

const restaurantSearchRequest = createRequestCancelable()

// 餐廳列表 ( 公開 ) - 可取消請求版本
export function fetchRestaurantsCancelableApi(
  query: RestaurantPublicListQuery
) {
  return restaurantSearchRequest<RestaurantPublicListApiResponse>({
    method: 'GET',
    url: BASE_PATH,
    params: query,
  })
}

// 餐廳列表 ( 公開 )
export function fetchRestaurantsApi(
  query: RestaurantPublicListQuery,
  options?: AxiosRequestConfig
) {
  return request<RestaurantPublicListApiResponse>({
    method: 'GET',
    url: BASE_PATH,
    params: query,
    ...options
  })
}

// 餐廳詳細資訊 ( 公開 )
export function fetchRestaurantDetailApi(
  uuid: string,
  options?: AxiosRequestConfig
) {
  return request<RestaurantDetailApiResponse>({ 
    method: 'GET',
    url: `${BASE_PATH}/${uuid}`,
    ...options
  })
}