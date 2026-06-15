<template>
  <RestaurantForm 
    v-if="currentRestaurant" 
    title="編輯餐廳" 
    submitText="儲存變更" 
    :initialData="currentRestaurant"
    :progressMap="progressMap" 
    :getFileKey="getFileKey" 
    :loading="isProcessing" 
    @edit="handleUpdate" 
  />
  <LoadingSpinner v-else-if="isFetchingItem" :text="'載入中...'" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify';

import { useOwnerRestaurantsStore } from '@/stores/owner-restaurants'
import { useFlashStore } from '@/stores/flash'

import {
  mapCreateRestaurantErrorToFields
} from '@/api/error/field/create-restaurant-error.mapper'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import { 
  OWNER_RESTAURANT_ERROR_MESSAGE_MAP 
} from '@/api/error/business/owner/restaurant/restaurant-error.messages'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { isReasonFailure } from '@/utils/type-guards'
import { ToastType } from '@/constants/toast'

import { useFormProvider } from '@/composables/form/core/useFieldErrors'
import { 
  validateFiles,
  useCloudinaryUpload
} from '@/composables/upload/useCloudinaryUpload'

import RestaurantForm from '@/components/owner/restaurant/RestaurantForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type {
  UpdateRestaurantForm,
  UpdateRestaurantRequest,
} from '@/types/restaurant'

const route = useRoute();
const router = useRouter()
const ownerRestaurantsStore = useOwnerRestaurantsStore()
const { currentRestaurant, isFetchingItem } = storeToRefs(ownerRestaurantsStore)
const {
  loadRestaurantDetail,
  updateRestaurant
} = ownerRestaurantsStore

const flash = useFlashStore()

const { uploadMultiple, progressMap, getFileKey } = useCloudinaryUpload()

const form = useFormProvider()

const restaurantUuid = route.params.uuid as string

const isProcessing = ref(false)

// 初次載入
onMounted(() => {
  fetchRestaurant(restaurantUuid)
})

// 獲取餐廳詳細資料
async function fetchRestaurant(uuid: string) {
  const result = await loadRestaurantDetail(uuid)

  if (!result.ok) {
    toast.error('無法載入餐廳資料，請稍後再試')
    router.push({ name: 'OwnerRestaurants' })
  }
}

// 更新餐廳資料
async function handleUpdate(payload: UpdateRestaurantForm) {

  if (isProcessing.value) return // 防重入
  isProcessing.value = true

  form.clearAllFieldErrors()

  const allFiles = [
    ...payload.coverImage,
    ...payload.galleryImages,
    ...payload.menuImages
  ]

  const validation = validateFiles(allFiles)

  if (!validation.ok) {

    toast.error(validation.error.message || '圖片上傳失敗')

    isProcessing.value = false
    return
  }

  try {

    let uploadedCover: { url: string; publicId: string }[] = []
    let uploadedGallery: { url: string; publicId: string }[] = []
    let uploadedMenu: { url: string; publicId: string }[] = []

    // coverImage 上傳
    if (payload.coverImage.length) {
      const res = await uploadMultiple(payload.coverImage, 'cover', {
        restaurantUuid
      })
      if (!res.ok) {
        const handled = handleAppError(res.error, { showToast: true }).handled
        if (!handled) toast.error(res.error.message || '封面圖片上傳失敗')
        return
      }
      uploadedCover = res.data.map(item => ({ url: item.url, publicId: item.publicId }))
    }

    // galleryImages 上傳
    if (payload.galleryImages.length) {
      const res = await uploadMultiple(payload.galleryImages, 'gallery', {
        restaurantUuid
      })
      if (!res.ok) {
        const handled = handleAppError(res.error, { showToast: true }).handled
        if (!handled) toast.error(res.error.message || '展示圖片上傳失敗')
        return
      }
      uploadedGallery = res.data.map(item => ({ url: item.url, publicId: item.publicId }))
    }

    // menuImages 上傳
    if (payload.menuImages.length) {
      const res = await uploadMultiple(payload.menuImages, 'menu', {
        restaurantUuid
      })
      if (!res.ok) {
        const handled = handleAppError(res.error, { showToast: true }).handled
        if (!handled) toast.error(res.error.message || '菜單圖片上傳失敗')
        return
      }
      uploadedMenu = res.data.map(item => ({ url: item.url, publicId: item.publicId }))
    }

    // 組成最終 payload
    const finalPayload: UpdateRestaurantRequest
      = {
      ...payload,
      coverImage: uploadedCover,
      galleryImages: uploadedGallery,
      menuImages: uploadedMenu
    }

    const result = await updateRestaurant(restaurantUuid, finalPayload)

    if (!result.ok) {
      if (isReasonFailure(result)) {
        if (result.reason === 'UPDATING_RESTAURANT') return;
      } else {

        // system
        if (handleAppError(
          result.error, {
          showToast: true
        }).handled
        ) return;

        // business
        if (resolveBusinessError(result.error, OWNER_RESTAURANT_ERROR_MESSAGE_MAP)) return

        // field
        const mapped = mapCreateRestaurantErrorToFields(result.error)
        form.setErrors(mapped)
      }
      return
    }
    
    flash.set({
      type: ToastType.SUCCESS,
      message: '已成功編輯餐廳'
    })

    router.push({ name: 'OwnerRestaurants' })
    
  } finally {
    isProcessing.value = false
  }
}
</script>
