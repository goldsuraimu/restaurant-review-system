import { handleServiceError } from '#/utils/service-error'
import { getTimezoneContext } from '#/utils/time'
import { formatDashboardResponse } from './dashboard.mapper'

import * as dashboardRepo from '#/repositories/dashboard/dashboard.repo'

export interface GetOwnerDashboardParams {
  ownerUuid: string
  ratingLimit?: number
  timezone?: string
  days?: number
}

export async function getOwnerDashboard({
  ownerUuid,
  ratingLimit = 5,
  timezone,
  days = 7
}: GetOwnerDashboardParams) {
  try {

    const { startOfToday, startOfNextDay, since, until, labels } = getTimezoneContext(timezone, days)

    // KPI：餐廳數
    const restaurantCount =
      await dashboardRepo.countOwnerRestaurants(ownerUuid)

    // KPI：待回覆評論數
    const unrepliedCount =
      await dashboardRepo.countUnrepliedReviews(ownerUuid)

    // KPI：今日新增評論數
    const todayReviewsCount = await dashboardRepo.countTodayReviews(
      ownerUuid,
      startOfToday,
      startOfNextDay
    )


    // KPI：平均評分
    const avgRating =
      await dashboardRepo.getAverageRating(ownerUuid)

    // KPI：平均回覆時間
    const replyStats =
      await dashboardRepo.getReplyTimeStats(ownerUuid)

    const stats = replyStats?.[0] ?? {
      avgReplyTime: null,
      p50: null,
      p90: null,
      slowRate: 0
    }

    const replyRate =
      await dashboardRepo.getReplyRate(ownerUuid)


    // 評論趨勢
    const raw = await dashboardRepo.getReviewTrend(ownerUuid, since, until)
    const map = new Map(raw.map(r => [r.date, r.count]))

    // 因為 SQL 查詢是以天為單位，所以 date 欄位實際上是從 since 開始的天數索引
    const reviewTrend = labels.map((date, i) => ({
      date,
      count: map.get(i) ?? 0
    }))

    // 評分分佈
    const ratingDistributionRaw =
      await dashboardRepo.findTopOwnerRestaurantsByBayesian(ownerUuid, ratingLimit)

    const ratingDistribution = ratingDistributionRaw.map(r => ({
      restaurantName: r.restaurantName,
      avgRating: r.avgRating ?? 0
    }))

    return formatDashboardResponse({
      kpi: {
        restaurantCount,
        unrepliedCount,
        todayReviewsCount,
        replyRate,
        avgReplyTime: stats.avgReplyTime,
        replyTimeP50: stats.p50,
        replyTimeP90: stats.p90,
        slowReplyRate: stats.slowRate,
        avgRating
      },
      reviewTrend,
      ratingDistribution
    })
  } catch (err) {
    handleServiceError(err, '取得 Owner Dashboard 失敗')
  }
}