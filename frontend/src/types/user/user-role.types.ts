export const USER_ROLES = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const

export type UserRole =
  typeof USER_ROLES[keyof typeof USER_ROLES]