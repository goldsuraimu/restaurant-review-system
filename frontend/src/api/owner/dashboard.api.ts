import { request } from '@/utils/http/request'

import type {
  OwnerDashboardApiResponse
} from '@/types/dashboard'

// Dashboard 聚合資料
export function fetchOwnerDashboardApi(query?: {
  ratingLimit?: number
  timezone: string
}) {
  return request<OwnerDashboardApiResponse>({
    url: '/api/owner/dashboard',
    method: 'GET',
    params: query
  })
}