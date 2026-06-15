import type { ApiError } from '@/types';

type FieldErrors = Record<string, string>;

export function mapLoginErrorToFields(
  err: ApiError,
): FieldErrors {
  const fieldErrors: FieldErrors = {}

  switch (err.code) {
    case 'INVALID_CREDENTIALS':
      fieldErrors.general = '信箱或密碼錯誤';
      break;
    default:
      fieldErrors.general = '登入失敗，請稍後再試';
  }

  return fieldErrors
}
