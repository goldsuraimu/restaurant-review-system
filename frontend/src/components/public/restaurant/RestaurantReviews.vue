<template>
  <section class="mt-5">
    <h4>使用者評論 ( {{ reviewCount }} )</h4>

    <div class="mb-3">
      <ReviewLoginPrompt />
    </div>

    <!-- 我的評論區 -->
    <template v-if="isAuthenticated">

      <!-- loading -->
      <RestaurantReviewItemSkeleton v-if="isFetchingMyReview" />

      <InfoMessage v-else-if="showOwnerNotice" message="您是此餐廳的店家，無法對自己的餐廳發表評論." type="info"
        :icon="['fas', 'info-circle']" />

      <!-- 自己的評論 -->
      <ReviewItem v-else-if="currentUserReview" :review="currentUserReview" @review-deleted="handleDeleteReview"
        @edit-mode-entered="openEditModal" @open-lightbox="open(currentUserReview.images, $event)" />

      <!-- 新增評論 -->
      <ReviewForm v-else @submit="handleSubmitReview" :progressMap="progressMap" :getFileKey="getFileKey"
        :loading="isProcessing" />

    </template>

    <template v-if="isFetching && !reviews.length">
      <RestaurantReviewItemSkeleton v-for="i in 5" :key="i" />
    </template>

    <!-- 其他評論 -->
    <template v-else>
      <div v-if="reviews.length">
        <div class="mb-3 d-flex justify-content-end">
          <select class="form-select w-auto" v-model="selectedSort">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <ReviewItem v-for="r in reviews" :key="r.uuid" :review="r" @review-deleted="handleDeleteReview"
          @edit-mode-entered="openEditModal" @open-lightbox="open(r.images, $event)" />
      </div>

      <!-- 沒有評論提示 -->
      <NoReviewsMessage v-else :show="true" />

    </template>

    <LoadingSpinner v-if="isLoadingMore" />

    <!-- 錯誤 -->
    <div class="text-danger text-center mb-5" v-if="reviewsErrorMessage">
      載入評論失敗: {{ reviewsErrorMessage }}
    </div>

    <!-- 載入更多 -->
    <div v-if="hasNext" class="text-center mt-3">
      <button class="btn btn-outline-secondary" :disabled="isLoadingMore" @click="loadMore">
        載入更多
      </button>
    </div>
  </section>

  <ImageViewerFullscreen 
    v-model:visible="isOverlayVisible" 
    :images="activeImages" 
    :initialIndex="initialIndex" 
  />

  <!-- 編輯 Modal -->
  <div v-if="editingModalVisible" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h5>編輯評論</h5>
        <button class="btn-close" @click="closeEditModal"></button>
      </div>
      <div class="modal-body">
        <ReviewForm :currentReview="currentUserReview" @edit="handleEditReview" @cancel="closeEditModal"
          :progressMap="progressMap" :getFileKey="getFileKey" :loading="isProcessing" />
      </div>
    </div>
  </div>

  <ConfirmModal />
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify'

import { useReviewStore } from '@/stores/review'
import { useAuthStore } from '@/stores/auth'
import { useConfirmModal } from '@/composables/ui/useConfirmModal'
import { resolveErrorMessage } from '@/api/error/resolvers/resolve-error-message'
import { mapReviewErrorToFields } from '@/api/error/field/review-error.mapper'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import { REVIEW_ERROR_MESSAGE_MAP } from '@/api/error/business/review-error.messages'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { isReasonFailure } from '@/utils/type-guards'
import { useFormProvider } from '@/composables/form/core/useFieldErrors'
import { useCloudinaryUpload } from '@/composables/upload/useCloudinaryUpload'
import { createUuidApi } from '@/api/core/request/uuid.api'

import ReviewForm from '@/components/review/ReviewForm.vue'
import ReviewItem from '@/components/review/ReviewItem.vue'
import ReviewLoginPrompt from '@/components/review/ReviewLoginPrompt.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ImageViewerFullscreen from '@/components/common/ImageLightbox/ImageViewerFullscreen.vue'
import NoReviewsMessage from '@/components/review/NoReviewsMessage.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import RestaurantReviewItemSkeleton from '@/components/common/skeleton/RestaurantReviewItemSkeleton.vue'
import InfoMessage from '@/components/common/InfoMessage.vue'

import type {
  CreateReview,
  UpdateReview,
  CreateReviewRequest,
  UpdateReviewRequest,
  RestaurantReview,
  ReviewImage,
} from '@/types/review'

const props = defineProps<{
  restaurantUuid: string
  reviewCount?: number
  ownerUuid?: string
}>()

const sortOptions = [
  { label: '最新 → 最舊', value: 'latest' },
  { label: '最舊 → 最新', value: 'oldest' },
  { label: '評分最高 → 最低', value: 'rating_desc' },
  { label: '評分最低 → 最高', value: 'rating_asc' },
]

const selectedSort = ref<'latest' | 'oldest' | 'rating_desc' | 'rating_asc'>('latest')

const reviewStore = useReviewStore()
const authStore = useAuthStore()

const {
  reviews,
  currentUserReview,
  hasNext,
  isFetchingMyReview,
  isFetching,
  isLoadingMore,
} = storeToRefs(reviewStore)

const {
  fetchReviews,
  fetchMyReview,
  submitRestaurantReview,
  updateReview,
  deleteReview
} = reviewStore

const { isAuthenticated } = storeToRefs(authStore)

const showConfirmModal = useConfirmModal()

const { uploadMultiple, progressMap, getFileKey } = useCloudinaryUpload()

const form = useFormProvider()

const reviewsErrorMessage = ref<string | null>(null)
const editingModalVisible = ref(false)

// lightbox
const isOverlayVisible = ref(false)
const activeImages = ref<ReviewImage[]>([])
const initialIndex = ref(0)

const PAGE_SIZE = 10

const isProcessing = ref(false)

// 載入評論
async function reload() {
  reviewsErrorMessage.value = null

  const result = await fetchReviews(
    props.restaurantUuid,
    {
      reset: true,
      limit: PAGE_SIZE,
    })

  if (!result.ok) {
    reviewsErrorMessage.value = resolveErrorMessage(
      result.error,
      '目前無法取得評論，請稍後再試'
    )
  }
}

// 載入更多評論 (分頁)
async function loadMore() {
  if (isLoadingMore.value) return

  const result = await fetchReviews(
    props.restaurantUuid,
    {
      reset: false,
      limit: PAGE_SIZE
    })

  if (!result.ok) {
    // system 
    if (handleAppError(result.error, { showToast: true }).handled) return

    toast.error('載入更多評論失敗，請稍後再試')
  }
}

onMounted(() => {
  reload()
  fetchMyReview(props.restaurantUuid)
})

const isOwnerOfRestaurant = computed(() => {
  if (!isAuthenticated.value) return false

  const user = authStore.authUser
  if (!user) return false

  return user.uuid === props.ownerUuid
})

const showOwnerNotice = computed(() => isAuthenticated.value && isOwnerOfRestaurant.value)

watch(selectedSort, async (val) => {
  await fetchReviews(props.restaurantUuid, {
    reset: true,
    sort: val,
  })
})

// 提交新評論
async function handleSubmitReview(payload: CreateReview) {

  if (isProcessing.value) return // 防重入
  isProcessing.value = true

  // 先清掉上一筆錯誤
  form.clearAllFieldErrors()

  try {
    const files = payload.reviewImages

    let uploadedImages: {
      url: string
      publicId: string
    }[] = []

    const uuidRes = await createUuidApi()

    if (!uuidRes.ok) {
      handleAppError(uuidRes.error, { showToast: true })
      return
    }

    const reviewUuid = uuidRes.data.uuid

    if (files.length) {
      const uploadRes = await uploadMultiple(files, 'review', {
        restaurantUuid: props.restaurantUuid,
        reviewUuid
      })

      if (!uploadRes.ok) {
        const handled = handleAppError(uploadRes.error, { showToast: true }).handled
       
        if (!handled) {
          toast.error(uploadRes.error.message || '圖片上傳失敗，請稍後再試')
        }

        return
      }

      // 只取 url 和 publicId
      uploadedImages = uploadRes.data.map(item => ({
        url: item.url,
        publicId: item.publicId
      }))
    }

    const finalPayload: CreateReviewRequest = {
      ...payload,
      reviewImages: uploadedImages,
      reviewUuid
    }

    const result = await submitRestaurantReview(
      props.restaurantUuid,
      finalPayload
    )

    if (!result.ok) {
      if (isReasonFailure(result)) {
        if (result.reason === 'CREATING_REVIEW') return;
      } else {

        // system
        if (handleAppError(
          result.error, {
          showToast: true
        }).handled
        ) return;

        // business
        if (resolveBusinessError(result.error, REVIEW_ERROR_MESSAGE_MAP)) return

        // field
        const mapped = mapReviewErrorToFields(result.error)
        form.setErrors(mapped)

      }

      return
    }

    await reload()
    toast.success('已成功提交評論')

  } finally {
    isProcessing.value = false
  }
}


// #region Modal 相關方法 

// 開啟編輯 Modal
function openEditModal() {

  // 先清掉上一筆錯誤
  form.clearAllFieldErrors()

  editingModalVisible.value = true
}

// 關閉編輯 Modal
function closeEditModal() {

  // 先清掉上一筆錯誤
  form.clearAllFieldErrors()

  editingModalVisible.value = false
}
//#endregion

// 編輯評論
async function handleEditReview(payload: UpdateReview) {
  if (!currentUserReview.value) return

  // 先清掉上一筆錯誤
  form.clearAllFieldErrors()
  isProcessing.value = true

  try {
    let uploadedImages: { url: string; publicId: string }[] = []

    const newFiles = payload.reviewImages || []

    if (newFiles.length) {
      const uploadRes = await uploadMultiple(newFiles, 'review', {
        restaurantUuid: props.restaurantUuid,
        reviewUuid: currentUserReview.value.uuid
      })

      if (!uploadRes.ok) {
        const handled = handleAppError(uploadRes.error, { showToast: true }).handled
        
        if (!handled) toast.error(uploadRes.error.message || '圖片上傳失敗，請稍後再試')
        return
      }

      uploadedImages = uploadRes.data.map(img => ({
        url: img.url!,
        publicId: img.publicId!
      }))
    }

    // 組成最終 payload
    const finalPayload: UpdateReviewRequest = {
      ...payload,
      reviewImages: uploadedImages,
      deletedImages: payload.deletedImages || []
    }

    const result = await updateReview(
      props.restaurantUuid,
      currentUserReview.value.uuid,
      finalPayload
    )

    if (!result.ok) {
      if (isReasonFailure(result)) {
        if (result.reason === 'UPDATING_REVIEW') return;
      } else {

        // system
        if (handleAppError(
          result.error, {
          showToast: true
        }).handled
        ) return;

        // business
        if (resolveBusinessError(result.error, REVIEW_ERROR_MESSAGE_MAP)) return

        // field
        const mapped = mapReviewErrorToFields(result.error)
        form.setErrors(mapped)

      }

      return
    }

    await reload()
    closeEditModal()
    toast.success('已成功更新評論')
  } finally {
    isProcessing.value = false
  }
}


// 刪除評論
async function handleDeleteReview(review: RestaurantReview) {
  const confirmed = await showConfirmModal({
    title: '刪除確認',
    message: '確定要刪除這則評論嗎？',
  })

  if (!confirmed) return

  // 先清掉上一筆錯誤
  form.clearAllFieldErrors()

  const result = await deleteReview(
    props.restaurantUuid,
    review.uuid
  )

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'DELETING_REVIEW') return;
    } else {

      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // business
      if (resolveBusinessError(result.error, REVIEW_ERROR_MESSAGE_MAP)) return

    }
    return
  }

  await reload()
  toast.success('已成功刪除評論')
}

// 開啟 Lightbox
function open(images: ReviewImage[], index: number) {
  activeImages.value = images
  initialIndex.value = index

  isOverlayVisible.value = true
}

</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  border-radius: 8px;
  width: 700px;
  max-width: 90%;
  padding: 1rem;
}
</style>