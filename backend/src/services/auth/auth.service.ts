import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Prisma } from '@prisma/client'

import { ApiError } from '#/utils/api-error'
import { toAuthUser } from '#/services/auth/auth.mapper'
import { getJwtSecret, getJwtRefreshSecret } from '#/utils/jwt-secrets';
import { verifyJwtObject } from '#/utils/jwtGuard';
import { handleServiceError } from '#/utils/service-error'

import * as userRepo from '#/repositories/user/user.repo'
import * as refreshTokenRepo from '#/repositories/auth/refresh-token.repo'

import {
  validateEmail,
  validateUsername,
  validateRealName,
  validatePassword,
  validateGender,
  validatePhone,
  validateBirthday,
} from '#/validators/userFields.validator'

import {
  USER_ROLES,
} from '#/types/domain/user'

import type {
  RegisterUserInput
} from '#/types/dto'
import type {
  CreateUserData,
} from '#/repositories/types/user'
import type {
  RefreshTokenPayload,
} from '#/types'

//#region 註冊使用者
export async function registerUser(userData: RegisterUserInput) {
  try {
    // 必填欄位驗證
    validateEmail(userData.email)
    validateUsername(userData.username)
    validateRealName(userData.realName)
    validatePassword(userData.password)

    // 非必填欄位
    if (userData.gender) validateGender(userData.gender)
    if (userData.phone) validatePhone(userData.phone)
    if (userData.birthday) validateBirthday(userData.birthday)

    // 建立使用者
    const passwordHash = await bcrypt.hash(userData.password, 12)
    const uuid = uuidv4()

    const createData: CreateUserData = {
      uuid,
      username: userData.username,
      realName: userData.realName,
      nickname: userData.nickname,
      gender: userData.gender,
      birthday: userData.birthday,
      phone: userData.phone,
      address: userData.address,
      email: userData.email,
      passwordHash,
      role: USER_ROLES.USER,
    }

    await userRepo.insertUser(createData)

    return {
      uuid,
      username: userData.username,
      nickname: userData.nickname ?? null,
      role: USER_ROLES.USER,
    }
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const targets = (err.meta?.target as string[]) || []

      if (targets.includes('email')) {
        throw new ApiError('此信箱已被註冊', { status: 409, code: 'EMAIL_EXISTS' })
      }
      if (targets.includes('username')) {
        throw new ApiError('此帳號名稱已被使用', { status: 409, code: 'USERNAME_EXISTS' })
      }
    }

    handleServiceError(err, '註冊失敗')
  }
}
//#endregion

//#region 登入
export async function loginUser(email: string, password: string) {
  try {
    const user = await userRepo.findByEmail(email)

    if (!user) {
      throw new ApiError('信箱或密碼錯誤', {
        status: 401,
        code: 'INVALID_CREDENTIALS',
      })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      throw new ApiError('信箱或密碼錯誤', {
        status: 401,
        code: 'INVALID_CREDENTIALS',
      })
    }

    const accessToken = jwt.sign(
      { sub: user.uuid, role: user.role },
      getJwtSecret(),
      { expiresIn: '15m' }
    );

    const jti = crypto.randomUUID()
    const refreshToken = jwt.sign(
      { sub: user.uuid, jti },
      getJwtRefreshSecret(),
      { expiresIn: '7d' }
    );

    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 3600

    await refreshTokenRepo.insert({
      id: jti,
      userUuid: user.uuid,
      expiresAt,
    })

    return {
      accessToken,
      refreshToken,
      user: toAuthUser(user),
    }
  } catch (err: unknown) {
    handleServiceError(err, '登入失敗')
  }
}
//#endregion

//#region 刷新 Token
export async function refreshUserToken(token: string) {
  try {

    const payload = verifyJwtObject<RefreshTokenPayload>(
      token,
      getJwtRefreshSecret(),
      ['sub', 'jti'],
      '刷新失敗，請重新登入'
    );

    const now = Math.floor(Date.now() / 1000);

    // 查詢 refresh token 是否存在且有效
    const record = await refreshTokenRepo.findById(payload.jti);

    // 不存在、已被撤銷或已過期都視為無效
    if (
      !record ||
      record.revokedAt ||
      record.expiresAt < now) {
      throw new ApiError('刷新失敗，請重新登入', {
        status: 401,
        code: 'REFRESH_FAILED',
      })
    }

    // 確認使用者存在
    const user = await userRepo.findByUUID(payload.sub)

    if (!user) {
      throw new ApiError('刷新失敗，請重新登入', {
        status: 401,
        code: 'REFRESH_FAILED',
      });
    }

    // 撤銷舊的 refresh token
    await refreshTokenRepo.revoke(payload.jti)

    // 產生新的 access token 和 refresh token
    const newJti = crypto.randomUUID()

    const accessToken = jwt.sign(
      { sub: user.uuid, role: user.role },
      getJwtSecret(),
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: payload.sub, jti: newJti },
      getJwtRefreshSecret(),
      { expiresIn: '7d' }
    );

    await refreshTokenRepo.insert({
      id: newJti,
      userUuid: payload.sub,
      expiresAt: now + 7 * 24 * 3600,
    })

    return { accessToken, refreshToken }
  } catch (err: unknown) {
    handleServiceError(err, '刷新失敗')
  }
}
//#endregion

//#region 登出
export async function logoutUser(refreshToken: string) {
  try {
    const payload = verifyJwtObject<RefreshTokenPayload>(
      refreshToken,
      getJwtRefreshSecret(),
      ['jti']
    )

    await refreshTokenRepo.revoke(payload.jti)
  } catch {
    // 吞掉錯誤，什麼都不要回給 client
  }
}
//#endregion

