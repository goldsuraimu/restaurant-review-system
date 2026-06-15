import type { Request, Response, NextFunction } from 'express';

import { ApiError } from '#/utils/api-error';

import type {
  UserRole,
} from '#/types/domain/user'

export function authorizeRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    
    // 如果 req.auth 不存在或 role 不在允許清單
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      return next(new ApiError('權限不足', { status: 403, code: 'FORBIDDEN' }));
    }
    next();
  };
}
