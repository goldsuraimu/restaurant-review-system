import { watch } from 'vue'

export function useBindFields<F extends Record<string, any>>(
  form: F,
  options?: {
    touched?: Partial<Record<keyof F, boolean>>
    onChange?: (field: keyof F, value: any) => void
  }
) {
  function bindField<K extends keyof F>(field: K) {
    watch(
      () => form[field],
      (value) => {
        if (options?.touched) {
          options.touched[field] = true
        }

        options?.onChange?.(field, value)
      }
    )
  }

  function bindFields(fields: (keyof F)[]) {
    fields.forEach(bindField)
  }

  return {
    bindField,
    bindFields,
  }
}