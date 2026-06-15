export function formatNumber(value: number | null, digits = 2) {
  if (value === null || value === undefined) return null
  return Number(value.toFixed(digits))
}

export function formatPercent(value: number | null) {
  if (value === null || value === undefined) return null
  return Number((value * 100).toFixed(1))
}