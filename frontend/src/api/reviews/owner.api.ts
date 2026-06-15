import { request } from '@/utils/http/request'

import type { 
  ReviewRestaurantApiResponse,
  ReviewAllApiResponse,
  OwnerReviewQuery,
  ReplyReviewApiResponse
 } from '@/types/review'

 // 店家取得所有評論列表（包含多餐廳）  
export function fetchAllOwnerReviewsApi(
  query: OwnerReviewQuery
) {
  return request<ReviewAllApiResponse>({
    url: `/api/owner/reviews`,
    method: 'GET',
    params: query
  })
}

// 店家取得餐廳評論列表
export function fetchOwnerReviewsApi(
  restaurantUuid: string,
  query: OwnerReviewQuery
) {
  return request<ReviewRestaurantApiResponse>({
    url: `/api/owner/reviews/restaurants/${restaurantUuid}`,
    method: 'GET',
    params: query
  })

}

// 店家回覆評論
export function replyReviewApi(
  reviewUuid: string,
  payload: { content: string }
) {
  return request<ReplyReviewApiResponse>({
    url: `/api/owner/reviews/${reviewUuid}/reply`,
    method: 'POST',
    data: payload
  })
}

// 店家編輯回覆
export function editReplyApi(
  reviewUuid: string,
  payload: { content: string }
) {
  return request<ReplyReviewApiResponse>({
    url: `/api/owner/reviews/${reviewUuid}/reply`,
    method: 'PATCH',
    data: payload
  })
}

// 店家刪除回覆
export function deleteReplyApi(
  reviewUuid: string
) {
  return request<ReplyReviewApiResponse>({
    url: `/api/owner/reviews/${reviewUuid}/reply`,
    method: 'DELETE'
  })
}