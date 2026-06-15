import { ref } from 'vue'
import { defineStore } from 'pinia'
import camelcaseKeys from 'camelcase-keys'


import { fetchOwnerRestaurantRatingApi } from '@/api/owner/restaurant-rating.api'

import type { ListMeta, Result } from '@/types'
import type { RestaurantRatingItem } from '@/types/owner'

export const useOwnerRestaurantRatingStore = defineStore(
  'owner-restaurant-rating',
  () => {

    const list = ref<RestaurantRatingItem[]>([])

    const meta = ref<ListMeta>({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    })

    const isLoading = ref(false)

    async function load({
      page = 1, limit = 10
    }: { page?: number, limit?: number }): Promise<Result<void>> {
      isLoading.value = true

      try {
        const res = await fetchOwnerRestaurantRatingApi({ page, limit })
        
        if (!res.ok) {
          return { ok: false, error: res.error }
        }

        const data = camelcaseKeys(
          res.data.results,
          { deep: true }
        )

        list.value = data
        meta.value = res.data.meta

        return { ok: true }

      } finally {
        isLoading.value = false
      }
    }

    return {
      list,
      meta,
      isLoading,
      load
    }
  }
)