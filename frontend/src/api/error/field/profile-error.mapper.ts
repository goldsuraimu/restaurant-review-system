import type { ApiError } from '@/types';

type FieldErrors = Record<string, string>;

export function mapProfileErrorToFields(
  err: ApiError,
): FieldErrors {

  const fieldErrors: FieldErrors = {}

  switch (err.code) {
    case 'EMAIL_EXISTS':
      fieldErrors.email = '信箱已被註冊';
      break;
    case 'INVALID_REAL_NAME':
      fieldErrors.realName = '姓名格式不正確';
      break;
    case 'INVALID_USERNAME':
      fieldErrors.username = '帳號格式不正確';
      break;
    case 'INVALID_NICKNAME':
      fieldErrors.username = '暱稱格式不正確';
      break;
    case 'WEAK_PASSWORD':
      fieldErrors.password = '密碼強度不足';
      break;
    case 'INVALID_EMAIL':
      fieldErrors.email = '信箱格式不正確';
      break;
    case 'INVALID_GENDER':
      fieldErrors.gender = '性別格式不正確';
      break;
    case 'INVALID_BIRTHDAY':
      fieldErrors.birthday = '生日格式不正確';
      break;
    case 'BIRTHDAY_LOCKED':
      fieldErrors.birthday = '生日無法修改';
      break;
    case 'INVALID_PHONE':
      fieldErrors.phone = '電話格式不正確';
      break;
    case 'INVALID_ADDRESS':
      fieldErrors.address = '地址格式不正確';
      break;
    default:
      fieldErrors.general = '資料驗證失敗，請檢查輸入內容';
  }

  return fieldErrors
}