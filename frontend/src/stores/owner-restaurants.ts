import { ref } from 'vue'
import { defineStore } from 'pinia'
import camelcaseKeys from 'camelcase-keys'

import {
  fetchOwnerRestaurantsApi,
  createRestaurantApi,
  fetchOwnerRestaurantDetailApi,
  updateRestaurantApi,
  deleteRestaurantApi
} from '@/api/restaurants/owner.api'

import type {
  RestaurantOwnerListQuery,
  RestaurantOwnerListItem,
  RestaurantOwnerDetail,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  RestaurantDisplayStatus,
} from '@/types/restaurant'

import type {
  ActionReason
} from '@/types/ui';

import type {
  ListMeta,
  ActionResult,
  Result
} from '@/types'

export const useOwnerRestaurantsStore = defineStore(
  'owner-restaurants',
  () => {
    const restaurants = ref<RestaurantOwnerListItem[]>([])
    const meta = ref<ListMeta | null>(null)
    const currentRestaurant = ref<RestaurantOwnerDetail | null>(null)
    const isFetchingList = ref(false);
    const isFetchingItem = ref(false);
    const isSubmitting = ref(false);
    const isUpdating = ref(false);
    const isDeleting = ref(false);

    async function loadRestaurants(query: RestaurantOwnerListQuery = {}): Promise<Result<void>> {

      isFetchingList.value = true

      currentRestaurant.value = null
      
      try {
        const result = await fetchOwnerRestaurantsApi(query)

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
        isFetchingList.value = false
      }
    }

    // 取得單一餐廳
    async function loadRestaurantDetail(
      uuid: string
    ): Promise<Result> {

      isFetchingItem.value = true
      
      try {
        const result = await fetchOwnerRestaurantDetailApi(uuid)

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          }
        }

        currentRestaurant.value = camelcaseKeys(result.data.result, { deep: true })

        return {
          ok: true
        }
      }finally {
        isFetchingItem.value = false
      }
    }

    // 創建餐廳頁面
    async function createRestaurant(
      payload: CreateRestaurantRequest
    ): Promise<ActionResult<void, ActionReason>> {
      if (isSubmitting.value) return { ok: false, reason: 'CREATING_RESTAURANT' }

      isSubmitting.value = true
      try {
        const result = await createRestaurantApi(payload)

        if (!result.ok) {
          return {
            ok: false,
            error: result.error,
          };
        }
        return { ok: true }
      } finally {
        isSubmitting.value = false
      }
    }

    // 更新餐廳
    async function updateRestaurant(
      uuid: string,
      payload: UpdateRestaurantRequest
    ): Promise<ActionResult<void, ActionReason>> {

      if (isUpdating.value) {
        return { ok: false, reason: 'UPDATING_RESTAURANT' }
      }

      isUpdating.value = true

      try {
        const result = await updateRestaurantApi(uuid, payload)

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          }
        }

        return { ok: true }

      } finally {
        isUpdating.value = false
      }
    }


    async function deleteRestaurant({
      restaurantUuid,
      displayStatus
    }: {
      restaurantUuid: string;
      displayStatus: RestaurantDisplayStatus;
    }): Promise<ActionResult<void, ActionReason>> {

      if (isDeleting.value) {
        return { ok: false, reason: 'DELETING_RESTAURANT' }
      }

      isDeleting.value = true

      try {
        const result = await deleteRestaurantApi(restaurantUuid, displayStatus)

        if (!result.ok) {
          return {
            ok: false,
            error: result.error
          }
        }

        restaurants.value = restaurants.value.filter(r => r.restaurantUuid !== restaurantUuid)

        return { ok: true }

      } finally {
        isDeleting.value = false
      }
    }



    return {
      restaurants,
      meta,
      currentRestaurant,

      isFetchingList,
      isFetchingItem,
      isSubmitting,
      isUpdating,
      isDeleting,

      loadRestaurants,
      loadRestaurantDetail,
      createRestaurant,
      updateRestaurant,
      deleteRestaurant
    }
  }
)
