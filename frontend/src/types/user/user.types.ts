import type { UserRole } from './user-role.types';

export type Gender =
  | 'male'
  | 'female'
  | 'other';

// Auth 身分（token / navbar / guard）
export interface AuthUser {
  uuid: string;
  username: string;
  nickname?: string;
  role: UserRole;
}



// 使用者完整資料（Profile）
export interface UserProfile {
  uuid: string;
  username: string;
  email: string;

  realName?: string | null;
  nickname?: string | null;
  gender?: Gender | null;
  birthday?: string | null; // YYYY-MM-DD
  phone?: string | null;
  address?: string | null;
}


// 管理者用（Admin）
export interface UserAdmin extends UserProfile {
  role: UserRole;
  createdAt: string;
  updatedAt: string | null;
}
