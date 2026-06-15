export interface ApiErrorOptions {
  status?: number
  code?: string
  debugMessage?: string
  type?: string
  cause?: unknown
}

/**
 * API 層統一使用的錯誤物件
 * - message：可安全回傳給前端
 * - status：HTTP 狀態碼（預設 500）
 * - code：前端可判斷的錯誤代碼
 * - debugMessage：原始錯誤訊息，僅後端 / log 使用
 * - type：錯誤分類（例如 NETWORK_ERROR）
 * - cause: 原始錯誤，僅後端 / log 使用
 */
export class ApiError extends Error {
  status: number
  code?: string
  debugMessage?: string
  type?: string
  cause?: unknown

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);

    const {
      status = 500,
      code,
      debugMessage,
      type,
      cause,
    } = options

    this.status = status;
    this.code = code;
    this.debugMessage = debugMessage;
    this.type = type;
    this.cause = cause;
  }
}

