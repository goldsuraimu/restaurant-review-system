import type { ApiResponse } from '@/types'

import type {
  DashboardKpi,
  ReviewTrendItem,
  RatingDistributionItem
} from './dashboard.types'

export interface DashboardData {
  kpi: DashboardKpi
  reviewTrend: ReviewTrendItem[]
  ratingDistribution: RatingDistributionItem[]
}

export type OwnerDashboardApiResponse =
  ApiResponse<DashboardData>