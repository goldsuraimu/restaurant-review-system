import type { Gender } from '@/types/user';

// 編輯個資（不含不可改欄位）
export interface EditProfileRequest {
  realName?: string | null
  nickname?: string | null
  gender?: Gender;
  birthday?: string
  phone?: string | null
  address?: string | null
}
