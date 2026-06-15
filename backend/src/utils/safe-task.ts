import logger from './logger'

/**
 * SafeTaskResult - 安全任務回傳型別
 *
 * @template T 任務成功回傳的型別
 */
export type SafeTaskResult<T> = {
  /** 任務是否成功 */
  success: boolean
  /** 成功回傳值，失敗為 null */
  data: T | null
  /** 失敗時保留的錯誤 */
  error?: unknown
}

/**
 * 安全執行單個 async 任務（進階版）
 *
 * 特性：
 * - 成功：回傳 { success: true, data }
 * - 失敗：回傳 { success: false, data: null }，並記錄 warn log
 * - 不會 throw error，中斷主流程
 *
 * @template T 任務回傳型別
 * @param taskName 任務名稱（用於 log）
 * @param fn async 任務
 * @returns SafeTaskResult<T>
 */
export async function safeTask<T>(
  taskName: string,
  fn: () => Promise<T>
): Promise<SafeTaskResult<T>> {
  try {
    const data = await fn()
    logger.info(`[任務成功] ${taskName}`)
    return { success: true, data }
  } catch (err) {
    logger.warn(`[任務失敗] ${taskName}`, { cause: err })
    return { success: false, data: null, error: err }
  }
}

/**
 * 安全執行多個 async 任務
 *
 * @template T 任務回傳型別
 * @param tasks Array<{ name: string, fn: () => Promise<T> }>
 * @returns SafeTaskResult<T>[]
 */
export async function safeTaskMany<T>(
  tasks: { name: string; fn: () => Promise<T> }[]
): Promise<SafeTaskResult<T>[]> {
  return Promise.all(tasks.map(t => safeTask(t.name, t.fn)))
}

/** 
 * 範例：刪除多個檔案
 * 
 * const results = await safeTaskMany(
 *   files.map(file => ({
 *     name: `刪除檔案 ${file.path}`,
 *     fn: async () => fs.promises.unlink(file.path),
 *   }))
 * )
 * 
 * const successFiles = results.filter(r => r.success).map(r => r.data)
 * const failedFiles = results.filter(r => !r.success)
 */