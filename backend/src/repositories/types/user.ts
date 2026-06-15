import type { Gender, UserRole } from '#/types/domain'

// 註冊用（寫入 DB）
export interface CreateUserData {
  uuid: string;
  username: string;
  email: string;
  passwordHash: string;

  realName?: string;
  nickname?: string;
  gender?: Gender;
  birthday?: string;
  phone?: string;
  address?: string;

  role: UserRole;
}