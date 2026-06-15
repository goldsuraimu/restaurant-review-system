import { Request, Response, NextFunction } from 'express'

import { signUploadService } from '#/services/upload/upload.service'

/**
 * GET /upload/sign
 * 取得上傳簽名
 * - 根據 type 和參數產生對應的生成路徑
 * - 回傳簽名資訊給前端
 * - 錯誤處理：參數驗證錯誤、服務層錯誤等
 */
export async function signUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { type, ...params } = req.query as Record<string, string>

    const result = signUploadService({ type, params })

    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}