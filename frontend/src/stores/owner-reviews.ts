import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import camelcaseKeys from 'camelcase-keys'

import {
  fetchOwnerReviewsApi,
  fetchAllOwnerReviewsApi,
  replyReviewApi,
  editReplyApi,
  deleteReplyApi
} from '@/api/reviews/owner.api'

import type {
  Result,
  ActionResult
} from '@/types'
import type {
  ActionReason
} from '@/types/ui';

import type { 
  RestaurantReview,
  OwnerReviewQuery,
  OwnerReviewsMeta
} from '@/types/review'

export const useOwnerReviewsStore = defineStore(
  'owner-reviews',
  () => {
    const reviewMap = reactive<Record<string, RestaurantReview[]>>({})
    const metaMap = reactive<Record<string, OwnerReviewsMeta | null>>({})
    const isFetchingMap = reactive<Record<string, boolean>>({})

    const replyingReviewUuid = ref<string | null>(null)

    const MAX_CACHE_SIZE = 5

    const keyOrder = ref<string[]>([])

    function buildKey(options: {
      restaurantUuid?: string
      query: {
        page: number
        sort: string
        limit: number
        unreplied: boolean
      }
    }) {
      return `restaurant-${options.restaurantUuid || 'ALL'}-page-${options.query.page}-sort-${options.query.sort}-limit-${options.query.limit}-unreplied-${options.query.unreplied}`
    }

    // cache helpers
    function getReviews(key: string) {
      return reviewMap[key] || []
    }

    function getMeta(key: string) {
      return metaMap[key] || null
    }

    function getIsFetching(key: string) {
      return isFetchingMap[key] || false
    }

    function clearCache() {
      Object.keys(reviewMap).forEach(k => delete reviewMap[k])
      Object.keys(metaMap).forEach(k => delete metaMap[k])
      Object.keys(isFetchingMap).forEach(k => delete isFetchingMap[k])
      keyOrder.value = []
    }


    async function loadReviews(
      key: string, 
      options: {
        restaurantUuid?: string
        query: OwnerReviewQuery
      }
    ): Promise<Result<void>> {

      if (!Array.isArray(reviewMap[key])) {
        reviewMap[key] = []
      }
      if (!metaMap[key]) {
        metaMap[key] = null
      }
      if (isFetchingMap[key] === undefined) {
        isFetchingMap[key] = false
      }

      isFetchingMap[key] = true

      try {
        
        let result

        if (options.restaurantUuid) {
          result = await fetchOwnerReviewsApi(
            options.restaurantUuid,
            options.query || {}
          )
        } else {
          result = await fetchAllOwnerReviewsApi(
            options.query || {}
          )
        }

        if (!result.ok) {
          return { ok: false, error: result.error }
        }

        const data = camelcaseKeys(
          result.data.results,
          { deep: true }
        )

        reviewMap[key] = data
        metaMap[key] = {
          ...result.data.meta,
          restaurant: (result.data as any).restaurant ?? null
        }

        if (!keyOrder.value.includes(key)) {
          keyOrder.value.push(key)
        }

        if (keyOrder.value.length > MAX_CACHE_SIZE) {

          const oldestKey = keyOrder.value.shift()

          if (oldestKey) {
            delete reviewMap[oldestKey]
            delete metaMap[oldestKey]
            delete isFetchingMap[oldestKey]
          }
        }

        return { ok: true }

      } finally {
        isFetchingMap[key] = false
      }
    }

    // 更新所有 cache 中的某筆 review
    function updateReviewInAllCaches(updated: RestaurantReview) {
      Object.keys(reviewMap).forEach((key) => {
        const list = reviewMap[key]

        if (!Array.isArray(list)) return

        const index = list.findIndex(r => r.uuid === updated.uuid)

        if (index !== -1) {
          list[index] = updated
        }
      })
    }

    // 業者回覆
    async function replyReview(
      reviewUuid: string,
      content: string
    ): Promise<ActionResult<void, ActionReason>> {

      if (replyingReviewUuid.value === reviewUuid) {
        return { ok: false, reason: 'CREATING_REVIEW_REPLY' }
      }

      replyingReviewUuid.value = reviewUuid

      try {
        const result = await replyReviewApi(reviewUuid, { content })

        if (!result.ok) {
          return {
            ok: false,
            error: result.error,
          }
        }

        const review = camelcaseKeys(
          result.data.result.review,
          { deep: true }
        )

        updateReviewInAllCaches(review)

        return { ok: true }

      } finally {
        replyingReviewUuid.value = null
      }
    }

    // 業者編輯回覆
    async function editReply(
      reviewUuid: string,
      content: string
    ): Promise<ActionResult<void, ActionReason>> {

      if (replyingReviewUuid.value === reviewUuid) {
        return { ok: false, reason: 'UPDATING_REVIEW_REPLY' }
      }

      replyingReviewUuid.value = reviewUuid

      try {

        const result = await editReplyApi(reviewUuid, { content })

        if (!result.ok) {
          return {
            ok: false,
            error: result.error,
          }
        }

        const review = camelcaseKeys(
          result.data.result.review,
          { deep: true }
        )

        updateReviewInAllCaches(review)

        return { ok: true }

      } finally {
        replyingReviewUuid.value = null
      }

    }

    // 業者刪除回覆
    async function deleteReply(
      reviewUuid: string
    ): Promise<ActionResult<void, ActionReason>> {

      if (replyingReviewUuid.value === reviewUuid) {
        return { ok: false, reason: 'DELETING_REVIEW_REPLY' }
      }

      replyingReviewUuid.value = reviewUuid

      try {
        const result = await deleteReplyApi(reviewUuid)

        if (!result.ok) {
          return {
            ok: false,
            error: result.error,
          }
        }

        const review = camelcaseKeys(
          result.data.result.review,
          { deep: true }
        )

        updateReviewInAllCaches(review)

        return { ok: true }

      } finally {
        replyingReviewUuid.value = null
      }
    }

    return {
      reviewMap,
      metaMap,
      isFetchingMap,

      getReviews,
      getMeta,
      getIsFetching,

      buildKey,

      replyingReviewUuid,
      loadReviews,
      replyReview,
      editReply,
      deleteReply,

      clearCache
    }

  }
)