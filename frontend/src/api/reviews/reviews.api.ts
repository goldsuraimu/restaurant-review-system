import { request } from '@/utils/http/request'

import type {
  ReviewCursorListApiResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewCursorQuery,
  CreateReviewApiResponse,
  UpdateReviewApiResponse,
  DeleteReviewApiResponse,
  MyReviewApiResponse
} from '@/types/review';


const BASE = '/api/restaurants';

// 取得餐廳的評論列表
export function fetchReviewsApi(
  restaurantUuid: string,
  query: ReviewCursorQuery
) {
  return request<ReviewCursorListApiResponse>({
    url: `${BASE}/${restaurantUuid}/reviews`,
    method: 'GET',
    params: query,
  })
}

// 建立評論
export function createReviewApi(
  restaurantUuid: string,
  payload: CreateReviewRequest
) {
  return request<CreateReviewApiResponse>({
    url: `${BASE}/${restaurantUuid}/reviews`,
    method: 'POST',
    data: payload,
  });
}

// 更新評論
export function updateReviewApi(
  restaurantUuid: string,
  reviewUuid: string,
  payload: UpdateReviewRequest
) {
  return request<UpdateReviewApiResponse>({
    url: `${BASE}/${restaurantUuid}/reviews/${reviewUuid}`,
    method: 'PUT',
    data: payload,
  });
}

// 刪除評論
export function deleteReviewApi(
  restaurantUuid:string,
  reviewUuid: string
) {
  return request<DeleteReviewApiResponse>({
    url: `${BASE}/${restaurantUuid}/reviews/${reviewUuid}`,
    method: 'DELETE',
  });
}

// 取得我的評論
export function fetchMyReviewApi(restaurantUuid: string) {
  return request<MyReviewApiResponse>({
    url: `${BASE}/${restaurantUuid}/my-review`,
    method: 'GET',
  })
}