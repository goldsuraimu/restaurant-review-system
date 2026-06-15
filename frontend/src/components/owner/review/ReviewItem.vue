<template>
  <li class="review-item">
    <div class="review-content">
      <div class="review-header">
        <strong class="reviewer-name">{{ review.nickname ?? review.userName }}</strong>

        <span v-if="showRestaurant" class="restaurant-name">
          {{ review.restaurantName }}
        </span>

        <ReviewStars :rating="review.rating" />
      </div>

      <p class="text-content">{{ review.content }}</p>

      <!-- 縮圖 -->
      <div>
        <ImageThumbnailGrid 
        :images="review.images" 
        :clickable="isClickable" 
        @open="openLightbox" 
      />
      </div>

      <RelativeTime 
        :createdAt="review.createdAt" 
        :updatedAt="review.updatedAt" 
        color="#5A2B00" 
        editedColor="#9E5C40"
        mode="absolute" 
        />
    </div>

    <!-- 已回覆 -->
    <div v-if="review.reply && mode !== 'preview' && activeEditReviewUuid !== review.uuid" class="owner-reply">
      <strong>{{ review.restaurantName }}（店家）：</strong>
      <p class="text-content">{{ review.reply.content }}</p>
      
      <RelativeTime 
        :createdAt="review.reply.createdAt" 
        :updatedAt="review.reply.updatedAt" 
        color="#5A2B00"
        editedColor="#9E5C40" 
        mode="absolute" 
      />
    </div>

    <!-- MODE: LIST / MANAGE (REPLY ACTIONS) -->
    <div v-if="canReply && !review.reply" class="review-reply-new">
      <button 
        v-if="activeReplyReviewUuid !== review.uuid" 
        class="btn-reply" 
        @click="onOpenReply"
      >
        回覆
      </button>

      <OwnerReplyForm 
        v-if="activeReplyReviewUuid === review.uuid" 
        :is-replying="replyingReviewUuid === review.uuid"
        @submit="onSubmitReply" 
        @cancel="onCancelReply"
        />
    </div>

    <!-- MODE: MANAGE ONLY (EDIT / DELETE) -->
    <div v-if="canEdit && review.reply" class="review-reply-exist">
      <div class="btn-group">
        <button 
          v-if="activeEditReviewUuid !== review.uuid" 
          class="btn-edit" 
          @click="onOpenEdit"
        >
          編輯
        </button>
        <button 
          v-if="activeEditReviewUuid !== review.uuid" 
          class="btn-delete"
          @click="onDeleteReply"
        >
          刪除
        </button>
      </div>

      <OwnerReplyForm 
        v-if="activeEditReviewUuid === review.uuid" 
        :initialContent="review.reply?.content"
        :is-replying="replyingReviewUuid === review.uuid" 
        @edit="onEditReply"
        @cancel="onCancelEdit"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import OwnerReplyForm from '@/components/owner/review/OwnerReplyForm.vue'
import ReviewStars from '@/components/review/ReviewStars.vue'
import RelativeTime from '@/components/common/RelativeTime.vue'
import ImageThumbnailGrid from '@/components/common/ImageThumbnailGrid.vue'

import type { 
  ReviewReplyRequest,
  RestaurantReview,
  ReviewImage
 } from '@/types/review'

const props = withDefaults(defineProps<{
  review: RestaurantReview

  showRestaurant?: boolean  // 是否顯示餐廳名稱
  mode?: 'preview' | 'list' | 'manage' 

  activeReplyReviewUuid?: string | null
  activeEditReviewUuid?: string | null
  replyingReviewUuid?: string | null
}>(), {
  showRestaurant: false,
  mode: 'list',
  activeReplyReviewUuid: null,
  activeEditReviewUuid: null,
  replyingReviewUuid: null
})

const emit = defineEmits<{
  (e: 'open-reply', reviewUuid: string): void
  (e: 'cancel-reply'): void
  (e: 'submit-reply', reviewUuid: string, payload: ReviewReplyRequest): void
  (e: 'open-edit', reviewUuid: string): void
  (e: 'cancel-edit'): void
  (e: 'edit-reply', reviewUuid: string, payload: ReviewReplyRequest): void
  (e: 'delete-reply', reviewUuid: string): void
  (e: 'open-lightbox', images: ReviewImage[], index: number): void
}>()

const isClickable = computed(() => props.mode !== 'preview')

const canReply = computed(() =>
  props.mode === 'list' || props.mode === 'manage'
)

const canEdit = computed(() =>
  props.mode === 'manage'
)

function onOpenReply() {
  emit('open-reply', props.review.uuid)
}

function onCancelReply() {
  emit('cancel-reply')
}

function onSubmitReply(payload: ReviewReplyRequest) {
  emit('submit-reply', props.review.uuid, payload)
}

function onOpenEdit() {
  emit('open-edit', props.review.uuid)
}

function onCancelEdit() {
  emit('cancel-edit')
}

function onEditReply(payload: ReviewReplyRequest) {
  emit('edit-reply', props.review.uuid, payload)
}

function onDeleteReply() {
  emit('delete-reply', props.review.uuid)
}

function openLightbox(i: number) {
  emit('open-lightbox', props.review.images, i)
}


</script>

<style scoped>
.review-item {
  background: #FFE7DB;
  padding: 15px 20px;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.reviewer-name {
  font-weight: bold;
  color: #842B00;
}

.restaurant-name {
  margin-left: 8px;
  font-size: 0.9rem;
  color: #9E5C40;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  min-width: 0;
  max-width: 160px;
  display: inline-block;
}

.review-content .content{
  margin-bottom: 6px;
  line-height: 1.4;
  color: #5A2B00;
}

/* 店家回覆 */
.owner-reply {
  margin-top: 10px;
  background: #FFD9C0;
  padding: 12px;
  border-radius: 12px;
  border-left: 4px solid #FF7A45;
  color: #842B00;
}

/* 未回覆評論區 */
.review-reply-new {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-reply-new .btn-reply {
  background: #FF7A45;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
}

.review-reply-new .btn-reply:hover {
  background: #FF5C1A;
}

/* 已回覆評論區 */
.review-reply-exist {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 編輯+刪除按鈕列 */
.review-reply-exist .btn-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

/* 編輯按鈕 */
.btn-edit {
  background: #FF7A45;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
}

.btn-edit:hover {
  background: #FF5C1A;
}

/* 刪除按鈕 */
.btn-delete {
  background: #d9534f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
}

.btn-delete:hover {
  background: #c9302c;
}


/* 無評論提示 */
.no-review p {
  font-size: 1rem;
  color: #842B00;
}
</style>