<template>
  <div class="card mb-3 p-3">
    <div class="d-flex justify-content-between">
      <strong>{{ displayName }}</strong>
      <RelativeTime 
        :createdAt="review.createdAt" 
        :updatedAt="review.updatedAt" 
      />
    </div>

    <!-- 評分 -->
    <div class="text-warning mb-1">
      <ReviewStars :rating="review.rating" />
      <span class="ms-2">{{ review.rating }} 分</span>
    </div>

    <!-- 編輯刪除按鈕 -->
    <div v-if="isAuthenticated && authUser!.uuid === review.userUuid" class="d-flex justify-content-end">
      <button class="btn btn-sm btn-outline-primary me-2" @click="handleEdit()">編輯</button>
      <button class="btn btn-sm btn-outline-danger" @click="handleDelete()">刪除</button>
    </div>

    <!-- 評論內容 -->
    <p ref="contentRef" class="text-content" :class="{ collapsed: !expanded }">
      {{ review.content }}
    </p>

    <div class="mt-2">
     <button v-if="showMore" class="btn btn-text-toggle btn-sm p-0" @click="expanded = !expanded">
        {{ expanded ? '收合' : '查看更多' }}
      </button>
    </div>

    <div>
      <!-- 縮圖 -->
      <ImageThumbnailGrid :images="review.images" @open="i => open(i)" />
    </div>

    <!-- 業者回覆 -->
    <div v-if="review.reply" class="reply-card">
      <small class="reply-name">{{ review.restaurantName }}（店家）:</small>
      <small class="reply-time">
        <RelativeTime 
          :createdAt="review.reply.createdAt" 
          :updatedAt="review.reply.updatedAt" 
        />
      </small>
    
      <p ref="replyRef" class="text-content mt-2" :class="{ collapsed: !replyExpanded }">
        {{ review.reply.content }}
      </p>

      <button v-if="showReplyMore" class="btn btn-text-toggle btn-sm p-0" @click="replyExpanded = !replyExpanded">
        {{ replyExpanded ? '收合' : '查看更多' }}
      </button>
    
    </div>
  </div>


</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import ImageThumbnailGrid from '@/components/common/ImageThumbnailGrid.vue'
import RelativeTime from '@/components/common/RelativeTime.vue'
import ReviewStars from '@/components/review/ReviewStars.vue'

import { useAuthStore } from '@/stores/auth'

import type { RestaurantReview } from '@/types/review'

const props = defineProps<{
  review: RestaurantReview
}>()

const emit = defineEmits<{
  (e: 'review-deleted', review: RestaurantReview): void
  (e: 'edit-mode-entered' ): void
  (e: 'open-lightbox', index: number): void
}>()

const authStore = useAuthStore()
const { authUser, isAuthenticated } = storeToRefs(authStore)

const displayName = computed(() => props.review.nickname || props.review.userName)

// 判斷是否需要顯示「查看更多」按鈕
const contentRef = ref<HTMLElement>()
const replyRef = ref<HTMLElement>()

const expanded = ref(false)
const replyExpanded = ref(false)

const showMore = ref(false)
const showReplyMore = ref(false)

// 拆分檢查邏輯，避免互相干擾
async function checkContentOverflow() {
  if (!expanded.value && contentRef.value) {
    showMore.value = contentRef.value.scrollHeight > contentRef.value.clientHeight
  }
}

async function checkReplyOverflow() {
  if (!replyExpanded.value && replyRef.value) {
    showReplyMore.value = replyRef.value.scrollHeight > replyRef.value.clientHeight
  }

}

async function checkOverflow() {
  await nextTick()
  checkContentOverflow()
  checkReplyOverflow()
}


onMounted(checkOverflow)

watch(
  () => props.review.content,
  async () => {
    expanded.value = false // 先強制把展開狀態重設為關閉（文字縮回 4 行）
    await nextTick()       // 等 Vue 把縮回後的畫面畫好
    checkContentOverflow() // 重新精準量測高度，少於 4 行按鈕就會消失
  }
)

watch(
  () => props.review.reply?.content,
  async () => {
    replyExpanded.value = false
    await nextTick()
    checkReplyOverflow()
  }
)

function handleDelete() {
  emit('review-deleted', props.review)
}

function handleEdit() {
  emit('edit-mode-entered')
}

function open(i: number) {
  emit('open-lightbox', i)
}
</script>

<style scoped>

.reply-card {
  position: relative;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.reply-name {
  display: block;
  color: #6e6e6e;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.reply-time {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: #9e9e9e;
  font-size: 0.75rem;
}

.btn-text-toggle {
  color: #5a626a;
  background: transparent;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-text-toggle:hover {
  color: #1a1a1a;
  text-decoration: underline;
}

.collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
}

</style>
