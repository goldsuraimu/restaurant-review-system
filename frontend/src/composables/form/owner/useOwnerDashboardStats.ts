import { computed, type Ref } from 'vue'

import { formatDuration } from '@/utils/format'
import { formatPercent } from '@/utils/format'

import type { DashboardKpi } from '@/types/dashboard'


type Level = 'good' | 'ok' | 'bad' | 'none'

type ReplyTimeLevel = Level
type RatingLevel = Level
type ReplyHealthLevel = Level

export function useOwnerDashboardStats(
  kpi: Ref<DashboardKpi>
) {

  // 內部輔助函式：判定回覆等級
  const getReplyLevel = (ms: number | null): ReplyTimeLevel => {
    if (ms == null) return 'none'
    const hours = ms / (1000 * 60 * 60)
    if (hours < 1) return 'good'
    if (hours < 6) return 'ok'
    return 'bad'
  }

  // 內部輔助函式：取得回覆圖標 
  const getReplyIcon = (level: ReplyTimeLevel) => {
    const map = {
      good: 'bolt',
      ok: 'clock',
      bad: 'triangle-exclamation',
      none: 'minus'
    }
    return map[level]
  }

  // Rating 
  const avgRatingLevel = computed<RatingLevel>(() => {
    const val = kpi.value.avgRating

    if (val == null) return 'none'
    if (val >= 4.5) return 'good'
    if (val >= 3.5) return 'ok'
    return 'bad'
  })

  const avgRatingIcon = computed(() => {
    const map = {
      good: 'star',
      ok: 'star-half-stroke',
      bad: 'triangle-exclamation',
      none: 'minus'
    }
    return map[avgRatingLevel.value]
  })


  // 回覆率（replyRate）
  const replyRateLevel = computed<ReplyHealthLevel>(() => {
    const val = kpi.value.replyRate
    if (val == null) return 'none'
    if (val >= 90) return 'good'
    if (val >= 70) return 'ok'
    return 'bad'
  })

  const replyRateIcon = computed(() => {
    const map = {
      good: 'circle-check',
      ok: 'clock',
      bad: 'triangle-exclamation',
      none: 'minus'
    }
    return map[replyRateLevel.value]
  })

  const replyRateText = computed(() =>
    formatPercent(kpi.value.replyRate)
  )

  // 慢回覆率（slowReplyRate）
  const slowReplyRateLevel = computed<ReplyHealthLevel>(() => {
    const val = kpi.value.slowReplyRate
    if (val == null) return 'none'
    if (val < 10) return 'good'
    if (val < 30) return 'ok'
    return 'bad'
  })

  const slowReplyRateIcon = computed(() => {
    const map = {
      good: 'bolt',
      ok: 'clock',
      bad: 'triangle-exclamation',
      none: 'minus'
    }
    return map[slowReplyRateLevel.value]
  })

  const slowReplyRateText = computed(() =>
    formatPercent(kpi.value.slowReplyRate)
  )

  // 待回覆評論（unrepliedCount）
  const unrepliedLevel = computed<ReplyHealthLevel>(() => {
    const val = kpi.value.unrepliedCount
    if (val == null) return 'none'
    if (val === 0) return 'good'
    if (val < 5) return 'ok'
    return 'bad'
  })

  // ===== Reply Time =====

  // 平均值 (Level & Icon)
  const avgReplyLevel = computed(() => getReplyLevel(kpi.value.avgReplyTime))
  const avgReplyLevelIcon = computed(() => getReplyIcon(avgReplyLevel.value))

  // P50 (Level & Icon)
  const p50Level = computed(() => getReplyLevel(kpi.value.replyTimeP50))
  const p50Icon = computed(() => getReplyIcon(p50Level.value))

  // P90 (Level & Icon)
  const p90Level = computed(() => getReplyLevel(kpi.value.replyTimeP90))
  const p90Icon = computed(() => getReplyIcon(p90Level.value))


  const avgReplyTimeText = computed(() => formatDuration(kpi.value.avgReplyTime))
  const p50Text = computed(() => formatDuration(kpi.value.replyTimeP50))
  const p90Text = computed(() => formatDuration(kpi.value.replyTimeP90))

  return {
    avgRatingLevel,
    avgRatingIcon,


    replyRateLevel,
    replyRateIcon,
    replyRateText,

    slowReplyRateLevel,
    slowReplyRateIcon,
    slowReplyRateText,

    unrepliedLevel,

    avgReplyLevel,
    avgReplyLevelIcon,
    avgReplyTimeText,

    p50Level,    
    p50Icon,    
    p50Text,

    p90Level,    
    p90Icon,     
    p90Text
  }
}