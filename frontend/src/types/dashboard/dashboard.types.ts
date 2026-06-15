export interface DashboardKpi {
  restaurantCount: number
  unrepliedCount: number
  todayReviewsCount: number

  // reply stats
  replyRate: number | null
  avgReplyTime: number | null
  replyTimeP50: number | null
  replyTimeP90: number | null
  slowReplyRate: number

  // rating
  avgRating: number | null
}

export interface ReviewTrendItem {
  date: string
  count: number
}

export interface RatingDistributionItem {
  restaurantName: string
  avgRating: number
}