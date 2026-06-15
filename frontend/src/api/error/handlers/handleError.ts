import axios from 'axios';
import type { ApiError } from '@/types';

export function handleError(err: unknown): ApiError {
  // 已經是標準 ApiError（理論上 interceptor 會處理）
  if (isApiError(err)) {
    return err;
  }

  // Axios error（理論上很少進來）
  if (axios.isAxiosError(err)) {
    return {
      type: 'CLIENT_ERROR',
      message: '系統發生錯誤，請稍後再試',
      debugMessage: err.message,
    };
  }

  // JS Error
  if (err instanceof Error) {
    return {
      type: 'CLIENT_ERROR',
      message: '系統發生錯誤，請稍後再試',
      debugMessage: err.message,
    };
  }

  // unknown
  return {
    type: 'CLIENT_ERROR',
    message: '發生未知錯誤，請稍後再試',
    debugMessage: String(err),
  };
}

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    'message' in err
  );
}

