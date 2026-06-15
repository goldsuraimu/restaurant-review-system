import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '#/utils/api-error';

type RequiredKeys<T> = keyof T;

/**
 * 驗證 JWT 並確保回傳物件型別 payload
 * @param token JWT 字串
 * @param secret 驗證用密鑰
 * @param requiredKeys 可選，指定 payload 必須包含的欄位
 * @param errorMessage 驗證失敗時的錯誤訊息
 * @returns payload 物件
 */
export function verifyJwtObject<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string,
  requiredKeys?: RequiredKeys<T>[],
  errorMessage = 'JWT 驗證失敗'
): T {
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError('登入已過期，請重新登入', {
        status: 401,
        code: 'TOKEN_EXPIRED',
        cause: err,
      });
    }

    throw new ApiError(errorMessage, {
      status: 401,
      code: 'INVALID_TOKEN',
      cause: err,
    });
  }

  if (typeof decoded !== 'object' || decoded === null) {
    throw new ApiError(errorMessage, { status: 401, code: 'INVALID_TOKEN' });
  }

  const payload = decoded as T;

  // 如果指定了必須欄位，檢查每個欄位是否存在
  if (requiredKeys) {
    for (const key of requiredKeys) {
      if (!(key in payload)) {
        throw new ApiError(
          `${errorMessage}: missing required field "${String(key)}"`,
          { status: 401, code: 'INVALID_TOKEN' }
        );
      }
    }
  }

  return payload;
}
