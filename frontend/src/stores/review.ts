import { ref } from 'vue';
import { defineStore } from 'pinia';
import camelcaseKeys from 'camelcase-keys';

import { useAuthStore } from './auth';

import { useRestaurantStore } from './restaurants'

import {
  fetchReviewsApi,
  createReviewApi,
  updateReviewApi,
  deleteReviewApi,
  fetchMyReviewApi
} from '@/api/reviews/reviews.api';

import type {
  RestaurantReview,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewSort
} from '@/types/review';

import type {
  ActionReason
} from '@/types/ui';

import type {
  ActionResult,
  Result
} from '@/types';

export const useReviewStore = defineStore('review', () => {
  const restaurantStore = useRestaurantStore()

  const reviews = ref<RestaurantReview[]>([]);
  const currentUserReview = ref<RestaurantReview | null>(null)

  const nextCursor = ref<string | null>(null)
  const hasNext = ref(false)
  const isLoadingMore = ref(false)

  const currentSort = ref<ReviewSort>('latest')

  const isFetching = ref(false);
  const isFetchingMyReview = ref(false)
  const isSubmitting = ref(false);
  const isUpdating = ref(false);
  const isDeleting = ref(false);

  // 載入餐廳評論（支援cursor分頁載入）
  async function fetchReviews(
    restaurantUuid: string,
    options?: { 
      reset?: boolean;
      limit?: number; 
      sort?: ReviewSort 
    }
  ): Promise<Result> {

    const isReset = options?.reset ?? true

    if (options?.sort && options.sort !== currentSort.value) {
      currentSort.value = options.sort
    }

    if (isReset) {
      isFetching.value = true
    } else {
      isLoadingMore.value = true
    }

    try {
      const result = await fetchReviewsApi(
        restaurantUuid,
        {
          cursor: isReset ? undefined : nextCursor.value ?? undefined,
          limit: options?.limit ?? 10,
          sort: currentSort.value, 
        }
      )

      if (!result.ok) {
        return { ok: false, error: result.error }
      }

      const results = result.data.results

      const mapped = camelcaseKeys(results, { deep: true })

      if (isReset) {
        reviews.value = mapped
      } else {
        reviews.value = [...reviews.value, ...mapped]
      }

      nextCursor.value = result.data.nextCursor
      hasNext.value = result.data.hasNext

      return { ok: true }

    } finally {
      isFetching.value = false
      isLoadingMore.value = false
    }
  }

  // 取得目前使用者的評論（如果有的話）
  async function fetchMyReview(
    restaurantUuid: string
  ): Promise<Result> {

    const auth = useAuthStore()

    // 沒登入就不用打 API
    if (!auth.isAuthenticated) {
      currentUserReview.value = null
      return { ok: true }
    }

    isFetchingMyReview.value = true

    try {
      const result = await fetchMyReviewApi(restaurantUuid)

      if (!result.ok) {
        return { ok: false, error: result.error }
      }

      const review = result.data.result.review

      currentUserReview.value = review
        ? camelcaseKeys(review, { deep: true })
        : null

      return { ok: true }

    } finally {
      isFetchingMyReview.value = false
    }
  }


  // 新增評論
  async function submitRestaurantReview(
    restaurantUuid: string,
    payload: CreateReviewRequest
  ): Promise<ActionResult<{ uuid: string }, ActionReason>> {
    
    if (isSubmitting.value) {
      return { ok: false, reason: 'CREATING_REVIEW' };
    }

    isSubmitting.value = true;
    
    try {
      
      const result = await createReviewApi(restaurantUuid, payload);
      
      if (!result.ok) {

        return {
          ok: false,
          error: result.error,
        };
      }

      const review = result.data.result.review
      const restaurantRating = result.data.result.restaurantRating

      const reviewData = camelcaseKeys(review, { deep: true })
      const ratingData = camelcaseKeys(restaurantRating, { deep: true })

      currentUserReview.value = reviewData

      restaurantStore.updateRestaurantRating(ratingData)

      return {
        ok: true
      };
    }
    finally {
      isSubmitting.value = false;
    }
  }

  // 編輯評論
  async function updateReview(
    restaurantUuid: string,
    reviewUuid: string,
    payload: UpdateReviewRequest
  ): Promise<ActionResult<void, ActionReason>> {
    if (isUpdating.value) {
      return { ok: false, reason: 'UPDATING_REVIEW' };
    }

    isUpdating.value = true;

    try {
      const result = await updateReviewApi(restaurantUuid, reviewUuid, payload);

      if (!result.ok) {
        return {
          ok: false,
          error: result.error,
        }
      }
      
      const review = result.data.result.review
      const restaurantRating = result.data.result.restaurantRating

      const reviewData = camelcaseKeys(review, { deep: true })
      const ratingData = camelcaseKeys(restaurantRating, { deep: true })

      currentUserReview.value = reviewData

      // 更新列表中那一筆
      const index = reviews.value.findIndex(r => r.uuid === reviewData.uuid)
      if (index !== -1) {
        reviews.value[index] = reviewData
      }

      restaurantStore.updateRestaurantRating(ratingData)

      return { ok: true };
    }
    finally {
      isUpdating.value = false;
    }
  }

  // 刪除評論
  async function deleteReview(
    restaurantUuid: string,
    reviewUuid: string
  ): Promise<ActionResult<void, ActionReason>> {
    if (isDeleting.value) {
      return { ok: false, reason: 'DELETING_REVIEW' };
    }

    isDeleting.value = true;

    try {
      const result = await deleteReviewApi(restaurantUuid, reviewUuid);

      if (!result.ok) {
        return {
          ok: false,
          error: result.error,
        };
      }
      
      const restaurantRating = result.data.result.restaurantRating

      const ratingData = camelcaseKeys(restaurantRating, { deep: true })

      // 清空自己的評論
      currentUserReview.value = null

      // 從列表移除
      reviews.value = reviews.value.filter(r => r.uuid !== reviewUuid)

      restaurantStore.updateRestaurantRating(ratingData)

      return {
        ok: true
      };
    }
    finally {
      isDeleting.value = false;
    }
  }

  return {
    reviews,
    currentUserReview,
    currentSort,

    nextCursor,        
    hasNext,           
    isLoadingMore,   

    isFetching,
    isFetchingMyReview,
    isSubmitting,
    isUpdating,
    isDeleting,

    fetchReviews,
    fetchMyReview,
    submitRestaurantReview,
    updateReview,
    deleteReview,
  };
});
