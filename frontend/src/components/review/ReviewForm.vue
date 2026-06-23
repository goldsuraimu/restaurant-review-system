<template>

  <div :class="isEditing ? '' : 'card p-3 mb-3'">
    <!-- 評分 -->
    <div class="star-rating">
      <div class="text-warning mb-1 d-flex align-items-center">
        <div class="d-flex position-relative">
          <div v-for="n in 5" :key="n" class="position-relative" @pointerover="hoverRating = n"
            @pointerleave="hoverRating = 0" @click="setRating(n, form)">

            <!-- 提示文字顯示在每顆星星的正上方 -->
            <div v-if="hoverRating === n" class="tooltip-text position-absolute">
              {{ ratingTips[n - 1] }}
            </div>

            <!-- 星星圖示 -->
            <FontAwesomeIcon :icon="['fas', 'star']" class="mx-1 star"
              :style="{ color: (hoverRating || form.rating) >= n ? 'gold' : '#ccc', cursor: 'pointer' }" />
          </div>
        </div>
        <span class="ms-2">
          {{ form.rating ? form.rating + ' 分' : '尚未評分' }}
        </span>
      </div>
    </div>

    <!-- 評論內容 -->
    <textarea name="content" v-model="form.content" class="form-control mb-2" rows="3"
      placeholder="留下評論內容..." :class="{ 'is-invalid': contentError }"></textarea>
      <div class="invalid-feedback">{{ contentError }}</div>

    <!-- 圖片上傳區域 -->
    <input ref="fileInput" type="file" multiple accept="image/*" @change="onFileChange"
      class="form-control mb-2"/>
    <small class="limit-hint">
      {{ imageCountText }}
    </small>

    <!-- 圖片試覽區   -->
    <div class="d-flex gap-2 flex-wrap mb-2">
      <div 
        v-for="(img, index) in images" 
        :key="img.type === 'new' 
          ? img.file.name + img.file.lastModified 
          : img.uuid"
        class="image-container"
      >
        <img 
          :src="img.type === 'new' ? img.previewUrl : getThumbnailUrl(img.publicId)"
          class="image-thumbnail" 
        />
        <span class="image-name">
          {{ img.type === 'new' ? img.file.name : '' }}
        </span>

        <!-- 進度條顯示 -->
        <div v-if="img.type === 'new' && progressMap?.[props.getFileKey(img.file)] !== undefined" class="progress-wrapper">
          <div class="progress">
            <div class="progress-bar" :style="{ width: progressMap[props.getFileKey(img.file)] + '%' }"></div>
          </div>
          <span class="progress-text">
            {{ progressMap[getFileKey(img.file)] }}%
          </span>
        </div>

        <button
          v-if="!loading" 
          @click="removeImage(index)" 
          class="delete-button"
        >
          <FontAwesomeIcon :icon="['fas', 'xmark']" />
        </button>
      </div>
    </div>

    <!-- 按鈕區域 -->
    <div class="d-flex align-items-center mt-2">
      <button 
        :class="buttonClass" 
        @click="handleClick" 
        :disabled="loading || !isFormValid || (isEditing && !isChanged)">
        {{ buttonText }}
      </button>
      <button 
        v-if="isEditing" 
        class="btn btn-secondary 
        btn-sm ms-2" 
        @click="handleCancel"
        :disabled="loading"
      >
        取消
      </button>
    </div>

    <!-- 錯誤訊息區 -->
    <div v-if="ratingError || fieldErrors.general" class="text-danger mb-2 text-center">
      {{ ratingError || fieldErrors.general }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useReviewForm } from '@/composables/form/review/useReviewForm'
import { useStarRating } from '@/composables/ui/useStarRating'
import { useImageUpload } from '@/composables/upload/useImageUpload'

import { useFormContext } from '@/composables/form/core/useFieldErrors'
import { useBindFields } from '@/composables/form/core/useBindField'

import { getThumbnailUrl } from '@/utils/cloudinary'

import type {
  RestaurantReview,
  CreateReview,
  UpdateReview
} from '@/types/review'

const props = withDefaults(defineProps<{
  currentReview?: RestaurantReview | null
  progressMap?: Record<string, number>
  getFileKey: (file: File) => string
  loading: boolean
}>(), {
  currentReview: null,
  progressMap: () => ({}),
  loading: false
})

const emit = defineEmits<{
  (e: 'submit', payload: CreateReview): void
  (e: 'edit', payload: UpdateReview): void
  (e: 'cancel'): void
}>()

const { clearFieldError, fieldErrors } = useFormContext()


const maxImages = 6

// 按鈕樣式
const buttonClass = computed(() =>
  isEditing.value
    ? 'btn btn-primary btn-sm'
    : 'btn btn-primary'
)

// 圖片
const {
  images,
  deletedImageUuids,
  imageCountText,
  isImageChanged,

  onFileChange,
  removeImage,
  getNewFiles
} = useImageUpload(
  props.currentReview?.images ?? [], {
  maxImages
})

// 表單
const {
  form,
  touched,
  isEditing,
  isFormValid,
  ratingError,
  contentError,
  isChanged,
  reset,
  buttonText
} = useReviewForm(
  props.currentReview, 
  fieldErrors,
  isImageChanged
)

// 星星
const {
  hoverRating,
  ratingTips,
  setRating
} = useStarRating()

const { bindFields } = useBindFields(form, {
  touched,
  onChange(field) {
    clearFieldError(field)
  }
})

// 監聽文字欄位，使用者修改就清掉對應的後端錯誤
bindFields([
  'rating',
  'content',
])

// 送出
async function handleClick() {
  // 當按鈕被點擊時，進行最終驗證
  if (props.loading) return

  if (!isFormValid) return
  if (isEditing.value && !isChanged.value) return

  // // 合併成payload
  const newFiles = getNewFiles()

  const payloadBase = {
    ...form,
    content: form.content.trim()
  }
  
  if (isEditing.value) {
    const payload = {
      ...payloadBase,
      reviewImages: newFiles,
      deletedImages: deletedImageUuids.value
    }

    emit('edit', payload)
  } else {
    const payload = {
      ...payloadBase,
      reviewImages: newFiles
    }

    emit('submit', payload)
  }
}

function handleCancel() {
  reset()
  emit('cancel')
}
</script>



<style scoped>
.star {
  font-size: 1.5rem;
  transition: color 0.2s;
}

/* 提示文字樣式 */
.tooltip-text {
  top: -1.8rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

.image-container {
  position: relative;
}

.image-thumbnail {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
}

.delete-button {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-name {
  display: block;
  margin-top: 8px;
  max-width: 96px;
  white-space: nowrap;
  /* 防止換行 */
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #666;
}

.limit-hint {
  color: #842B00;
  font-size: 0.85rem;
  margin-top: 4px;
  display: block;
}

.progress-wrapper {
  width: 96px;
  margin-top: 4px;
}

.progress {
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #0d6efd;
  transition: width 0.2s;
}

.progress-text {
  font-size: 10px;
  text-align: center;
  display: block;
  margin-top: 2px;
}
</style>