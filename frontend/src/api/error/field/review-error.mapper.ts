import type { ApiError } from '@/types';

type FieldErrors = Record<string, string>

export function mapReviewErrorToFields(
  error: ApiError,
): FieldErrors
{
  const fieldErrors: FieldErrors = {}

  switch (error.code) {
    case 'INVALID_RATING':
      fieldErrors.rating = '評分格式不正確。';
      break;

    case 'INVALID_REVIEW_CONTENT':
      fieldErrors.content = '評論內容過長。';
      break;

    default:
      fieldErrors.general =
        error.message || '評論處理失敗，請稍後再試。';
  }

  return fieldErrors
}
