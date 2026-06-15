import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '#/utils/api-error';
import { verifyJwtObject } from '#/utils/jwtGuard';
import { getJwtSecret } from '#/utils/jwt-secrets';

import type { AccessTokenPayload } from '#/types';


export function authenticateToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.['access_token'];

    if (!token) {
      return next(new ApiError('未授權，請先登入', {
        status: 401,
        code: 'NO_TOKEN',
      }));
    }
    try {
      const payload = verifyJwtObject<AccessTokenPayload>(
        token,
        getJwtSecret(),
        ['sub'], // 強制確保一定有 sub
        '登入已失效，請重新登入'
      );

      req.auth = {
        uuid: payload.sub,
        role: payload.role,
      };

      next();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        return next(err);
      }

      // 非預期錯誤
      return next(new ApiError('無效的授權令牌', {
        status: 401,
        code: 'INVALID_TOKEN',
      }));
    }
  };
}
