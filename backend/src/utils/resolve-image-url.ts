export interface ResolveImageUrlOptions {
  useCdn?: boolean
}

/**
 * 將圖片相對路徑轉為可用的 URL
 *
 * @param path 圖片相對路徑（可為 null / undefined）
 * @param options 設定選項
 * @returns 完整圖片 URL 或 null
 */
export function resolveImageUrl(
  path: string | null | undefined
): string | null {
  if (!path) return null

  // 已經是完整 URL（例如 seed 資料、外部圖片）
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const baseURL = process.env.BASE_URL

  // 如果沒設定 base URL，就退回相對路徑（避免 runtime crash）
  if (!baseURL) {
    return path
  }

  return `${baseURL}${path}`
}
