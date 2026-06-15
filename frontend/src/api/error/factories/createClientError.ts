import type { ApiError } from '@/types'


export function createClientError(
  message: string,
  debugMessage?: string,
): ApiError {
  return {
    type: 'CLIENT_ERROR',
    message,
    debugMessage,
  }
}