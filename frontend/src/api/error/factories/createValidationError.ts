import type { ApiError } from '@/types'


export function createValidationError(
  message: string,
): ApiError {
  return {
    type: 'VALIDATION_ERROR',
    message,
  }
}