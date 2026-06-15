import { request } from '@/utils/http/request'

export function createUuidApi() {
  return request<{ uuid: string }>({
    url: '/api/utils/uuid',
    method: 'POST',
  })
}