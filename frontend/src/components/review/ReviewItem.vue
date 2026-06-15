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
    <p class="text-content">{{ review.content }}</p>
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
      <p class="text-content mt-2">{{ review.reply.content }}</p>
    </div>
  </div>


</template>

<script setup lang="ts">
import { computed } from 'vue'
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
</style>
