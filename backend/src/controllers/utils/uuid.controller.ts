import { v4 as uuidv4 } from 'uuid'

import type { Request, Response, NextFunction } from 'express';

/**
 * GET /api/utils/uuid
 * 產生一個新的 UUID，供前端在需要時使用（例如：上傳圖片時作為 public_id）
 * - 需要驗證使用者身份
 */
export async function createUuid(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({ uuid: uuidv4() });
  } catch (err: unknown) {
    next(err);
  }
}