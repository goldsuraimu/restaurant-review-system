import { Prisma } from '@prisma/client'


export type UserProfileEntity = Prisma.UserGetPayload<{
  select: {
    uuid: true
    username: true
    email: true
    realName: true
    nickname: true
    gender: true
    birthday: true
    phone: true
    address: true
  }
}>


export function toProfileItem(user: UserProfileEntity) {
  return {
    uuid: user.uuid,
    username: user.username,
    email: user.email,
    realName: user.realName,
    nickname: user.nickname,
    gender: user.gender,
    birthday: user.birthday,
    phone: user.phone,
    address: user.address,
  }
}