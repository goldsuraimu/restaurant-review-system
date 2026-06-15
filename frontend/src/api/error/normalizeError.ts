import axios from 'axios'
import type { ApiError } from '@/types'


interface BackendErrorResponse {
  code?: string
  message?: string
  debugMessage?: string
}


export function normalizeAxiosError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      type: 'CLIENT_ERROR',
      message: '非預期錯誤',
      debugMessage: String(error),
    }
  }

  const res = error.response
  const requestId = 
    res?.headers?.['x-request-id'] ||
    res?.headers?.['X-Request-Id']

  // 有 response
  if (res) {
    const data = res.data as BackendErrorResponse

    return {
      type: 'RESPONSE_ERROR',
      status: res.status,
      code: data?.code,
      message: data?.message || '發生未知錯誤',
      debugMessage: data?.debugMessage || error.message,
      requestId,
    }
  }

  // request 有送出但沒有回應（網路錯誤、timeout、CORS）
  if (error.request) {
    return {
      type: 'NETWORK_ERROR',
      message: '網路連線異常，請稍後再試',
      debugMessage: error.message,
      requestId,
    }
  }

  // config error
  if (error.config) {
    return {
      type: 'CONFIG_ERROR',
      message: '系統設定錯誤，請聯絡管理員',
      debugMessage: error.message,
      requestId,
    }
  }

  // fallback
  return {
    type: 'CLIENT_ERROR',
    message: '系統錯誤',
    debugMessage: error.message,
    requestId,
  }
}