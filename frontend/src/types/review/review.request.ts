import type { UploadedImage } from '../common/uploaded-image'

// 建立評論
export interface CreateReviewRequest {
  rating: number
  content: string
  reviewImages: UploadedImage[]
  reviewUuid: string
}

// 更新評論
export interface UpdateReviewRequest {
  rating: number
  content: string
  reviewImages: UploadedImage[]
  deletedImages?: string[]
}

export interface ReviewReplyRequest {
  content: string
}