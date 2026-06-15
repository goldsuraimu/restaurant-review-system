import { request } from '@/utils/http/request';

import type { UserProfile, EditProfileRequest, AuthUser } from '@/types/user'
import type { ApiResponse } from '@/types'


// 取得個人資料
export function fetchMyProfileApi() {
  return request<ApiResponse<UserProfile>>({
    method: 'GET',
    url: '/api/users/me/profile'
  })
}

// 更新個人資料
export function updateMyProfileApi(payload: EditProfileRequest) {
return request<ApiResponse<UserProfile>>({
    method: 'PUT',
    url: '/api/users/me',
    data: payload
  })
}

//  成為店主
export function becomeOwnerApi() {
  return request<ApiResponse<AuthUser>>({
    method: 'post',

    url: '/api/users/me/become-owner',
  })
}
