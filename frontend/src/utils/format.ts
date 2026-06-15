export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || isNaN(ms)) return '--' // 或者回傳 '尚未回覆'

  const minutes = ms / (1000 * 60)
  const hours = ms / (1000 * 60 * 60)
  const days = ms / (1000 * 60 * 60 * 24)

  if (minutes < 60) return `${Math.round(minutes)} 分鐘`
  if (hours < 24) return `${Math.round(hours)} 小時`
  return `${days.toFixed(1)} 天`
}


export function formatPercent(value: number | null) {
  if (value == null) return '—'
  return `${value}%`
}