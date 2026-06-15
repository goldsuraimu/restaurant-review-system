import {
  USER_ROLES,
  type UserRole,
} from '@/types/user'

/* =========================
   Role Groups
   ========================= */

const OWNER_PANEL_ACCESS_ROLES: readonly UserRole[] = [
  USER_ROLES.OWNER,
  USER_ROLES.ADMIN,
]

const ADMIN_ACCESS_ROLES: readonly UserRole[] = [
  USER_ROLES.ADMIN,
]

const OWNER_APPLICABLE_ROLES: readonly UserRole[] = [
  USER_ROLES.USER,
]

/* =========================
   Permissions
   ========================= */

// 是否可進入店主管理後台
export function canAccessOwnerDashboard(
  role?: UserRole | null
) {
  if (!role) {
    return false
  }

  return OWNER_PANEL_ACCESS_ROLES.includes(role)
}

// 是否可進入管理員後台
export function canAccessAdminDashboard(
  role?: UserRole | null
) {
  if (!role) {
    return false
  }

  return ADMIN_ACCESS_ROLES.includes(role)
}

// 是否可申請成為店主
export function canBecomeOwner(
  role?: UserRole | null
) {
  if (!role) {
    return false
  }

  return OWNER_APPLICABLE_ROLES.includes(role)
}

// 是否為管理員
export function isAdmin(
  role?: UserRole | null
) {
  return role === USER_ROLES.ADMIN
}

// 是否為店主
export function isOwner(
  role?: UserRole | null
) {
  return role === USER_ROLES.OWNER
}

// 是否為一般使用者
export function isUser(
  role?: UserRole | null
) {
  return role === USER_ROLES.USER
}
