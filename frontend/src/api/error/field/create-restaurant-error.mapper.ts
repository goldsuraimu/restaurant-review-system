import type { ApiError } from '@/types';

type FieldErrors = Record<string, string>;

export function mapCreateRestaurantErrorToFields(
  err: ApiError
): FieldErrors {

  const fieldErrors: FieldErrors = {}

  switch (err.code) {
    case 'INVALID_RESTAURANT_NAME':
      fieldErrors.name = '餐廳名稱格式不正確'
      break

    case 'INVALID_RESTAURANT_NAME_EN':
      fieldErrors.nameEn = '英文名稱格式不正確'
      break

    case 'INVALID_RESTAURANT_CATEGORY':
      fieldErrors.category = '餐廳類別格式不正確'
      break

    case 'INVALID_RESTAURANT_LOCATION':
      fieldErrors.location = '址格式不正確'
      break

    case 'INVALID_RESTAURANT_PHONE':
      fieldErrors.phone = '電話格式不正確'
      break

    case 'INVALID_RESTAURANT_DESCRIPTION':
      fieldErrors.description = '介紹內容過長'
      break

    default:
      fieldErrors.general =
        err.message || '建立餐廳失敗，請檢查輸入內容'
  }

  return fieldErrors
}