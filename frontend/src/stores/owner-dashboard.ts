import { ref } from 'vue'
import { defineStore } from 'pinia'
import camelcaseKeys from 'camelcase-keys'

import { fetchOwnerDashboardApi } from '@/api/owner/dashboard.api'

import type { Result } from '@/types'
import type {
  DashboardKpi,
  ReviewTrendItem,
  RatingDistributionItem
} from '@/types/dashboard'

export const useOwnerDashboardStore = defineStore(
  'owner-dashboard',
  () => {

    // state
    const kpi = ref<DashboardKpi>({
      restaurantCount: 0,
      unrepliedCount: 0,
      todayReviewsCount: 0,

      replyRate: 0,
      avgReplyTime: null,
      replyTimeP50: null,
      replyTimeP90: null,
      slowReplyRate: 0,

      avgRating: null
    })

    const reviewTrend = ref<ReviewTrendItem[]>([])
    const ratingDistribution = ref<RatingDistributionItem[]>([])

    const isFetching = ref(false)

    // 獲取使用者的時區（可用於 API 請求或顯示）
    const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // action
    async function loadDashboard(query?: {
      ratingLimit?: number
    }): Promise<Result<void>> {

      isFetching.value = true

      try {
        const result = await fetchOwnerDashboardApi({...query, timezone: getTimezone() })

        if (!result.ok) {
          return { ok: false, error: result.error }
        }

        const data = camelcaseKeys(result.data.result, { deep: true })
        
        kpi.value = data.kpi
        reviewTrend.value = data.reviewTrend
        ratingDistribution.value = data.ratingDistribution

        return { ok: true }

      } finally {
        isFetching.value = false
      }
    }

    return {
      kpi,
      reviewTrend,
      ratingDistribution,
      isFetching,
      loadDashboard
    }
  }
)