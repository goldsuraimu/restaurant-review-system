import type { UpdateUserProfilePayload } from '#/types/dto'

export function normalizeUserPayload(payload: UpdateUserProfilePayload): UpdateUserProfilePayload {
  return {
    ...payload,
    realName: payload.realName === null ? null : payload.realName?.trim(),
    nickname: payload.nickname === null ? null : payload.nickname?.trim(),
    phone: payload.phone === null ? null : payload.phone?.trim(),
    address: payload.address === null ? null : payload.address?.trim(),
  }
}