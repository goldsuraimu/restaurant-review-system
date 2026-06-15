import type {
  ApiResponse,
  ApiPageWith,
  ApiCursorResponse
} from '@/types'
import type {
  RestaurantReview,
  RestaurantRatingSummary,
} from './review.types'

// 後端回傳的評論列表（包含分頁資訊）
export type ReviewCursorListApiResponse =
  ApiCursorResponse<RestaurantReview>

// 建立評論
export type CreateReviewApiResponse =
  ApiResponse<{
    review: RestaurantReview
    restaurantRating: RestaurantRatingSummary
  }>

// 更新評論
export type UpdateReviewApiResponse =
  ApiResponse<{
    review: RestaurantReview
    restaurantRating: RestaurantRatingSummary
  }>

// 刪除評論
export type DeleteReviewApiResponse =
  ApiResponse<{
    restaurantRating: RestaurantRatingSummary
  }>

// 取得我的評論
export type MyReviewApiResponse =
  ApiResponse<{
    review: RestaurantReview | null
  }>

// 店家回覆對象評論
export type ReplyReviewApiResponse =
  ApiResponse<{
    review: RestaurantReview
  }>

// 店家評論列表基本結構（包含分頁資訊）
export type ReviewPageBase =
  ApiPageWith<RestaurantReview>

// 店家全部評論列表
export type ReviewAllApiResponse =
  ReviewPageBase

// 店家餐廳評論列表 (包含餐廳基本資訊)
export type ReviewRestaurantApiResponse =
  ApiPageWith<RestaurantReview, {
    restaurant: {
      uuid: string
      name: string
    }
  }>