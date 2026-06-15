import type { Gender } from '@/types/user';

export interface EditableProfile {
  realName: string
  nickname: string
  gender: Gender | ''
  birthday: string
  phone: string
  address: string
}
