import { request } from '@/utils/http/request'

import type { OwnerRestaurantRatingResponse } from '@/types/owner/restaurant-rating.response'

export function fetchOwnerRestaurantRatingApi(query: {
  page: number
  limit: number
}) {
  return request<OwnerRestaurantRatingResponse>({
    url: '/api/owner/restaurants/rankings',
    method: 'GET',
    params: query
  })
}