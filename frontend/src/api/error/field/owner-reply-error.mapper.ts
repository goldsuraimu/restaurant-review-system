import type { ApiError } from '@/types';

type FieldErrors = Record<string, string>;

export function mapOwnerReplyErrorToFields(
  error: ApiError,
): FieldErrors 
{
  const fieldErrors: FieldErrors = {}

  switch (error.code) {
    case 'INVALID_REPLY_CONTENT':
      fieldErrors.content = '回覆內容格式不正確。';
      break;

    default:
      fieldErrors.general =
        error.message || '回覆處理失敗，請稍後再試。';
  }

  return fieldErrors
}