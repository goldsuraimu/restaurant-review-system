<template>
  <div id="restaurants-panel">
    <div class="header">
      <h1>我的餐廳</h1>
      <RouterLink :to="{ name: 'OwnerRestaurantCreate' }" class="btn-add">
        <FontAwesomeIcon :icon="['fas', 'plus']" />
        新增餐廳
      </RouterLink>
    </div>
    <div class="toolbar">

      <select v-model="status" class="status-select">

        <option value="all">
          全部
        </option>

        <option value="under_review">
          初次送審中
        </option>

        <option value="revision_under_review">
          初次退件後重新送審
        </option>

        <option value="rejected">
          初次建立未通過
        </option>

        <option value="update_under_review">
          修改審核中
        </option>

        <option value="update_revision_under_review">
          修改退件後重新送審
        </option>

        <option value="update_rejected">
          修改未通過
        </option>

        <option value="published">
          已上線
        </option>

      </select>
    </div>

    <LoadingSpinner v-if="isFetchingList" />

    <div v-else-if="listError" class="text-danger text-center my-5">
      載入餐廳列表失敗: {{ listError }}
    </div>

    <ul v-else class="restaurant-list">
      <li v-for="restaurant in restaurants" :key="restaurant.restaurantUuid" class="restaurant-item">

        <div class="restaurant-main">

          <div class="restaurant-left">

            <div class="restaurant-info">

              <span class="restaurant-name" :title="restaurant.name">
                {{ restaurant.name }}
              </span>

              <div class="restaurant-badges">

                <span v-if="isPublishedWithDraft(restaurant.displayStatus)" class="status-badge approved">
                  已上線
                </span>

                <span class="status-badge" :class="getStatusClass(restaurant.displayStatus)">
                  {{ getStatusText(restaurant.displayStatus) }}
                </span>

                <button v-if="restaurant.rejectedAt" class="btn-reason"
                  @click="toggleReason(restaurant.restaurantUuid)">
                  查看原因
                </button>

              </div>

            </div>

          </div>

          <div class="actions">

            <RouterLink v-if="canEditRestaurant(restaurant.displayStatus)" class="action-btn"
              :to="{ name: 'OwnerRestaurantEdit', params: { uuid: restaurant.restaurantUuid } }">
              編輯
            </RouterLink>

            <RouterLink v-if="canManageReviews(restaurant.displayStatus)" class="action-btn"
              :to="{ name: 'ManageReviews', params: { uuid: restaurant.restaurantUuid } }">
              管理評論
            </RouterLink>

            <button class="action-btn btn-delete"
              @click="handleDelete(restaurant.restaurantUuid, restaurant.displayStatus)">
              {{ getDeleteButtonText(restaurant.displayStatus) }}
            </button>

          </div>

        </div>

        <transition name="expand">
          <div v-if="
            expandedRestaurant === restaurant.restaurantUuid &&
            restaurant.rejectedAt
          " class="reject-reason">
            <div class="reject-title">
              退件原因
            </div>

            <div class="reject-content">
              {{ restaurant.reviewNote }}
            </div>
          </div>
        </transition>

      </li>
    </ul>

    <Pagination v-if="meta" :pageInfo="meta" colorBg="#FFFFFF" colorText="#5A2A18" colorActiveBg="#E85D2A"
      colorActiveText="#fff" @update:page="onPageChange" />
  </div>

  <ConfirmModal />
</template>

<script setup lang="ts">
import { watch, ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router'

import { useOwnerRestaurantsStore } from '@/stores/owner-restaurants'
import { useFlashStore } from '@/stores/flash'

import { useConfirmModal } from '@/composables/ui/useConfirmModal'

import { resolveErrorMessage } from '@/api/error/resolvers/resolve-error-message'
import { resolveBusinessError } from '@/api/error/business/shared/resolve-business-error'
import {
  OWNER_RESTAURANT_ERROR_MESSAGE_MAP
} from '@/api/error/business/owner/restaurant/restaurant-error.messages'
import { handleAppError } from '@/api/error/handlers/app-error.handler'
import { isReasonFailure } from '@/utils/type-guards'
import {
  canEditRestaurant,
  canManageReviews,
  isPublishedWithDraft,
  getDeleteButtonText,
  getDeleteConfirmMessage
} from '@/utils/permissions/restaurant-permissions'

import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Pagination from '@/components/common/Pagination.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

import type { RestaurantDisplayStatus } from '@/types/restaurant'



const { isFetchingList, restaurants, meta } = storeToRefs(useOwnerRestaurantsStore())
const { loadRestaurants, deleteRestaurant } = useOwnerRestaurantsStore()
const listError = ref<string | null>(null);

const route = useRoute()
const router = useRouter()

const flash = useFlashStore()

const showConfirmModal = useConfirmModal()

const expandedRestaurant = ref<string | null>(null)

const page = computed(() => {
  const p = Number(route.query.page)
  return isNaN(p) || p <= 0 ? 1 : p
})

const currentStatus = computed(() => {
  const s = route.query.status
  if (!s) return 'ALL'

  const value = String(s).toUpperCase()

  if (
    value === 'UNDER_REVIEW' ||
    value === 'REVISION_UNDER_REVIEW' ||
    value === 'REJECTED' ||
    value === 'UPDATE_UNDER_REVIEW' ||
    value === 'UPDATE_REVISION_UNDER_REVIEW' ||
    value === 'UPDATE_REJECTED' ||
    value === 'PUBLISHED'
  ) {
    return value
  }


  return 'ALL'
})

const status = computed({
  get() {
    return String(route.query.status || 'all')
  },
  set(val: string) {
    router.push({
      query: {
        ...route.query,
        status: val,
        page: 1
      }
    })
  }
})

// 頁碼跟狀態變化時重新載入餐廳列表
watch(
  [() => route.query.page, currentStatus],
  load,
  { immediate: true }
)

// 處理從編輯頁跳轉回來的成功訊息
onMounted(() => {
  if (!flash.message || !flash.type) return

  toast[flash.type](flash.message)

  flash.clear()
})


// 切換查看拒絕原因
function toggleReason(uuid: string) {
  expandedRestaurant.value =
    expandedRestaurant.value === uuid ? null : uuid
}

// 將狀態轉換為中文顯示
function getStatusText(
  status: RestaurantDisplayStatus
) {

  switch (status) {

    case 'UNDER_REVIEW':
      return '初次送審中'

    case 'REVISION_UNDER_REVIEW':
      return '初次退件後重新送審'

    case 'REJECTED':
      return '初次建立未通過'

    case 'UPDATE_UNDER_REVIEW':
      return '修改審核中'

    case 'UPDATE_REVISION_UNDER_REVIEW':
      return '修改退件後重新送審'

    case 'UPDATE_REJECTED':
      return '修改未通過'

    case 'PUBLISHED':
      return '已上線'

    default:
      return '未知'
  }
}

// 狀態對應的 CSS 類別
function getStatusClass(
  status: RestaurantDisplayStatus
) {

  return {

    pending:
      status === 'UNDER_REVIEW',

    resubmitted:
      status === 'REVISION_UNDER_REVIEW' ||
      status === 'UPDATE_REVISION_UNDER_REVIEW',

    updating:
      status === 'UPDATE_UNDER_REVIEW',

    approved:
      status === 'PUBLISHED',

    rejected:
      status === 'REJECTED' ||
      status === 'UPDATE_REJECTED',
  }
}

// 頁碼變化時重新載入餐廳列表
async function load() {
  listError.value = null

  const result = await loadRestaurants({
    page: page.value,
    limit: 20,
    displayStatus: currentStatus.value
  })

  if (!result.ok) {
    listError.value = resolveErrorMessage(
      result.error,
      '目前無法取得餐廳列表'
    )
    return
  }
}

// 處理頁面變更
function onPageChange(page: number) {
  router.push({
    query: {
      ...route.query,
      page
    }
  })
}

async function handleDelete(
  restaurantUuid: string,
  displayStatus: RestaurantDisplayStatus
) {
  const confirmed = await showConfirmModal({
    title: getDeleteButtonText(displayStatus),
    message: getDeleteConfirmMessage(displayStatus),
  })

  if (!confirmed) return

  const result = await deleteRestaurant({
    restaurantUuid,
    displayStatus
  })

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
      if (resolveBusinessError(result.error, OWNER_RESTAURANT_ERROR_MESSAGE_MAP)) return

    }

    return
  }

  toast.success('已成功刪除餐廳')
}

</script>

<style scoped>
#restaurants-panel {
  padding: 25px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  color: #5A2A18;
  font-weight: 700;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.status-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #FF9D6F;
  background-color: #FFE7DB;
  color: #842B00;
  font-weight: 500;
  cursor: pointer;
}

.btn-add {
  background: #E85D2A;
  color: white;
  padding: 9px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background .2s ease;
}

.btn-add:hover {
  background: #C84E22;
}

.restaurant-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.restaurant-item {
  display: flex;
  flex-direction: column;
  gap: 14px;

  background: white;
  border: 1px solid #F2D4C7;

  padding: 16px 20px;
  border-radius: 14px;

  color: #5A2A18;
  font-weight: 500;

  transition: all .15s ease;
}

.restaurant-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.restaurant-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.restaurant-name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.restaurant-left {
  flex: 1;
  min-width: 0;
}

.restaurant-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.status-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.restaurant-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* =========
    狀態顏色 
  ==========*/
.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.updating {
  background: #D9ECFF;
  color: #0B5CAD;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.resubmitted {
  background: #E8D9FF;
  color: #6A1FB5;
}

.btn-reason {
  background: transparent;
  border: none;
  color: #E85D2A;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}

/* ============ 
  拒絕原因樣式 
  ============= */
.reject-reason {
  border-top: 1px solid #F5D7CC;

  padding-top: 14px;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reject-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #A94442;
}

.reject-content {
  background: #FFF5F5;

  border: 1px solid #F3C2C2;

  padding: 12px;
  border-radius: 10px;

  color: #721C24;
  font-size: 0.9rem;

  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

/* =========== 
    按鈕樣式 
  ============= */

.actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.action-btn {
  background: #E85D2A;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: .85rem;
  font-weight: 500;
  transition: background .2s ease;
}

.action-btn:hover {
  background: #C84E22;
}

.btn-delete {
  background: #d9534f;
}

.btn-delete:hover {
  background: #c9302c;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .restaurant-name {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
    word-break: break-word;
  }

  .restaurant-main {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
