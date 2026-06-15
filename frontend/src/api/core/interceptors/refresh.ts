import type { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

let isRefreshing = false;

type QueueItem = {
  request: AxiosRequestConfig & { _retry?: boolean };
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

let queue: QueueItem[] = [];

export function setupRefreshInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    res => res,
    async (error: AxiosError) => {
      const res = error.response;
      const data = res?.data as Partial<ApiError> | undefined;
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };
      /* ========= 非 token 過期，直接拋出 ========= */
      if (!res || (data?.code !== 'TOKEN_EXPIRED' && data?.code !== 'NO_TOKEN')) {
        return Promise.reject(error);
      }
      /* ========= refresh 自己失敗，禁止再 refresh ========= */
      if (originalRequest.url?.includes('/api/auth/refresh-token')) {
        return Promise.reject(error);
      }
      /* ========= retry 保護（防止無限循環） ========= */
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      /* ========= 第一個觸發 refresh ========= */
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await api.post('/api/auth/refresh-token');

          /* refresh 成功 → 重試 queue 中「各自的 request」 */
          queue.forEach(({ request, resolve }) => {
            resolve(api(request));
          });
          queue = [];
        } catch (refreshError) {
          /* refresh 失敗 → reject 所有排隊請求 */
          queue.forEach(({ reject }) => {
            reject(refreshError);
          });
          queue = [];

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }

        /* 第一個 request 自己重試 */
        return api(originalRequest);
      }

      /* ========= refresh 進行中 → 排隊 ========= */
      return new Promise((resolve, reject) => {
        queue.push({
          request: originalRequest,
          resolve,
          reject
        });
      });
    }
  );
}
