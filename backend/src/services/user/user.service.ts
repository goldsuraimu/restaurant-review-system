import jwt from 'jsonwebtoken'

import { ApiError } from "#/utils/api-error"
import { handleServiceError } from '#/utils/service-error'
import { getJwtSecret } from '#/utils/jwt-secrets';

import * as userRepo from "#/repositories/user/user.repo"
import {
  validateRealName,
  validateNickname,
  validateGender,
  validatePhone,
  validateAddress,
  validateBirthday,
} from "#/validators/userFields.validator"
import { normalizeUserPayload } from './user.normalize'
import { toProfileItem } from "#/services/user/user.mapper"

import type { UpdateUserProfilePayload } from "#/types/dto"

import { USER_ROLES } from "#/types/domain/user"

// #region 取得目前使用者資訊
export async function getCurrentUser(uuid: string) {
  try {
    const user = await userRepo.findByUUID(uuid)

    if (!user) {
      throw new ApiError("使用者不存在", {
        status: 404,
        code: "USER_NOT_FOUND",
      })
    }

    return {
      uuid: user.uuid,
      username: user.username,
      nickname: user.nickname,
      role: user.role,
    }
  } catch (err) {
    handleServiceError(err, '取得使用者失敗')
  }
}
// #endregion

// #region 取得我的個人資料
export async function getMyProfile(uuid: string) {
  try {
    const user = await userRepo.findByUUID(uuid)

    if (!user) {
      throw new ApiError("使用者不存在", {
        status: 404,
        code: "USER_NOT_FOUND",
      })
    }

    return toProfileItem(user)
  } catch (err) {
    handleServiceError(err, '取得使用者失敗')
  }
}
// #endregion

// #region 更新我的個人資料
export async function updateMyProfile(
  userUuid: string,
  payload: UpdateUserProfilePayload
) {
  try {
    const user = await userRepo.findByUUID(userUuid)

    if (!user) {
      throw new ApiError("使用者不存在", {
        status: 404,
        code: "USER_NOT_FOUND",
      })
    }

    const normalizedPayload = normalizeUserPayload(payload)

    const updatePayload: Partial<UpdateUserProfilePayload> = {}

    if (normalizedPayload.realName !== undefined && normalizedPayload.realName !== user.realName) {
      validateRealName(normalizedPayload.realName)
      updatePayload.realName = normalizedPayload.realName
    }

    if (normalizedPayload.nickname !== undefined && normalizedPayload.nickname !== user.nickname) {
      validateNickname(normalizedPayload.nickname)
      updatePayload.nickname = normalizedPayload.nickname
    }

    if (normalizedPayload.gender !== undefined && normalizedPayload.gender !== user.gender) {
      validateGender(normalizedPayload.gender)
      updatePayload.gender = normalizedPayload.gender
    }

    if (normalizedPayload.phone !== undefined && normalizedPayload.phone !== user.phone) {
      validatePhone(normalizedPayload.phone)
      updatePayload.phone = normalizedPayload.phone
    }

    if (normalizedPayload.address !== undefined && normalizedPayload.address !== user.address) {
      validateAddress(normalizedPayload.address)
      updatePayload.address = normalizedPayload.address
    }

    if (normalizedPayload.birthday !== undefined) {
      if (user.birthday) {
        throw new ApiError("生日設定後不可修改", {
          status: 400,
          code: "BIRTHDAY_LOCKED",
        })
      }
      validateBirthday(normalizedPayload.birthday)
      updatePayload.birthday = normalizedPayload.birthday
    }

    if (Object.keys(updatePayload).length === 0) {
      return toProfileItem(user)
    }

    const updatedUser =
      await userRepo.updateProfileByUUID(
        userUuid,
        updatePayload
      )


    return toProfileItem(updatedUser)
  } catch (err) {
    handleServiceError(err, '更新使用者資料失敗')
  }
}
// #endregion


// #region 成為店主
export async function becomeOwner(
  userUuid: string
) {

  try {

    const user =
      await userRepo.findByUUID(
        userUuid
      )

    if (!user) {
      throw new ApiError(
        '使用者不存在',
        {
          status: 404,
          code: 'USER_NOT_FOUND',
        }
      )
    }

    // 已經是 owner / admin 就不能再申請成為店主了
    if (
      user.role === USER_ROLES.OWNER ||
      user.role === USER_ROLES.ADMIN
    ) {
      throw new ApiError(
        '目前帳號無法申請成為店主',
        {
          status: 400,
          code: 'ROLE_NOT_ALLOWED',
        }
      )
    }

    const updatedUser =
      await userRepo.updateRoleByUUID(
        userUuid,
        USER_ROLES.OWNER
      )

    const accessToken = jwt.sign(
      {
        sub: updatedUser.uuid,
        role: updatedUser.role,
      },
      getJwtSecret(),
      {
        expiresIn: '15m',
      }
    )

    return { 
      user: {
        uuid: updatedUser.uuid, 
        username: updatedUser.username, 
        nickname: updatedUser.nickname, 
        role: updatedUser.role,
      },
      accessToken
    }

  } catch (err) {

    handleServiceError(
      err,
      '成為店主失敗'
    )
  }
}
// #endregion