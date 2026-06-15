import type { ApiError } from '@/types'
import { resolveApiError } from '../system/system-error.resolver'

export function resolveErrorMessage(
  err: ApiError,
  fallback = '發生未知錯誤'
): string {
  const decision = resolveApiError(err)

  return (
    decision.message ||
    err.message ||
    fallback
  )
}
