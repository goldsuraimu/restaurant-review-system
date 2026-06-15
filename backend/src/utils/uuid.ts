import { ApiError } from '#/utils/api-error'

export function assertValidUuid(uuid: unknown): string {
  if (typeof uuid !== 'string') {
    throw new ApiError('UUID 必須是字串', {
      status: 400,
      code: 'INVALID_UUID_TYPE',
    })
  }
  // 檢查 UUID 是否為有效格式
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (!uuidRegex.test(uuid)) {
    throw new ApiError('UUID 格式錯誤', {
      status: 400,
      code: 'INVALID_UUID',
    });
  }
  return uuid;
}
