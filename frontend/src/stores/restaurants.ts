import { ref } from 'vue'
import { defineStore } from 'pinia'
import camelcaseKeys from 'camelcase-keys'

import {
  fetchRestaurantsApi,
  fetchRestaurantDetailApi
} from '@/api/restaurants/public.api'

import type {
  RestaurantPublicListItem,
  RestaurantDetail,
  RestaurantPublicListQuery,
} from '@/types/restaurant'

import type {
  ListMeta,
  Result,
} from '@/types'

export const useRestaurantStore = defineStore(
  'restaurants',
  () => {
    const restaurantList = ref<RestaurantPublicListItem[]>([])
    const currentRestaurant = ref<RestaurantDetail | null>(null)

    const isFetchingList = ref(false)
    const isFetchingItem = ref(false)

    const pageInfo = ref<ListMeta>({
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    })

    // 載入餐廳列表
    async function fetchRestaurants(
      query: RestaurantPublicListQuery = {}
    ): Promise<Result<void>
    > {

      isFetchingList.value = true
      
      try {
        const result = await fetchRestaurantsApi(query)
          
        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          }
        }

        restaurantList.value = camelcaseKeys(result.data.results, { deep: true })
        pageInfo.value = result.data.meta
        
        return { ok: true }
      } finally {
        isFetchingList.value = false
      }
    }

    // 載入餐廳詳細資料 
    async function fetchRestaurantDetail(uuid: string): Promise<Result<void>> {
      isFetchingItem.value = true

      try {
        const result = await fetchRestaurantDetailApi(uuid)
    
        if (!result.ok) {
          return { 
            ok: false, 
            error: result.error 
          }
        }
        
        currentRestaurant.value = camelcaseKeys(result.data.result, { deep: true })

        return { ok: true }
      } finally {
        isFetchingItem.value = false
      }
    }

    // 更新餐廳評分（當使用者新增/編輯/刪除評論後，更新餐廳的評分資訊）
    function updateRestaurantRating(payload: {
      rating: number | null
      ratingCount: number
      reviewCount: number
    }) {
      if (!currentRestaurant.value) return
      currentRestaurant.value.rating = payload.rating
      currentRestaurant.value.ratingCount = payload.ratingCount
      currentRestaurant.value.reviewCount = payload.reviewCount
    }

    return {
      restaurantList,
      currentRestaurant,
      isFetchingList,
      isFetchingItem,
      pageInfo,
      fetchRestaurants,
      fetchRestaurantDetail,
      updateRestaurantRating,
    }
  })
