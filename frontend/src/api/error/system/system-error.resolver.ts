import type { ApiError } from '@/types'
import { ERROR_MESSAGE_MAP } from './system-error.messages'

export type ErrorDecision = {
  handled: boolean
  shouldLogout: boolean
  message?: string
}

export function resolveApiError(err: ApiError): ErrorDecision {
  // 網路
  if (err.type === 'NETWORK_ERROR') {
    return {
      handled: true,
      shouldLogout: false,
      message: ERROR_MESSAGE_MAP.NETWORK_ERROR,
    }
  }

  // client
  if (err.type === 'CLIENT_ERROR') {
    return {
      handled: true,
      shouldLogout: false,
      message: ERROR_MESSAGE_MAP.CLIENT_ERROR,
    }
  }

  if (err.type === 'CONFIG_ERROR') {
    return {
      handled: true,
      shouldLogout: false,
      message: ERROR_MESSAGE_MAP.CLIENT_ERROR, // 統一顯示「系統設定錯誤」
    }
  }

  if (err.type === 'RESPONSE_ERROR') {
    if (err.status !== undefined) {
      if (err.status === 401) {
        if (
          err.code === 'REFRESH_FAILED' ||
          err.code === 'NO_TOKEN' ||
          err.code === 'INVALID_TOKEN'
        ) {
          return {
            handled: true,
            shouldLogout: true,
            message: ERROR_MESSAGE_MAP.UNAUTHORIZED,
          }
        }
      }

      if (err.status === 403) {
        return {
          handled: true,
          shouldLogout: false,
          message: ERROR_MESSAGE_MAP.FORBIDDEN,
        }
      }

      if (err.status >= 500) {
        return {
          handled: true,
          shouldLogout: false,
          message: ERROR_MESSAGE_MAP.SERVER_ERROR,
        }
      }
    }
  }

  return {
    handled: false,
    shouldLogout: false,
  }
}
