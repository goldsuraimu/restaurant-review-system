import { watch, onUnmounted } from 'vue'

export function useBindFields<F extends Record<string, any>>(
  form: F,
  options?: {
    touched?: Partial<Record<keyof F, boolean>>
    onChange?: (field: keyof F, value: any) => void
  }
) {
  const stops: (() => void)[] = []

  function bindField<K extends keyof F>(field: K) {
    const stop = watch(
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

  onUnmounted(() => {
    stops.forEach(stop => stop())
  })

  return {
    bindField,
    bindFields,
  }
}