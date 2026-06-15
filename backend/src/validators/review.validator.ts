import { ApiError } from '#/utils/api-error'

/**
 * 驗證評分是否為合法數字（1~5）
 * @param rating - 可以是 number 或 string（前端 FormData 可能是 string）
 */
export function validateReviewRating(rating: number | string): number {
  const parsedRating = Number(rating)

  if (Number.isNaN(parsedRating)) {
    throw new ApiError('評分格式錯誤', {
      status: 400,
      code: 'INVALID_RATING',
    })
  }

  if (parsedRating < 1 || parsedRating > 5) {
    throw new ApiError('評分必須介於 1~5', {
      status: 400,
      code: 'INVALID_RATING',
    })
  }

  return parsedRating
}

/**
 * 驗證評論內容長度（最多 500 字）
 * @param content - 可選欄位
 */
export function validateReviewContent(content?: string): void {
  if (!content) return

  if (content.length > 500) {
    throw new ApiError('評論內容過長', {
      status: 400,
      code: 'INVALID_REVIEW_CONTENT',
    })
  }
}

/**
 * 驗證回覆內容長度（最多 500 字）
 * @param content - 回覆內容
 */
export function validateReplyContent(content: string): void {
  if (!content) {
    throw new ApiError('回覆內容必填', {
      status: 400,
      code: 'INVALID_REPLY_CONTENT',
    })
  }

  if (content.length > 500) {
    throw new ApiError('回覆內容過長，最多 500 字', {
      status: 400,
      code: 'INVALID_REPLY_CONTENT',
    })
  }
}