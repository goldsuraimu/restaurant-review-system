/**
 * 將查詢參數正規化為關鍵字陣列
 * - 支援 string / string[] / 其他（回傳空陣列）
 */
export function normalizeKeywords(
  q: unknown
): string[] {
  if (!q) return []

  if (Array.isArray(q)) {
    return q
      .map(v => String(v).trim())
      .filter(Boolean)
  }

  if (typeof q === 'string') {
    return q
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  }

  return []
}
