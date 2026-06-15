import type { Gender } from '@/types/user';

//註冊表單「UI 狀態」專用型別
export type GenderFormValue = Gender | '';

export interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;

  realName: string;
  nickname: string;
  gender: GenderFormValue;
  birthday: string;
  phone: string;
  address: string;
}
