import { api } from '@/api'
import type { AxiosRequestConfig } from 'axios'
import { safeApiCancelable } from '@/api/core/safeApiCancellable'

export function createRequestCancelable() {
  let controller: AbortController | null = null

  return function requestCancelable<T>(
    config: AxiosRequestConfig
  ) {
    controller?.abort()
    controller = new AbortController()

    return safeApiCancelable<T>(
      api.request({
        ...config,
        signal: controller.signal,
      })
    )
  }
}
