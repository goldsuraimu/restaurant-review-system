<template>
  <RestaurantDetailSkeleton v-if="isDetailLoading" />
  <div v-else-if="!previewRestaurant">Restaurant not found</div>
  <div v-else class="review-detail">

    <RestaurantPreview :restaurant="previewRestaurant" />

    <!-- actions -->
    <div class="preview-actions">

      <button class="btn back" @click="goBack">
        返回列表
      </button>

      <div class="action-right">

        <button class="btn reject" @click="openReject">
          拒絕
        </button>

        <button class="btn approve" @click="handleApprove">
          通過
        </button>

      </div>

    </div>

  </div>

  <!-- Reject Modal -->
  <div v-if="isRejectModalOpen" class="modal">
    <div class="modal-content">

      <h3>拒絕原因</h3>

      <textarea v-model="rejectReason" />

      <div class="modal-actions">

        <button @click="confirmReject">
          送出
        </button>

        <button @click="closeReject">
          取消
        </button>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAdminRestaurantReviewStore } from '@/stores/admin-restaurant-review'
import { useFlashStore } from '@/stores/flash'

import { ToastType } from '@/constants/toast'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import { ADMIN_REVIEW_ERROR_MESSAGE_MAP } 
  from '@/api/error/business/admin/admin-restaurant-review-error.messages'
import { isReasonFailure } from '@/utils/type-guards'

import RestaurantDetailSkeleton
  from '@/components/common/skeleton/RestaurantDetailSkeleton.vue'
import RestaurantPreview
  from '@/components/owner/restaurant/RestaurantPreview.vue'

const route = useRoute()
const router = useRouter()

const flashStore = useFlashStore()

const adminStore = useAdminRestaurantReviewStore()

const { currentRestaurant, isDetailLoading } = storeToRefs(adminStore)

// reject modal state
const isRejectModalOpen =
  ref(false)

const rejectReason =
  ref('')

const uuid = computed(() => route.params.uuid as string)

const previewRestaurant = computed(() => {
  if(!currentRestaurant.value) return null

  const displayGallery = [
    ...currentRestaurant.value.images.cover.map((img, i) => ({
      uuid: img.uuid,
      url: img.url,
      sortOrder: 0,
    })),
    ...currentRestaurant.value.images.gallery.map((img, i) => ({
      uuid: img.uuid,
      url: img.url,
      sortOrder: i + 1,
    })),
  ]

  return {
    name: currentRestaurant.value.name,
    nameEn: currentRestaurant.value.nameEn,
    category: currentRestaurant.value.category,
    location: currentRestaurant.value.location,
    phone: currentRestaurant.value.phone,
    description: currentRestaurant.value.description,
    rating: null,
    galleryImages: displayGallery,
    menuImages: currentRestaurant.value.images.menu.map((img, i) => ({
      uuid: img.uuid,
      url: img.url,
      sortOrder: i
    })),
  }
})

watch(
  () => route.params.uuid as string,
  (uuid) => {
    if (!uuid) return
    adminStore.fetchDetail(uuid)
  },
  { immediate: true }
)


// 返回列表
function goBack() {

  router.push({
    name: 'AdminRestaurantReview',
  })
}


// 餐廳審核通過
async function handleApprove() {

  const result =
    await adminStore.approve(uuid.value)

  if (!result.ok) {

    // UI lock
    if (isReasonFailure(result)) {

      if (
        result.reason ===
        'APPROVING_RESTAURANT'
      ) {
        return
      }

    } else {

      // system
      if (
        handleAppError(
          result.error,
          {
            showToast: true,
          }
        ).handled
      ) {
        return
      }

      // business
      if (
        resolveBusinessError(
          result.error,
          ADMIN_REVIEW_ERROR_MESSAGE_MAP
        )
      ) {
        return
      }
      
    }

    return
  }

  flashStore.set({
    type: ToastType.SUCCESS,
    message: '已成功通過餐廳申請',
  })

  router.push({
    name: 'AdminRestaurantReview',
  })
}


// 開啟 reject modal
function openReject() {

  isRejectModalOpen.value = true
}


//關閉 reject modal
function closeReject() {

  isRejectModalOpen.value = false

  rejectReason.value = ''
}


// 確認拒絕
async function confirmReject() {

  if (!rejectReason.value.trim()) {
    return
  }

  const result =
    await adminStore.reject(
      uuid.value,
      rejectReason.value
    )

  if (!result.ok) {

    if (isReasonFailure(result)) {

      if (
        result.reason ===
        'REJECTING_RESTAURANT'
      ) {
        return
      }

    } else {

      // system
      if (
        handleAppError(
          result.error,
          {
            showToast: true,
          }
        ).handled
      ) {
        return
      }

      // business
      if (
        resolveBusinessError(
          result.error,
          ADMIN_REVIEW_ERROR_MESSAGE_MAP
        )
      ) {
        return
      }
      
    }

    return
  }

  flashStore.set({
    type: ToastType.SUCCESS,
    message: '已成功拒絕餐廳申請',
  })

  router.push({
    name: 'AdminRestaurantReview',
  })
}

</script>

<style scoped>

.review-detail {
  padding-bottom: 40px;
}

.preview-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-top: 24px;
}

.action-right {
  display: flex;
  gap: 12px;
}

.btn {
  border: none;
  border-radius: 8px;

  padding: 8px 16px;

  color: white;
  cursor: pointer;

  font-weight: 600;
}

.back {
  background: #6c757d;
}

.approve {
  background: #28a745;
}

.reject {
  background: #dc3545;
}


/* =========================
   Modal Overlay（背景遮罩）
   ========================= */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 2000;
}

/* =========================
   Modal Content（主視窗）
   ========================= */
.modal-content {
  width: 90%;
  max-width: 420px;

  background: #FFF6F1;
  border: 1px solid #F2D4C7;
  border-radius: 14px;

  padding: 20px 22px;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  animation: modalIn 0.15s ease-out;
}

/* =========================
   標題
   ========================= */
.modal-content h3 {
  margin: 0 0 12px 0;

  color: #5A2A18;
  font-size: 1.2rem;
  font-weight: 700;
}

/* =========================
   textarea
   ========================= */
.modal-content textarea {
  width: 100%;
  min-height: 120px;

  resize: none;

  border-radius: 10px;
  border: 1px solid #FF9D6F;

  padding: 10px;

  font-size: 0.95rem;

  outline: none;

  background: white;
  color: #5A2A18;
}

.modal-content textarea:focus {
  border-color: #E85D2A;
  box-shadow: 0 0 0 2px rgba(232, 93, 42, 0.15);
}

/* =========================
   buttons container
   ========================= */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  margin-top: 16px;
}

/* =========================
   button base
   ========================= */
.modal-actions button {
  border: none;
  border-radius: 8px;

  padding: 6px 14px;

  cursor: pointer;

  font-weight: 600;
  transition: 0.15s;
}

/* 送出 */
.modal-actions button:first-child {
  background: #E85D2A;
  color: white;
}

.modal-actions button:first-child:hover {
  background: #cf4f22;
}

/* 取消 */
.modal-actions button:last-child {
  background: #F2D4C7;
  color: #5A2A18;
}

.modal-actions button:last-child:hover {
  background: #e8c2b2;
}

@keyframes modalIn {
  from {
    transform: translateY(8px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

</style>