<template>
  <RestaurantForm title="新增餐廳" submitText="建立餐廳" :progressMap="progressMap" :getFileKey="getFileKey"
    :loading="isProcessing" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify';

import { useOwnerRestaurantsStore } from '@/stores/owner-restaurants'
import { useFlashStore } from '@/stores/flash'

import { ToastType } from '@/constants/toast'
import {
  mapCreateRestaurantErrorToFields
} from '@/api/error/field/create-restaurant-error.mapper'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import { OWNER_RESTAURANT_ERROR_MESSAGE_MAP } 
  from '@/api/error/business/owner/restaurant/restaurant-error.messages'

import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { useFormProvider } from '@/composables/form/core/useFieldErrors'
import { isReasonFailure } from '@/utils/type-guards'
import { 
  validateFiles,
  useCloudinaryUpload 
} from '@/composables/upload/useCloudinaryUpload'
import { createUuidApi } from '@/api/core/request/uuid.api'

import RestaurantForm from '@/components/owner/restaurant/RestaurantForm.vue'


import type { CreateRestaurantForm, CreateRestaurantRequest } from '@/types/restaurant'

const router = useRouter()
const ownerRestaurantsStore = useOwnerRestaurantsStore()
const { createRestaurant } = ownerRestaurantsStore

const { 
  uploadMultiple, 
  progressMap, 
  getFileKey 
} = useCloudinaryUpload()

const form = useFormProvider()

const flash = useFlashStore()

const isProcessing = ref(false)

async function handleSubmit(payload: CreateRestaurantForm) {

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

    const uuidRes = await createUuidApi()

    if (!uuidRes.ok) {
      handleAppError(uuidRes.error, { showToast: true })
      return
    }

    const restaurantUuid = uuidRes.data.uuid

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
    const finalPayload: CreateRestaurantRequest
      = {
      ...payload,
      restaurantUuid,
      coverImage: uploadedCover,
      galleryImages: uploadedGallery,
      menuImages: uploadedMenu
    }

    const result = await createRestaurant(finalPayload)

    if (!result.ok) {
      if (isReasonFailure(result)) {
        if (result.reason === 'CREATING_RESTAURANT') return;
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
      message: '已成功創建餐廳'
    })

    router.push({ name: 'OwnerRestaurants' })
  } finally {
    isProcessing.value = false
  }
}
</script>
