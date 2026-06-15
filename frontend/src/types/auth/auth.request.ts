import type { Gender } from '@/types/user';

// Auth Request
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;

  // 以下「可選」
  realName?: string;
  nickname?: string;
  gender?: Gender;
  birthday?: string;
  phone?: string;
  address?: string;
}

