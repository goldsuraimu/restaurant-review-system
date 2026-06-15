import { request } from '@/utils/http/request'

import type {
  AdminRestaurantListQuery,
  RestaurantDetailApiResponse,
} from '@/types/restaurant'
import type {
  AdminRestaurantListApiResponse
} from '@/types/admin'

export function fetchPendingRestaurants(query: AdminRestaurantListQuery) {
  return request<AdminRestaurantListApiResponse>({
    url: `/admin/restaurants/pending`,
    method: 'GET',
    params: query,
  })
}

export function fetchRestaurantDetail(uuid: string) {
  return request<RestaurantDetailApiResponse>({
    url: `/admin/restaurants/${uuid}`,
    method: 'GET',
  })
}

export function approveRestaurant(
  restaurantUuid: string,
) {
  return request<void>({
    url: `/admin/restaurants/${restaurantUuid}/approve`,
    method: 'PATCH',
  })
}

export function rejectRestaurant(
  restaurantUuid: string, 
  reason: string
) {
  return request<void>({
    url: `/admin/restaurants/${restaurantUuid}/reject`,
    method: 'PATCH',
    data: { reason }
  })
}
