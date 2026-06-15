import { normalizeAxiosError } from '@/api/error/normalizeError'

import type { AxiosInstance } from 'axios';

export function setupErrorInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    res => res,
    error => {
      return Promise.reject(normalizeAxiosError(error))
    }
  )
}
