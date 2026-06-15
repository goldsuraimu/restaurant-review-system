import type { BaseImage, ListMeta } from '@/types'

// 後端回傳的圖片
export interface ReviewImage extends BaseImage {}

// 評論回覆（店家）
export interface ReviewReply {
  uuid: string
  content: string
  createdAt: string
  updatedAt: string
  reviewUuid: string
}

// 後端回傳的完整評論
export interface RestaurantReview {
  uuid: string

  restaurantUuid: string
  restaurantName: string

  rating: number
  content: string

  images: ReviewImage[]

  createdAt: string
  updatedAt: string

  userUuid: string
  nickname?:string
  userName: string
  
  reply?: ReviewReply | null
}

// 店家評論排序參數
export interface OwnerReviewQuery {
  page?: number
  limit?: number

  sort?: 'createdAt' | 'rating'

  order?: 'asc' | 'desc'

  unreplied?: boolean
}

// 餐廳評分摘要
export interface RestaurantRatingSummary {
  rating: number | null
  ratingCount: number
  reviewCount: number
}


export interface CreateReview {
  rating: number
  content: string
  reviewImages: File[]
}

export interface UpdateReview extends CreateReview {
  deletedImages?: string[]
}

export type OwnerReviewsMeta = ListMeta & {
  restaurant?: {
    uuid: string
    name: string
  }
}