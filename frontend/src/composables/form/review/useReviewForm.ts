import { reactive, computed } from 'vue'
import { getFieldError } from '@/utils/form'

import type { Ref } from 'vue'
import type {
  RestaurantReview,
  ReviewFormState
} from '@/types/review'

export function useReviewForm(
  currentReview?: RestaurantReview | null,
  externalFieldErrors?: Record<string, string>,
  externalImageChanged?: Ref<boolean>
) {
  const form = reactive<ReviewFormState>({
    rating: currentReview?.rating ?? 0,
    content: currentReview?.content ?? ''
  })

  const fieldErrors = externalFieldErrors ?? reactive<Record<string, string>>({})

  const isEditing = computed(() => !!currentReview)

  // 驗證
  const contentPattern = /^[\s\S]{0,500}$/

  const isValidRating = computed(() => form.rating >= 1 && form.rating <= 5)

  const isValidContent = computed(() => form.content === '' || contentPattern.test(form.content))

  const isFormValid = computed(() =>
    isValidRating.value &&
    isValidContent.value
  )

  // touched 狀態
  const touched = reactive({
    rating: false,
    content: false,
  })

  const ratingError = computed(() => {
    if (!touched.rating) return '' 
    return getFieldError(
      'rating',
      isValidRating.value,
      '請給予評分，評分請選擇 1~5 星。',
      fieldErrors
    )
  })
  const contentError = computed(() => {
    if (!touched.content) return '' 
    return getFieldError(
      'content',
      isValidContent.value,
      '內容請勿超過 500 字。',
      fieldErrors
    )
  })
  

  const isChanged = computed(() => {
    if (!currentReview) return true

    const currentContent = currentReview.content?.trim() ?? ''
    const formContent = form.content.trim()

    return (
      form.rating !== currentReview.rating ||
      formContent !== currentContent ||
      (externalImageChanged?.value ?? false)
    )
  })

  function reset() {
    form.rating = 0
    form.content = ''
  }

  const buttonText = computed(() => {
    if (isEditing.value) return '儲存修改'
    return '送出評論'
  })

  return {
    form,
    touched,
    isValidRating,
    isEditing,
    isFormValid,
    isValidContent,

    ratingError,
    contentError,

    isChanged,
    reset,
    buttonText
  }
}
