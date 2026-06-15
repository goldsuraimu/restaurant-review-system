import { formatNumber, formatPercent } from '#/utils/number'

export function formatDashboardResponse(data: any) {
  return {
    kpi: {
      restaurantCount: data.kpi.restaurantCount,
      unrepliedCount: data.kpi.unrepliedCount,
      todayReviewsCount: data.kpi.todayReviewsCount,

      replyRate: formatPercent(data.kpi.replyRate),
      slowReplyRate: formatPercent(data.kpi.slowReplyRate),

      avgRating: formatNumber(data.kpi.avgRating, 1),
      avgReplyTime: formatNumber(data.kpi.avgReplyTime, 0),

      replyTimeP50: formatNumber(data.kpi.replyTimeP50, 0),
      replyTimeP90: formatNumber(data.kpi.replyTimeP90, 0),
    },

    reviewTrend: data.reviewTrend,
    ratingDistribution: data.ratingDistribution.map((r: any) => ({
      restaurantName: r.restaurantName,
      avgRating: formatNumber(r.avgRating, 1) ?? 0
    }))
  }
}