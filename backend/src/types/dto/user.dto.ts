import { Gender, UserRole } from '../domain'

// 註冊用（給 service層）
export interface RegisterUserInput {
  email: string;
  username: string;
  password: string;
  realName: string;
  nickname?: string;
  gender?: Gender
  birthday?: string;
  phone?: string;
  address?: string;
}

// 更新 Profile
export interface UpdateUserProfilePayload {
  realName?: string | null
  nickname?: string | null
  gender?: Gender
  birthday?: string | null
  phone?: string | null
  address?: string | null
}