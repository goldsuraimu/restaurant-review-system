export const USER_ROLES = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const

export type UserRole =
  typeof USER_ROLES[keyof typeof USER_ROLES]

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const

export type Gender =
  typeof GENDERS[keyof typeof GENDERS]




