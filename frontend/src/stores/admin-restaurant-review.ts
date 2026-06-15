import { defineStore } from 'pinia'
import { ref } from 'vue'
import camelcaseKeys from 'camelcase-keys'

import * as api from '@/api/admin/restaurant-review.api'

import type {
  AdminRestaurantListItem,
  AdminRestaurantListQuery,
  RestaurantDetail
} from '@/types/restaurant'
import type {
  ListMeta,
  ActionResult,
  Result
} from '@/types'
import type {
  ActionReason
} from '@/types/ui'

export const useAdminRestaurantReviewStore = defineStore(
  'adminRestaurantReview',
  () => {
    const restaurants = ref<AdminRestaurantListItem[]>([])
    const meta = ref<ListMeta | null>(null)
    const currentRestaurant = ref<RestaurantDetail | null>(null)
    const approvingUuid = ref<string | null>(null)
    const rejectingUuid = ref<string | null>(null)
    const isDetailLoading = ref<boolean>(false)
    const isListLoading = ref<boolean>(false)

    async function load(query: AdminRestaurantListQuery = {}): Promise<Result<void>> {
      isListLoading.value = true
      try {
        const result = await api.fetchPendingRestaurants(query)

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          }
        }

        restaurants.value = camelcaseKeys(
          result.data.results,
          { deep: true }
        )

        meta.value = result.data.meta
        return { ok: true }
      } finally {
        isListLoading.value = false
      }
    }

    async function fetchDetail(uuid: string): Promise<Result<void>> {
      isDetailLoading.value = true

      try {
        const result = await api.fetchRestaurantDetail(uuid)

        if (!result.ok) {
          return { ok: false, error: result.error }
        }

        currentRestaurant.value = camelcaseKeys(result.data.result, { deep: true })

        return { ok: true }
      } finally {
        isDetailLoading.value = false
      }
    }

    async function approve(uuid: string): Promise<ActionResult<void, ActionReason>> {
      if (approvingUuid.value === uuid) {
        return { ok: false, reason: 'APPROVING_RESTAURANT' }
      }

      approvingUuid.value = uuid

      try {
        const result = await api.approveRestaurant(uuid)

        if (!result.ok) {
          return { ok: false, error: result.error }
        }

        restaurants.value = restaurants.value.filter(r => r.uuid !== uuid)

        return { ok: true }
      } finally {
        approvingUuid.value = null
      }
    }

    async function reject(uuid: string, reason: string): Promise<ActionResult<void, ActionReason>> {
      if (rejectingUuid.value === uuid) {
        return { ok: false, reason: 'REJECTING_RESTAURANT' }
      }

      rejectingUuid.value = uuid

      try {
        const result = await api.rejectRestaurant(uuid, reason)

        if (!result.ok) {
          return { ok: false, error: result.error }
        }

        restaurants.value = restaurants.value.filter(r => r.uuid !== uuid)

        return { ok: true }
      } finally {
        rejectingUuid.value = null
      }
    }

    return {
      isListLoading,
      isDetailLoading,
      restaurants,
      meta,
      currentRestaurant,
      approvingUuid,
      rejectingUuid,

      load,
      fetchDetail,
      approve,
      reject,
    }
  }
)