import type { ApiError } from './api-error';

/**
 * 成功結果
 */
export type Success<T = void> = {
  ok: true;
  data?: T;
};

/**
 * 失敗結果（通用錯誤）
 */
export type Failure<E = ApiError> = {
  ok: false;
  error: E;
};

/**
 * 最基礎通用 Result
 * 用於純資料查詢（Query）
 */
export type Result<T = void> = Success<T> | Failure<ApiError>;

/**
 *  abortable 的 Result
 * 用於可取消的查詢，包含一種特殊的失敗狀態：canceled
 * 代表查詢被取消，且不視為錯誤
 */
export type CancelableResult<T = void> =
  | Result<T>
  | { ok: false; canceled: true }


  /**
 * Action 失敗結果
 * 包含兩種失敗情境：
 * 1. 一般錯誤（error）
 * 2. 狀態型失敗（reason），適用於業務邏輯層面的失敗，例如：正在提交中
 * handled 屬性用於標記錯誤是否已被處理，避免重複顯示錯誤訊息
 */
export type ActionFailure<E = ApiError, R extends string = never> =
  | ({ ok: false; error: E; handled?: boolean })
  | ({ ok: false; reason: R });


/**
 * Action 專用 Result
 * 可包含：
 * - 狀態型失敗（reason）
 * - 已處理錯誤標記（handled）
 */
export type ActionResult<
  T = void, 
  R extends string = never
  > =
  | Success<T>
  | ActionFailure<ApiError, R>;


