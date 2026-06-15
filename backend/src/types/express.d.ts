import 'express-serve-static-core';
import type { Multer } from 'multer';

import type { UserRole } from '#/types/domain/user'

declare module 'express-serve-static-core' {
  interface Request {
    // 全域 request ID，用於追蹤請求 
    requestId?: string;

    // 認證資訊，登入後會設定
    auth: {
      uuid: string;
      role: UserRole;
    };

    // Multer 上傳檔案欄位
    files?: Record<string, Multer.File[]>;

  }
}