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

      <p ref="contentRef" class="text-content" :class="{ collapsed: !expanded }">
        {{ review.content }}
      </p>

      <button 
        v-if="showMore" 
        class="btn btn-text-toggle btn-sm p-0" 
        @click="expanded = !expanded"
      >
        {{ expanded ? '收合' : '查看更多' }}
      </button>

      <!-- 縮圖 -->
      <div>
        <ImageThumbnailGrid 
        :images="review.images" 
        :clickable="isClickable" 
        @open="openLightbox" 
      />
      </div>

      <div class="mt-2">
        <RelativeTime 
          :createdAt="review.createdAt" 
          :updatedAt="review.updatedAt" 
          color="#5A2B00" 
          editedColor="#9E5C40"
          mode="absolute" 
          />
      </div>
    </div>

    <!-- 已回覆 -->
    <div 
      v-if="review.reply 
        && mode !== 'preview' 
        && activeEditReviewUuid !== review.uuid"
      class="owner-reply"
    >
      <strong>{{ review.restaurantName }}（店家）：</strong>

      <p 
        ref="replyRef" 
        class="text-content mt-2" 
        :class="{ collapsed: !replyExpanded }"
      >
        {{ review.reply.content }}
      </p>

      <button 
        v-if="showReplyMore" 
        class="btn btn-text-toggle btn-sm p-0" 
        @click="replyExpanded = !replyExpanded"
      >
        {{ replyExpanded ? '收合' : '查看更多' }}
      </button>
      <div class="mt-2">
        <RelativeTime 
          :createdAt="review.reply.createdAt" 
          :updatedAt="review.reply.updatedAt" 
          color="#5A2B00"
          editedColor="#9E5C40" 
          mode="absolute" 
        />
      </div>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'

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
  // 在下一個影格渲染前執行這段
  // 因為v-if會在下一個影格才會把元素顯示出來，這樣才能正確量測高度
  requestAnimationFrame(() => {
    if (!replyExpanded.value && replyRef.value) {
      showReplyMore.value = replyRef.value.scrollHeight > replyRef.value.clientHeight
    }
  })
}

async function checkOverflow() {
  await nextTick()
  checkContentOverflow()
  checkReplyOverflow()
}


onMounted(checkOverflow)

watch(
  () => props.review.reply?.content,
  async () => {
    replyExpanded.value = false  // 先強制把展開狀態重設為關閉（文字縮回 4 行）

    await nextTick()             // 不加也可以，因為後續有 requestAnimationFrame()，
                                 // nextTick() 只能確保 DOM tree 更新完成，
                                 // 但不保證元素的尺寸已經更新完成，
                                 // 所以在v-if顯示的情況下還是要用 requestAnimationFrame()
                                 // 去確保元素尺寸已經更新完成
    checkReplyOverflow()
  }
)

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

.btn-text-toggle {
  color: #9E5C40;
  background: transparent;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-text-toggle:hover {
  color: #FF7A45;
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