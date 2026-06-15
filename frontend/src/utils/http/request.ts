import { api } from '@/api'
import { safeApi } from '@/api/core/safeApi'
import type { AxiosRequestConfig } from 'axios'

export function request<T>(config: AxiosRequestConfig) {
  return safeApi<T>(api.request(config))
}