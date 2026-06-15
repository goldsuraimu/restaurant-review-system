import { request } from '@/utils/http/request'

import type {
  AdminDashboardSummaryApiResponse,
} from '@/types/admin'

export function fetchAdminDashboardSummary() {
  return request<AdminDashboardSummaryApiResponse>({
    url: '/admin/dashboard/summary',
    method: 'GET',
  })
}