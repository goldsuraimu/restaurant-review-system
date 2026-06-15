import { ApiError } from '#/utils/api-error'

export function handleServiceError(
  err: unknown,
  message: string
): never {
  if (err instanceof ApiError) throw err

  throw new ApiError(message, {
    status: 500,
    code: 'SERVER_ERROR',
    debugMessage: err instanceof Error ? err.message : String(err),
    cause: err,
  })
}