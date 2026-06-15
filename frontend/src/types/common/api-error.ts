export type ApiErrorType =
  | 'RESPONSE_ERROR'   // 後端有回應（4xx / 5xx）
  | 'NETWORK_ERROR'    // 網路 / timeout / CORS
  | 'CLIENT_ERROR'    // 前端錯誤
  | 'CONFIG_ERROR'  // axios config 錯誤
  | 'VALIDATION_ERROR' // 前端驗證錯誤
  
export interface ApiError {
  type: ApiErrorType; // 第一層分類
  message: string;    // 顯示給使用者
  debugMessage?: string; // 除錯用訊息
  requestId?: string; // 伺服器請求 ID  

  
  // 只在 RESPONSE_ERROR 時才有
  status?: number;    // HTTP 狀態碼
  code?: string;      // 後端自訂邏輯碼
}
