<template>
  <div id="review-panel">

    <h1 class="title">
      <span class="title-name" :title="meta?.restaurant?.name">
        {{ meta?.restaurant?.name }}
      </span>
      <span class="title-suffix">的評論管理</span>
    </h1>

    <div class="toolbar">

      <select v-model="sort" class="sort-select">
        <option value="createdAt_desc">最新</option>
        <option value="createdAt_asc">最舊</option>
        <option value="rating_desc">評分最高</option>
      </select>

      <label class="unreplied-label">
        <input type="checkbox" v-model="unreplied" />
        只看未回覆
      </label>

      <button class="refresh-btn" :disabled="isRefreshing" @click="refresh">
        重新整理
      </button>

    </div>

    <ul v-if="isFetching" class="review-list">
      <OwnerReviewItemSkeleton v-for="i in PAGE_SIZE" :key="i" :showRestaurant="true" />
    </ul>

    <!-- 錯誤 -->
    <div class="text-danger text-center my-5" v-else-if="reviewsErrorMessage">
      載入評論失敗: {{ reviewsErrorMessage }}
    </div>

    <!-- 當沒有評論時顯示提示訊息 -->
    <div v-else-if="!isFetching && reviews.length === 0 && !reviewsErrorMessage" class="text-center my-5">
      <p>目前沒有評論。</p>
    </div>

    <!-- 評論列表 -->
    <ul v-else class="review-list">
      <ReviewItem v-for="review in reviews" :key="review.uuid" :review="review" mode="manage"
        :active-reply-review-uuid="activeReplyReviewUuid" :active-edit-review-uuid="activeEditReviewUuid"
        :replying-review-uuid="replyingReviewUuid" @open-reply="openReply" @cancel-reply="cancelReply"
        @submit-reply="handleSubmitReply" @open-edit="openEdit" @cancel-edit="cancelEdit" @edit-reply="handleEditReply"
        @delete-reply="handleDeleteReply" @open-lightbox="openLightbox" />
    </ul>
  </div>

  <Pagination v-if="meta" :page-info="meta" colorBg="#FFFFFF" colorText="#5A2A18" colorActiveBg="#E85D2A"
    colorActiveText="#fff" @update:page="handlePageChange" />

  <!-- Lightbox -->
  <ImageViewerFullscreen v-model:visible="isOverlayVisible" :images="activeImages" :initialIndex="initialIndex" />

  <ConfirmModal />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify'

import { useOwnerReviewsStore } from '@/stores/owner-reviews'
import { useConfirmModal } from '@/composables/ui/useConfirmModal'
import { resolveErrorMessage } from '@/api/error/resolvers/resolve-error-message'
import { mapOwnerReplyErrorToFields } from '@/api/error/field/owner-reply-error.mapper'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import { OWNER_REPLY_ERROR_MESSAGE_MAP }
  from '@/api/error/business/owner/reply/reply-error.messages'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { useFormProvider } from '@/composables/form/core/useFieldErrors'
import { isReasonFailure } from '@/utils/type-guards'

import OwnerReviewItemSkeleton from '@/components/common/skeleton/OwnerReviewItemSkeleton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ReviewItem from '@/components/owner/review/ReviewItem.vue'
import Pagination from '@/components/common/Pagination.vue'
import ImageViewerFullscreen from '@/components/common/ImageLightbox/ImageViewerFullscreen.vue'


import type {
  ReviewReplyRequest,
  ReviewImage
} from '@/types/review'

const route = useRoute()
const router = useRouter()
const store = useOwnerReviewsStore()

// 單頁資料數量
const PAGE_SIZE = 20

const {
  replyingReviewUuid
} = storeToRefs(store)
const {
  loadReviews,
  replyReview,
  editReply,
  deleteReply,
  buildKey
} = store

const cacheKey = computed(() =>
  buildKey({
    restaurantUuid,
    query: {
      page: page.value,
      sort: sort.value,
      limit: PAGE_SIZE,
      unreplied: unreplied.value,
    }
  })
)


const reviews = computed(() =>
  store.getReviews(cacheKey.value)
)

const isFetching = computed(() =>
  store.getIsFetching(cacheKey.value)
)

const meta = computed(() =>
  store.getMeta(cacheKey.value)
)

const form = useFormProvider()

const showConfirmModal = useConfirmModal()

const page = computed(() => {
  const p = Number(route.query.page)
  return Number.isInteger(p) && p > 0 ? p : 1
})
const sort = computed({
  get: () => (route.query.sort as string) || 'createdAt_desc',
  set: (val: string) => {
    router.push({
      query: {
        ...route.query,
        page: 1,
        sort: val
      }
    })
  }
})

const unreplied = computed({
  get: () => route.query.unreplied === 'true',
  set: (val: boolean) => {
    router.push({
      query: {
        ...route.query,
        page: 1,
        unreplied: String(val)
      }
    })
  }
})

const isRefreshing = ref<boolean>(false)
const restaurantUuid = route.params.uuid as string
const reviewsErrorMessage = ref<string | null>(null)

const activeReplyReviewUuid = ref<string | null>(null)
const activeEditReviewUuid = ref<string | null>(null)

// lightbox
const isOverlayVisible = ref(false)
const activeImages = ref<ReviewImage[]>([])
const initialIndex = ref(0)


// 打開回覆表單
function openReply(reviewUuid: string) {
  activeReplyReviewUuid.value = reviewUuid
  form.clearAllFieldErrors()
}

// 取消回覆
function cancelReply() {
  activeReplyReviewUuid.value = null
  form.clearAllFieldErrors()
}

function openEdit(reviewUuid: string) {
  activeEditReviewUuid.value = reviewUuid
  form.clearAllFieldErrors()
}
function cancelEdit() {
  activeEditReviewUuid.value = null
  form.clearAllFieldErrors()
}

// 開啟 Lightbox
function openLightbox(images: ReviewImage[], index: number) {
  activeImages.value = images
  initialIndex.value = index

  isOverlayVisible.value = true
}


watch(
  () => [route.query.page, route.query.sort, route.query.unreplied],
  () => {
    refresh()
  },
  { immediate: true }
)

function handlePageChange(p: number) {
  router.push({
    query: {
      ...route.query,
      page: p
    }
  })
}

// 刷新評論列表
async function refresh() {
  isRefreshing.value = true
  reviewsErrorMessage.value = null
  const [rawSort, rawOrder] = sort.value.split('_')

  const sortField = rawSort === 'rating' ? 'rating' : 'createdAt'
  const order = rawOrder === 'asc' ? 'asc' : 'desc'

  const result = await loadReviews(
    cacheKey.value, {
    restaurantUuid,
    query: {
      page: page.value,
      limit: PAGE_SIZE,
      sort: sortField,
      order,
      unreplied: unreplied.value
    }
  }
  )

  if (!result.ok) {
    reviewsErrorMessage.value = resolveErrorMessage(
      result.error,
      '目前無法取得評論，請稍後再試'
    )
  }

  isRefreshing.value = false
}

// 提交回覆
async function handleSubmitReply(reviewUuid: string, payload: ReviewReplyRequest) {
  const result = await replyReview(reviewUuid, payload.content)

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'CREATING_REVIEW_REPLY') return;
    } else {

      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // business
      if (resolveBusinessError(result.error, OWNER_REPLY_ERROR_MESSAGE_MAP)) return

      // field
      const mapped = mapOwnerReplyErrorToFields(result.error)
      form.setErrors(mapped)

      return
    }
  }

  activeReplyReviewUuid.value = null
  toast.success('已成功回覆評論')
}

// 編輯回覆
async function handleEditReply(reviewUuid: string, payload: ReviewReplyRequest) {
  const result = await editReply(reviewUuid, payload.content)

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'UPDATING_REVIEW_REPLY') return;
    } else {

      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // business
      if (resolveBusinessError(result.error, OWNER_REPLY_ERROR_MESSAGE_MAP)) return

      // field
      const mapped = mapOwnerReplyErrorToFields(result.error)
      form.setErrors(mapped)
    }

    return
  }
  activeEditReviewUuid.value = null
  toast.success('已更新回覆')
}


// 刪除回覆
async function handleDeleteReply(reviewUuid: string) {
  const confirmed = await showConfirmModal({
    title: '刪除確認',
    message: '確定要刪除這則回覆嗎？',
  })
  if (!confirmed) return

  const result = await deleteReply(reviewUuid)

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'DELETING_REVIEW_REPLY') return;
    } else {

      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // business
      if (resolveBusinessError(result.error, OWNER_REPLY_ERROR_MESSAGE_MAP)) return

    }

    return
  }

  toast.success('已成功刪除回覆')
}
</script>


<style scoped>
#review-panel {
  padding: 20px;
  background-color: #FFF3E6;
  border-radius: 15px;
}

/* 標題 */
.title {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  color: #842B00;
  margin-bottom: 20px;
  font-weight: bold;
  gap: 4px;
}

.title-name {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-suffix {
  flex-shrink: 0;
}

/* 工具列 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.sort-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #FF9D6F;
  background-color: #FFE7DB;
  color: #842B00;
  font-weight: 500;
  cursor: pointer;
}

.unreplied-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #842B00;
  cursor: pointer;
}

.unreplied-label input[type="checkbox"] {
  cursor: pointer;
}

.refresh-btn {
  background-color: #FF7A45;
  border: none;
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 評論列表 */
.review-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>