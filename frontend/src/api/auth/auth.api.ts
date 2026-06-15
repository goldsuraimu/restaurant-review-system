import { request } from '@/utils/http/request'
import type {
  RegisterRequest,
  LoginRequest,
} from '@/types/auth'

import type {
  AuthUser
} from '@/types/user'

import type {
  ApiResponse
} from '@/types'


// 註冊
export function registerApi(payload: RegisterRequest) {
  return request<ApiResponse<AuthUser>>({
    method: 'post',
    url: '/api/auth/register',
    data: payload
  })
}

// 登入
export function loginApi(payload: LoginRequest) {
  return request<ApiResponse<AuthUser>>({
    method: 'post',
    url: '/api/auth/login',
    data: payload
  })
}

// 登出
export function logoutApi() {
  return request<void>({
    method: 'post',
    url: '/api/auth/logout'
  })
}

// 取得目前使用者
export function fetchCurrentUserApi() {
  return request<ApiResponse<AuthUser>>({
    method: 'get',
    url: '/api/users/me'
  })
}
