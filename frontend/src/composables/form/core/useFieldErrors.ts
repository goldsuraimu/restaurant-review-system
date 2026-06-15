import { reactive, provide, inject } from 'vue'

type FormContext = {
  fieldErrors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  clearFieldError: (field: string) => void
  clearAllFieldErrors: () => void
}

const FORM_KEY = Symbol('fieldErrors')

export function useFormProvider() {
  const fieldErrors = reactive<Record<string, string>>({})

  function setErrors(errors: Record<string, string>) {
    Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    Object.assign(fieldErrors, errors)
  }

  // 清空指定欄位錯誤訊息
  function clearFieldError(field: string) {
    delete fieldErrors[field]
  }
  
  // 清空所有欄位錯誤訊息
  function clearAllFieldErrors() {
    Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  }

  const ctx: FormContext = {
    fieldErrors,
    setErrors,
    clearFieldError,
    clearAllFieldErrors
  }

  provide(FORM_KEY, ctx)

  return ctx
}

export function useFormContext() {
  const ctx = inject<FormContext>(FORM_KEY)

  if (!ctx) {
    throw new Error('useFormContext 必須在 useFormProvider 內使用')
  }

  return ctx
}