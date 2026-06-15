<template>
  <div v-if="!previewUuid" class="admin-review">
    <h1 class="title">餐廳審核</h1>

    <!-- 工具列 -->
    <div class="toolbar">

      <select v-model="sort" class="sort-select">
        <option value="submittedAt_asc">最舊</option>
        <option value="submittedAt_desc">最新</option>
      </select>

      <button class="refresh-btn" :disabled="isRefreshing" @click="refresh">
        重新整理
      </button>

    </div>

    <ul v-if="isListLoading" class="review-list">
      <AdminRestaurantReviewItemSkeleton v-for="i in PAGE_SIZE" :key="i" />
    </ul>

    <div v-else-if="errorMessage" class="text-danger text-center my-5">
      {{ errorMessage }}
    </div>

    <div v-else-if="restaurants.length === 0" class="text-center my-5">
      <p>目前沒有待審核餐廳。</p>
    </div>

    <ul v-else class="list">
      <li v-for="r in restaurants" :key="r.uuid" class="item">

        <div class="left">
          <h3 class="name" :title="r.name">{{ r.name }}</h3>
          <div class="meta">
            <span class="category" :title="r.category">{{ r.category }}</span>
            <span class="sep">｜</span>
            <span class="location" :title="r.location">{{ r.location }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn preview" @click="openPreview(r)">
            查看
          </button>

          <button class="btn approve" @click="handleApprove(r.uuid)">
            通過
          </button>

          <button class="btn reject" @click="openReject(r.uuid)">
            拒絕
          </button>
        </div>

      </li>
    </ul>

    <!-- 拒絕 -->
    <div v-if="rejectingUuid" class="modal">
      <div class="modal-content">
        <h3>拒絕原因</h3>

        <textarea v-model="rejectReason" />

        <div class="modal-actions">
          <button @click="confirmReject">送出</button>
          <button @click="closeReject">取消</button>
        </div>
      </div>
    </div>

    <Pagination v-if="meta" :page-info="meta" colorBg="#FFFFFF" colorText="#5A2A18" colorActiveBg="#E85D2A"
      colorActiveText="#fff" @update:page="handlePageChange" />

  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify';

import { useAdminRestaurantReviewStore } from '@/stores/admin-restaurant-review'
import { useFlashStore } from '@/stores/flash'

import { resolveErrorMessage } from '@/api/error/resolvers/resolve-error-message'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import { ADMIN_REVIEW_ERROR_MESSAGE_MAP }
  from '@/api/error/business/admin/admin-restaurant-review-error.messages'

import AdminRestaurantReviewItemSkeleton
  from '@/components/common/skeleton/AdminRestaurantReviewItemSkeleton.vue'
import Pagination from '@/components/common/Pagination.vue'

import { isReasonFailure } from '@/utils/type-guards'
import type {
  AdminRestaurantListItem,
} from '@/types/restaurant'

const router = useRouter()
const route = useRoute()
const store = useAdminRestaurantReviewStore()

const { restaurants, meta, isListLoading } = storeToRefs(store)

const flashStore = useFlashStore()

const rejectingUuid = ref<string | null>(null)
const rejectReason = ref('')

const previewUuid = computed(() => route.query.preview as string | undefined)

// 單頁資料數量
const PAGE_SIZE = 20

const page = computed(() => {
  const p = Number(route.query.page)
  return Number.isInteger(p) && p > 0 ? p : 1
})

const sort = computed({
  get: () => (route.query.sort as string) || 'submittedAt_desc',
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

// UI state
const isRefreshing = ref(false)
const errorMessage = ref<string | null>(null)


const allowedSortFields = ['submittedAt']

// 刷新列表（根據當前 page 和 sort）
async function refresh() {
  isRefreshing.value = true
  errorMessage.value = null

  const [rawSort, rawOrder] = sort.value.split('_')

  const sortField = allowedSortFields.includes(rawSort)
    ? rawSort
    : 'submittedAt'

  const order =
    rawOrder === 'desc' ? 'desc' : 'asc'

  const result = await store.load({
    page: page.value,
    limit: PAGE_SIZE,
    sort: sortField,
    order,
  })

  if (!result.ok) {
    errorMessage.value = resolveErrorMessage(
      result.error,
      '目前無法取得審查列表，請稍後再試'
    )
  }

  isRefreshing.value = false
}


// 自動刷新
watch(
  () => [route.query.page, route.query.sort],
  () => {
    refresh()
  },
  { immediate: true }
)

// 頁面載入時顯示 flash 訊息（如果有的話）
onMounted(() => {

  if (!flashStore.message || !flashStore.type) return

  toast[flashStore.type](
    flashStore.message
  )

  flashStore.clear()
})

// 頁碼改變
function handlePageChange(p: number) {
  router.push({
    query: {
      ...route.query,
      page: p
    }
  })
}

// 通過審核
async function handleApprove(uuid: string) {

  const result = await store.approve(uuid)

  if (!result.ok) {

    // UI lock
    if (isReasonFailure(result)) {
      if (result.reason === 'APPROVING_RESTAURANT') {
        return
      }
    } else {

      // system
      if (
        handleAppError(
          result.error,
          { showToast: true }
        ).handled
      ) {
        return
      }

      // business
      if (resolveBusinessError(result.error, ADMIN_REVIEW_ERROR_MESSAGE_MAP)) {
        return
      }

    }

    return
  }

  await refresh()

  toast.success('已成功通過餐廳申請')
}

// 開啟拒絕對話框
function openReject(uuid: string) {
  rejectingUuid.value = uuid
}

// 關閉拒絕對話框
function closeReject() {
  rejectingUuid.value = null
  rejectReason.value = ''
}

// 確認拒絕申請
async function confirmReject() {
  if (!rejectingUuid.value) {
    return
  }

  if (!rejectReason.value.trim()) {
    return
  }

  const result = await store.reject(rejectingUuid.value, rejectReason.value)

  if (!result.ok) {
    if (isReasonFailure(result)) {
      if (result.reason === 'REJECTING_RESTAURANT') return;
    } else {

      // system
      if (handleAppError(
        result.error, {
        showToast: true
      }).handled
      ) return;

      // business
      if (resolveBusinessError(result.error, ADMIN_REVIEW_ERROR_MESSAGE_MAP)) return

    }
    return
  }

  closeReject()
  await refresh()
  toast.success('已成功拒絕餐廳申請')
}

// 開啟預覽（改為路由導向）
function openPreview(r: AdminRestaurantListItem) {
  router.push({
    name: 'AdminRestaurantReviewDetail',
    params: {
      uuid: r.uuid,
    },
  })
}

</script>

<style scoped>
.admin-review {
  padding: 25px;
}

.title {
  font-size: 1.8rem;
  color: #842B00;
  margin-bottom: 20px;
  font-weight: bold;
}

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

.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: white;
  border: 1px solid #F2D4C7;
  border-radius: 14px;
  padding: 16px 20px;

  color: #5A2A18;
  font-weight: 500;

  gap: 14px;

  transition: all .15s ease;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.left {
  flex: 1;
  min-width: 0;
}

.name {
  color: #5A2A18;

  margin: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  font-size: 0.9rem;
  color: #888;
  min-width: 0;
  width: 100%;

  display: flex;
  gap: 6px;
  align-items: center;
}

.location {
  flex: 1;
  min-width: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category {
  flex-shrink: 1;
  min-width: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  max-width: 40%;
}

.sep {
  flex-shrink: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.preview-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.action-right {
  display: flex;
  gap: 10px;
}

.btn {
  border-radius: 8px;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  color: white;
}

.preview {
  background: #6c757d;
}

.approve {
  background: #28a745;
}

.reject {
  background: #dc3545;
}

.back {
  background: #6c757d;
}

.close-btn {
  margin-top: 10px;
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

@media (max-width: 768px) {
  .item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .left {
    width: 100%;
  }

  .name {
    width: 100%;
    max-width: 100%;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>