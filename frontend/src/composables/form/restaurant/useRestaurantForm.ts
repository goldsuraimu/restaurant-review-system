import { reactive, computed } from 'vue'

import { getFieldError } from '@/utils/form'
import { normalizeMultilineText } from '@/utils/text'

import type { 
  RestaurantFormFields, 
  RestaurantOwnerDetail
} from '@/types/restaurant'

const namePattern = /^.{2,50}$/
const nameEnPattern = /^[A-Za-z\s.'&-]{2,50}$/
const categoryPattern = /^.{1,30}$/
const locationPattern = /^.{5,100}$/
const phonePattern = /^0[2-9]\d{4,8}(?:(?:\s*|#|[eE][xX][tT])\d{1,5})?$/
const descriptionPattern = /^[\s\S]{0,500}$/

export function useRestaurantForm(
  initialData?: RestaurantOwnerDetail,
  externalFieldErrors?: Record<string, string>
) {
  const isEditing = computed(() => !!initialData)

  const fieldErrors = externalFieldErrors ?? reactive<Record<string, string>>({})

  const form = reactive<RestaurantFormFields>({
    name: initialData?.name ?? '',
    nameEn: initialData?.nameEn ?? '',
    category: initialData?.category ?? '',
    location: initialData?.location ?? '',
    phone: initialData?.phone ?? '',
    description: initialData?.description ?? '',
  })
  
  // touched 狀態
  const touched = reactive({
    name: false,
    nameEn: false,
    category: false,
    location: false,
    phone: false,
    description: false,
    coverImage: false,
    menuImages: false,
  })

  // 驗證
  const isValidName = computed(() =>
    namePattern.test(form.name.trim())
  )

  const isValidNameEn = computed(() =>
    form.nameEn.trim() === '' || nameEnPattern.test(form.nameEn.trim())
  )

  const isValidCategory = computed(() =>
    categoryPattern.test(form.category.trim())
  )

  const isValidLocation = computed(() =>
    locationPattern.test(form.location.trim())
  )

  const isValidPhone = computed(() =>
    form.phone.trim() === '' || phonePattern.test(form.phone.trim())
  )

  const isValidDescription = computed(() =>
    form.description.trim() === '' || descriptionPattern.test(form.description.trim())
  )

  const isFormValid = computed(() =>
    isValidName.value &&
    isValidNameEn.value&&
    isValidCategory.value &&
    isValidLocation.value &&
    isValidPhone.value &&
    isValidDescription.value 
  )
  
  const nameError = computed(() =>{
    if (!touched.name) return ''
    return getFieldError('name', isValidName.value, '餐廳名稱格式錯誤（僅限 2~50 個中英文或空格）。', fieldErrors)
    }
  )
  const nameEnError = computed(() => {
    if (!touched.nameEn) return ''
    return getFieldError('nameEn', isValidNameEn.value, '英文名稱格式錯誤（僅限 2~50 個英文或空格）。', fieldErrors)
    }  
  )
  const categoryError = computed(() =>{
    if (!touched.category) return '' 
    return getFieldError('category', isValidCategory.value, '請輸入餐廳類別(1~30 字）。', fieldErrors)
    }
  )
  const locationError = computed(() =>{
    if (!touched.location) return ''
    return getFieldError('location', isValidLocation.value, '請輸入地址需( 5~100 字）。', fieldErrors)
    }
  )
  const phoneError = computed(() => {
    if (!touched.phone) return '' 
    return getFieldError('phone', isValidPhone.value, '請輸入正確的電話號碼(如:02-XXXX-XXXX)或包含分機（如：#123)。', fieldErrors)
    }  
  )
  const descriptionError = computed(() => {
    if (!touched.description) return ''
    return getFieldError('description', isValidDescription.value, '介紹內容請勿超過 500 字。', fieldErrors)
    } 
  )
 
 
  const trim = (v: string | null | undefined) => v?.trim() ?? ''

  // 判斷欄位是否有修改
  const isFieldChanged = (field: keyof RestaurantFormFields) => {
    const current = trim(form[field])
    const initial = trim(initialData?.[field])
    return current !== initial
  }
  
  // 判斷表單是否有修改
  const isFormChanged = computed(() => {
    if (!initialData) return false

    const fields: (keyof typeof form)[] = ['name', 'nameEn', 'category', 'location', 'phone', 'description']

    return fields.some(isFieldChanged)
  })

  // 建立新增資料的 payload
  function buildCreatePayload() {
    return {
      name: trim(form.name),
      nameEn: trim(form.nameEn) === '' ? undefined : trim(form.nameEn),
      category: trim(form.category),
      location: trim(form.location),
      phone: trim(form.phone) === '' ? undefined : trim(form.phone),
      description:
        normalizeMultilineText(form.description) === ''
          ? undefined
          : normalizeMultilineText(form.description),
    }
  }

  // 建立更新資料的 payload (只包含修改過的欄位，且空字串會轉成 null 以表示要清除該欄位)
  function buildUpdatePayload() {
    const getFieldPayload = (field: keyof RestaurantFormFields) => {
      if (!isFieldChanged(field)) return undefined

      const current =
        field === 'description'
          ? normalizeMultilineText(form.description)
          : trim(form[field])
      return current === '' ? null : current
    }

    return {
      name: trim(form.name), 
      nameEn: getFieldPayload('nameEn'),
      category: trim(form.category),
      location: trim(form.location),
      phone: getFieldPayload('phone'),
      description: getFieldPayload('description'),
    }
  }


  return {
    form,
    touched,

    fieldErrors,
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
  }
}
