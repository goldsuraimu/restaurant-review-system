import validator from 'validator'

import { ApiError } from '#/utils/api-error'

import type { Gender } from '#/types/domain/user'

export function validateEmail(email: string): void {
  if (!validator.isEmail(email)) {
    throw new ApiError('信箱格式不正確', {
      status: 400,
      code: 'INVALID_EMAIL'
    })
  }
}

export function validateUsername(username: string): void {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new ApiError('帳號格式不正確', {
      status: 400,
      code: 'INVALID_USERNAME'
    })
  }
}

export function validateRealName(realName: string | null): void {
  if (realName === null) return

  if (!/^[A-Za-z\u4E00-\u9FFF·\s]{2,30}$/.test(realName)) {
    throw new ApiError('真實姓名格式不正確', {
      status: 400,
      code: 'INVALID_REAL_NAME'
    })
  }
}

export function validateNickname(nickname: string | null): void {
  if (nickname === null) return

  if (typeof nickname !== 'string') {
    throw new ApiError('暱稱格式不正確', { status: 400, code: 'INVALID_NICKNAME' })
  }

  if (nickname.length < 1 || nickname.length > 30) {
    throw new ApiError('暱稱長度需為 1~30 字', { status: 400, code: 'INVALID_NICKNAME' })
  }

  // 避免全空白
  if (nickname.trim().length === 0) {
    throw new ApiError('暱稱不可為空白', { status: 400, code: 'INVALID_NICKNAME' })
  }
}

export function validatePassword(password: string): void {
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError('密碼強度不足', {
      status: 400,
      code: 'WEAK_PASSWORD'
    })
  }
}


export function validateGender(gender: Gender): void {
  if (!['male', 'female', 'other'].includes(gender)) {
    throw new ApiError('性別格式不正確', {
      status: 400,
      code: 'INVALID_GENDER'
    })
  }
}

export function validatePhone(phone: string | null): void {
  if (phone === null) return

  if (! /^0[2-9]\d{7,8}$/.test(phone)) {
    throw new ApiError('電話格式不正確', {
      status: 400,
      code: 'INVALID_PHONE'
    })
  }
}

export function validateBirthday(birthday: string | null): void {
  if (birthday === null) return

  if (typeof birthday !== 'string') {
    throw new ApiError('生日格式不正確', {
      status: 400,
      code: 'INVALID_BIRTHDAY'
    })
  }

  const today = new Date().toISOString().slice(0, 10)

  if (birthday < '1900-01-01' || birthday > today) {
    throw new ApiError('生日格式不正確', {
      status: 400,
      code: 'INVALID_BIRTHDAY'
    })
  }
}

export function validateAddress(address: string | null): void {
  if (address === null) return

  if (!address || address.length < 5 || address.length > 100) {
    throw new ApiError('地址格式不正確', {
      status: 400,
      code: 'INVALID_ADDRESS'
    })
  }
}
