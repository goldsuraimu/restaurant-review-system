import { toast } from 'vue3-toastify'

import type {
  ApiError,
} from '@/types'

export function resolveBusinessError(
  err: ApiError,
  errorMap: Record<string, string>,
): boolean {

  const message =
    err.code
      ? errorMap[err.code]
      : undefined

  if (!message) {
    return false
  }

  toast.error(message)

  return true
}