import { ApiError } from '#/utils/api-error'

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new ApiError('JWT_SECRET 未設定', {
      status: 500,
      code: 'JWT_SECRET_MISSING',
      type: 'CONFIG_ERROR'
    })
  }
  return secret
}

export function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) {
    throw new ApiError('JWT_REFRESH_SECRET 未設定', {
      status: 500,
      code: 'JWT_REFRESH_SECRET_MISSING',
      type: 'CONFIG_ERROR'
    })
  }
  return secret
}
