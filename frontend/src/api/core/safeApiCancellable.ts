import axios from 'axios'
import type { AxiosPromise } from 'axios'
import { handleError } from '@/api/error/handlers/handleError'
import type { ApiError } from '@/types'

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as any).message === 'string'
  )
}

export async function safeApiCancelable<T>(
  apiCall: AxiosPromise<T>
): Promise<
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
  | { ok: false; canceled: true }
> {
  try {
    const { data } = await apiCall
    return { ok: true, data }
  } catch (err: unknown) {
    // 取消請求
    if (axios.isCancel(err)) {
      return { ok: false, canceled: true }
    }

    // 其他錯誤
    const apiErr = isApiError(err) ? err : handleError(err)

    if (import.meta.env.DEV) {
      console.error(apiErr.debugMessage || apiErr.message, {
        requestId: apiErr.requestId
      })
    }

    return { ok: false, error: apiErr }
  }
}


