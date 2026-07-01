import type { BaseImage } from '@/types'
import type { BaseListQuery } from '@/types/common/list-query'

export interface RestaurantImage extends BaseImage {
  sortOrder: number 
}

// 餐廳列表項目
export interface RestaurantPublicListItem {
  uuid: string
  name: string
  nameEn?: string
  category: string
  rating: number | null
  ratingCount: number
  reviewCount: number
  coverImage: RestaurantImage | null
  createdAt: string
  updatedAt: string | null
}

// 餐廳列表項目 ( 店家專用 )
export interface RestaurantOwnerListItem {
  restaurantUuid: string
  draftUuid: string | null

  name: string
  nameEn: string | null
  category: string
  coverImage: RestaurantImage | null

  displayStatus: RestaurantDisplayStatus
  reviewNote: string | null

  rejectedAt: string | null  
  createdAt: string | null
  updatedAt: string | null
}

// 列表 Admin審查用
export interface AdminRestaurantListItem {
  uuid: string
  name: string
  category: string
  location: string
}

// 詳細頁
export interface RestaurantDetail {
  uuid: string
  ownerUuid: string
  name: string
  nameEn?: string
  category: string
  location: string
  description?: string
  phone?: string

  rating: number | null
  ratingCount: number
  reviewCount: number
  
  images: {
    cover: RestaurantImage[]
    gallery: RestaurantImage[]
    menu: RestaurantImage[]
  }

  createdAt: string
  updatedAt: string
}

// 店家專用的餐廳詳細資訊
export interface RestaurantOwnerDetail {
  restaurantUuid: string
  draftUuid: string | null
  ownerUuid: string
  name: string
  nameEn: string | null
  category: string
  location: string
  description?: string
  phone: string | null

  reviewNote: string | null

  images: {
    cover: RestaurantImage[]
    gallery: RestaurantImage[]
    menu: RestaurantImage[]
  }

  createdAt: string
  updatedAt: string | null
  rejectedAt: string | null
}

// 排序 
export type RestaurantSort =  
  | 'relevance'
  | 'createdAt'
  | 'rating'
  | 'ratingCount'
  | 'reviewCount'

// 列表查詢 ( 一般使用者 )
export interface RestaurantPublicListQuery extends BaseListQuery {
  q?: string[]
}

// 列表查詢 ( 店家專用 )
export interface RestaurantOwnerListQuery extends BaseListQuery {
  displayStatus?: RestaurantDisplayStatus | 'ALL'
}

// 列表查詢 ( Admin使用 )
export interface AdminRestaurantListQuery extends BaseListQuery { }

export type RestaurantDisplayStatus =
  | 'UNDER_REVIEW'          // 初次建立第一次送審
  | 'REVISION_UNDER_REVIEW' // 初次建立被退件後重新送審
  | 'REJECTED'    // 初次建立被退件
  | 'UPDATE_UNDER_REVIEW'  // 已上線餐廳修改審核中
  | 'UPDATE_REVISION_UNDER_REVIEW'  // 已上線餐廳修改被退件後重新送審
  | 'UPDATE_REJECTED'   // 已上線餐廳修改被退件
  | 'PUBLISHED'   // 正式上線