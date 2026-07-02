<template>
  <form class="reply-form" @submit.prevent="handleSubmit">
   <label for="reply-content" class="visually-hidden">回覆內容</label>
    <textarea 
      id="reply-content"
      v-model="form.content" 
      placeholder="輸入回覆..." 
      :disabled="isReplying"
      :class="{ 'is-invalid': contentError }"
    ></textarea>

    <!-- 錯誤訊息區 -->
    <div v-if="contentError || fieldErrors.general" class="text-danger mb-2 text-center">
      {{ contentError || fieldErrors.general }}
    </div>

    <div class="form-actions">
      <button 
        type="submit"
        class="submit-btn"  
        :disabled="isReplying || !isValidContent || (isEditing && isUnchanged)"
      > 
        {{ isEditing ? '儲存修改' : '回覆' }}
      </button>

      <button class="cancel-btn" type="button" @click="handleCancel">
        取消
      </button>
    </div>
 </form>
</template>


<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

import { normalizeMultilineText } from '@/utils/text'
import { getFieldError } from '@/utils/form'

import { useFormContext } from '@/composables/form/core/useFieldErrors'
import { useBindFields } from '@/composables/form/core/useBindField'

import type {
  ReviewReplyRequest
} from '@/types/review/review.request'

const props = defineProps<{
  isReplying?: boolean
  initialContent?: string
}>()

const emit = defineEmits<{
  (e: 'submit', payload: ReviewReplyRequest): void
  (e: 'edit', payload: ReviewReplyRequest): void
  (e: 'cancel'): void
}>()

const { clearFieldError, fieldErrors } = useFormContext()

const form = reactive({
  content: props.initialContent ?? '',
})

const isEditing = ref(!!props.initialContent)

// 驗證
const MAX_LENGTH = 500

// touched 狀態
const touched = reactive({
  content: false,
})

const isValidContent = computed(() => {
  const normalized = normalizeMultilineText(form.content)
  const len = normalized.length
  return len > 0 && len <= MAX_LENGTH
})

const contentError = computed(() => {
  if (!touched.content) return ''
  return getFieldError('content', isValidContent.value, '回覆內容不可為空，並且不可超過 500 字。', fieldErrors)
})

const isUnchanged = computed(() =>
  normalizeMultilineText(form.content) ===
  normalizeMultilineText(props.initialContent)
)

// 如果外部 props.initialContent 改變，也更新 content
watch(() => props.initialContent, (newVal) => {
  form.content = newVal ?? ''
  isEditing.value = !!newVal
})

const { bindFields } = useBindFields(form, {
  touched,
  onChange(field) {
    clearFieldError(field)
  }
})

// 監聽文字欄位，使用者修改就清掉對應的後端錯誤
bindFields([
  'content',
])

function handleSubmit() {
  // 前端驗證不通過就直接返回
  if (!isValidContent.value) return

  const normalized = normalizeMultilineText(form.content)

  // 如果是編輯且沒有變更
  if (
    isEditing.value && 
    normalized === normalizeMultilineText(props.initialContent)
  ) {
    emit('cancel')
    return
  }

  if (isEditing.value) {
    emit('edit', { content: normalized })
  } else {
    emit('submit', { content: normalized })
  }
}

function handleCancel() {
  if (isEditing.value) {
    form.content = props.initialContent ?? ''
  }

  emit('cancel')
}
</script>


<style scoped>
.reply-form {
  margin-top: 10px;
  background-color: #FFEDE1;
  padding: 12px 15px;
  border-radius: 12px;
  border: 1px solid #FF9D6F;
}

textarea {
  width: 100%;
  min-height: 70px;
  border-radius: 10px;
  border: 1px solid #FFBFA0;
  padding: 8px;
  font-size: 0.95rem;
  resize: vertical;
  color: #5A2B00;
  background-color: #FFF8F0;
}

textarea:disabled {
  opacity: 0.6;
}

.form-actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;
}

.submit-btn {
  background-color: #FF7A45;
  border: none;
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #FF5C1A;
}

.cancel-btn {
  background-color: #FFD9C0;
  border: 1px solid #FF9D6F;
  color: #842B00;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background-color: #FFCBB3;
}
</style>