import { request } from '@/utils/http/request'

export interface UploadSignResponse {
  timestamp: number
  signature: string
  apiKey: string
  cloudName: string
  folder: string
  publicId: string
}

export function getUploadSignApi(
  type: string,
  params: Record<string, string>
) {
  return request<UploadSignResponse>({
    url: '/api/upload/sign',
    method: 'GET',
    params: {
      type,
      ...params, 
    },
  })
}