<template>
  <div class="form-wrapper">
    <div v-if="!previewMode" id="create-panel">
      <h1 class="text-center mb-4">{{ title }}</h1>

      <div v-if="fieldErrors.general" class="alert alert-danger">
        {{ fieldErrors.general }}
      </div>

      <form @submit.prevent="submit">
        <fieldset :disabled="isSubmitting">
          <!-- 餐廳名稱 -->
          <div class="mb-3">
            <label for="name" class="form-label">
              <span class="text-danger">*</span>
              餐廳名稱
            </label>
            <input v-model="form.name" id="name" class="form-control" :class="{ 'is-invalid': nameError }" minlength="2"
              maxlength="50" />
            <div class="invalid-feedback">{{ nameError }}</div>
          </div>

          <!-- 英文名稱 -->
          <div class="mb-3">
            <label for="en-name" class="form-label">餐廳英文名稱</label>
            <input v-model="form.nameEn" id="en-name" class="form-control" :class="{ 'is-invalid': nameEnError }"
              minlength="2" maxlength="50" />
            <div class="invalid-feedback">{{ nameEnError }}</div>
          </div>

          <!-- 餐廳類別 -->
          <div class="mb-3">
            <label for="category" class="form-label">
              <span class="text-danger">*</span>
              餐廳類別
            </label>
            <input v-model="form.category" id="category" class="form-control" :class="{ 'is-invalid': categoryError }"
              minlength="1" maxlength="30" />
            <div class="invalid-feedback">{{ categoryError }}</div>
          </div>

          <!-- 地址 -->
          <div class="mb-3">
            <label for="location" class="form-label">
              <span class="text-danger">*</span>
              餐廳地址
            </label>
            <input v-model="form.location" id="location" class="form-control" :class="{ 'is-invalid': locationError }"
              minlength="5" maxlength="100" />
            <div class="invalid-feedback">{{ locationError }}</div>
          </div>

          <!-- 電話 -->
          <div class="mb-3">
            <label for="phone" class="form-label">餐廳電話</label>
            <input v-model="form.phone" id="phone" class="form-control" :class="{ 'is-invalid': phoneError }"
              minlength="10" maxlength="15" />
            <div class="invalid-feedback">{{ phoneError }}</div>
          </div>

          <!-- 介紹 -->
          <div class="mb-3">
            <label for="description" class="form-label">餐廳介紹</label>
            <textarea v-model="form.description" id="description" class="form-control"
              :class="{ 'is-invalid': descriptionError }" rows="3" maxlength="500">
        </textarea>
            <div class="invalid-feedback">{{ descriptionError }}</div>
          </div>

          <!-- 封面圖片 -->
          <div class="mb-3">
            <label class="form-label">
              <span class="text-danger">*</span>
              封面圖片(限1張)
            </label>
            <input type="file" class="form-control" accept="image/*" @change="onCoverChange" :disabled="isCoverFull" />

            <small class="limit-hint">
              {{ coverCountText }}
            </small>

            <div class="preview-group">
              <div v-for="(img, index) in coverImages" :key="img.type === 'new'
                ? img.file.name + img.file.lastModified
                : img.uuid" class="preview-wrapper">
                <img :src="img.type === 'new' ? img.previewUrl : img.url" class="preview" />

                <!-- 進度條顯示 -->
                <div v-if="img.type === 'new' && progressMap?.[props.getFileKey(img.file)] !== undefined"
                  class="progress-wrapper">
                  <div class="progress">
                    <div class="progress-bar" :style="{ width: progressMap[props.getFileKey(img.file)] + '%' }"></div>
                  </div>
                  <span class="progress-text">
                    {{ progressMap[getFileKey(img.file)] }}%
                  </span>
                </div>

                <button 
                  v-if="!loading" 
                  type="button" 
                  class="remove-btn" 
                  @click="removeCoverImage(index)"
                >
                  <FontAwesomeIcon :icon="['fas', 'xmark']" />
                </button>
              </div>
            </div>
          </div>

          <!-- 展示圖片 -->
          <div class="mb-3">
            <label class="form-label">
              展示圖片(可多張，最多10張)
            </label>
            <input type="file" class="form-control" accept="image/*" multiple @change="onGalleryChange"
              :disabled="isGalleryFull" />
            <small class="limit-hint">
              {{ galleryCountText }}
            </small>

            <div class="preview-group">
              <div v-for="(img, index) in galleryImages" :key="img.type === 'new'
                ? img.file.name + img.file.lastModified
                : img.uuid" class="preview-wrapper">
                <img :src="img.type === 'new' ? img.previewUrl : img.url" class="preview" />

                <!-- 進度條顯示 -->
                <div v-if="img.type === 'new' && progressMap?.[props.getFileKey(img.file)] !== undefined"
                  class="progress-wrapper">
                  <div class="progress">
                    <div class="progress-bar" :style="{ width: progressMap[props.getFileKey(img.file)] + '%' }"></div>
                  </div>
                  <span class="progress-text">
                    {{ progressMap[getFileKey(img.file)] }}%
                  </span>
                </div>

                <button 
                  v-if="!loading" 
                  type="button" 
                  class="remove-btn" 
                  @click="removeGalleryImage(index)"
                >
                  <FontAwesomeIcon :icon="['fas', 'xmark']" />
                </button>
              </div>
            </div>
          </div>

          <!-- 菜單圖片 -->
          <div class="mb-3">
            <label class="form-label">
              <span class="text-danger">*</span>
              菜單圖片(可多張，最多10張)
            </label>
            <input type="file" class="form-control" accept="image/*" multiple @change="onMenuChange"
              :disabled="isMenuFull"  />

            <small class="limit-hint">
              {{ menuCountText }}
            </small>

            <div class="preview-group">
              <div v-for="(img, index) in menuImages" :key="img.type === 'new'
                ? img.file.name + img.file.lastModified
                : img.uuid" class="preview-wrapper">
                <img :src="img.type === 'new' ? img.previewUrl : img.url" class="preview" />

                <!-- 進度條顯示 -->
                <div v-if="img.type === 'new' && progressMap?.[props.getFileKey(img.file)] !== undefined"
                  class="progress-wrapper">
                  <div class="progress">
                    <div class="progress-bar" :style="{ width: progressMap[props.getFileKey(img.file)] + '%' }"></div>
                  </div>
                  <span class="progress-text">
                    {{ progressMap[getFileKey(img.file)] }}%
                  </span>
                </div>

                <button 
                  v-if="!loading"  
                  type="button" 
                  class="remove-btn" 
                  @click="removeMenuImage(index)"
                >
                  <FontAwesomeIcon :icon="['fas', 'xmark']" />
                </button>
              </div>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="btn-save" @click="previewMode = true" :disabled="!isFormValid || !isImageValid || isSubmitting || isUpdating || loading">
              預覽畫面
            </button>
            <button type="submit" class="btn-save" :disabled="!isFormValid || !isImageValid || isSubmitting || isUpdating || loading || (isEditing && !isDirty)">
              <span v-if="isSubmitting || isUpdating || loading">處理中...</span>
              <span v-else-if="isEditing && !isDirty">尚未修改</span>
              <span v-else>{{ submitText }}</span>
            </button>
            <RouterLink 
              :to="{ name: 'OwnerRestaurants' }" 
              class="btn-cancel" 
              :class="{
                disabled:
                  isSubmitting ||
                  isUpdating ||
                  loading
              }"
            >
              取消 
            </RouterLink>
          </div>
        </fieldset>
      </form>
    </div>


    <!-- 預覽畫面 -->
    <div v-else>
      <RestaurantPreview :restaurant="previewRestaurant" />
      <div class="actions mt-4">
        <button class="btn-save" @click="previewMode = false" :disabled="isSubmitting">返回編輯</button>
        <button 
          class="btn-save" 
          @click="submit" 
          :disabled=" !isFormValid || !isImageValid || isSubmitting || isUpdating|| loading || (isEditing && !isDirty)"
        >
          <span v-if="isSubmitting || loading">處理中...</span>
          <span v-else-if="isEditing && !isDirty">尚未修改</span>
          <span v-else>{{ submitText }}</span>
        </button>
      </div>
    </div>
    <div v-if="isSubmitting" class="overlay">
      <LoadingSpinner :size="spinnerSize" :text="spinnerText" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'  
import { storeToRefs } from 'pinia'

import { useRestaurantForm } from '@/composables/form/restaurant/useRestaurantForm'
import { useOwnerRestaurantsStore } from '@/stores/owner-restaurants'
import { useFormContext } from '@/composables/form/core/useFieldErrors'
import { useBindFields } from '@/composables/form/core/useBindField'
import { useRestaurantPreview } from '@/composables/preview/useRestaurantPreview'
import { useImageUpload } from '@/composables/upload/useImageUpload'

import RestaurantPreview from './RestaurantPreview.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

import type { 
  CreateRestaurantForm,
  UpdateRestaurantForm, 
  RestaurantOwnerDetail
} from '@/types/restaurant'



const props = withDefaults(defineProps<{
  title: string
  submitText: string
  initialData?: RestaurantOwnerDetail
  progressMap?: Record<string, number>
  getFileKey: (file: File) => string
  loading: boolean
}>(), {
  progressMap: () => ({}),
  loading: false
})

const emit = defineEmits<{
  (e: 'submit', payload: CreateRestaurantForm): void
  (e: 'edit', payload: UpdateRestaurantForm): void
}>()

const { clearFieldError, fieldErrors } = useFormContext()

const ownerRestaurantsStore = useOwnerRestaurantsStore()
const { isSubmitting, isUpdating } = storeToRefs(ownerRestaurantsStore)

const spinnerText = "儲存中..."
const spinnerSize = 40

const {
  form,
  touched,

  isEditing,
  isFormValid,
  isFormChanged,

  nameError,
  nameEnError,
  categoryError,
  locationError,
  phoneError,
  descriptionError,

  buildCreatePayload,
  buildUpdatePayload
} = useRestaurantForm(props.initialData, fieldErrors)

// 圖片
const { 
  images: coverImages,
  deletedImageUuids: coverDeleted,
  isFull: isCoverFull,
  imageCountText: coverCountText,
  isImageChanged: isCoverChanged,

  onFileChange: onCoverChange,
  removeImage: removeCoverImage,
  getNewFiles: getNewCoverFiles
} = useImageUpload(
  props.initialData?.images.cover,
  { maxImages: 1 }
)

const {
  images: galleryImages,
  deletedImageUuids: galleryDeleted,
  isFull: isGalleryFull,
  imageCountText: galleryCountText,
  isImageChanged: isGalleryChanged,

  onFileChange: onGalleryChange,
  removeImage: removeGalleryImage,
  getNewFiles: getNewGalleryFiles
} = useImageUpload(
  props.initialData?.images.gallery,
  { maxImages: 10 }
)

const {
  images: menuImages,
  deletedImageUuids: menuDeleted,
  isFull: isMenuFull,
  imageCountText: menuCountText,
  isImageChanged: isMenuChanged,

  onFileChange: onMenuChange,
  removeImage: removeMenuImage,
  getNewFiles: getNewMenuFiles
} = useImageUpload(
  props.initialData?.images.menu,
  { maxImages: 10 }
)


// 預覽
const { 
  previewMode, 
  previewRestaurant 
} = useRestaurantPreview(
  form,
  coverImages.value,
  galleryImages.value,
  menuImages.value
)

// 圖片必填驗證
const hasCoverImage = computed(
  () => coverImages.value.length === 1
)
const hasMenuImage = computed(
  () => menuImages.value.length >= 1
)

const isImageValid = computed(() =>
  hasCoverImage.value &&      //  封面必須有
  hasMenuImage.value          //  菜單至少一張
)

// 編輯模式，圖片是否有更新
const isImageChanged = computed(() => 
  isCoverChanged.value || 
  isGalleryChanged.value || 
  isMenuChanged.value
)

// 編輯模式，表單內容跟圖片市府有更新
const isDirty = computed(() => 
  isImageChanged.value ||
  isFormChanged.value
)

const { bindFields } = useBindFields(form, {
  touched,
  onChange(field) {
    clearFieldError(field)
  }
})

// 監聽文字欄位，使用者修改就清掉對應的後端錯誤
bindFields([
  'name',
  'nameEn',
  'category',
  'location',
  'phone',
  'description',
])

function submit() {
  if(props.loading) return
  if(!isFormValid.value || !isImageValid.value) return
  if(isEditing.value && !isDirty.value) return
  
  const basePayload = isEditing.value
    ? buildUpdatePayload()
    : buildCreatePayload()

  const payloadBase = {
    ...basePayload,
    coverImage: getNewCoverFiles(),
    galleryImages: getNewGalleryFiles(),
    menuImages: getNewMenuFiles(),
  }

  if (isEditing.value) {
    const payload = {
      ...payloadBase,
      deletedImages: [
        ...coverDeleted.value,
        ...galleryDeleted.value,
        ...menuDeleted.value
      ]
    } 
    
    emit('edit', payload)
  }else {
    emit('submit', payloadBase)
  }
} 

</script>

<style scoped>
#create-panel {
  max-width: 600px;
  margin: auto;
  padding: 25px;
  background-color: #FFCBB3;
  border: 1px solid #FF9D6F;
  border-radius: 25px;
  box-shadow: 10px 10px 10px -6px #9b4b4b;
}

.form-wrapper {
  position: relative;
  min-height: 300px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  pointer-events: all;
  z-index: 10;
}

.form-label {
  font-weight: 600;
}

textarea.form-control {
  resize: vertical;
}

.preview-wrapper {
  position: relative;
}

.preview {
  margin-top: 10px;
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #FF9D6F;
}

.preview-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.btn-save {
  background-color: #9b4b4b;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 15px;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save:hover:not(:disabled) {
  background-color: #842B00;
}

.btn-cancel {
  display: inline-block;
  background-color: #ccc;
  color: #000;
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 15px;
  text-align: center;
}

.btn-cancel:hover {
  background-color: #aaa;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: -6px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

/* RouterLink disabled */
.btn-cancel.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

input[type="file"]:disabled{
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
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
