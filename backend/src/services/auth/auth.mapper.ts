import type { User as PrismaUser, Prisma } from '@prisma/client'

type AuthUser = Prisma.UserGetPayload<{
  select: { 
    uuid: true 
    username: true
    nickname: true
    role: true
  }
}>

export function toAuthUser(user: PrismaUser): AuthUser {
  return {
    uuid: user.uuid,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
  }
}