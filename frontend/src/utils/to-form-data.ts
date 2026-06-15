export function toFormData(payload: Record<string, any>): FormData {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    // Array 處理（支援 object）
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item instanceof File && item.size > 0) {
          formData.append(`${key}`, item)
        }
        // object → JSON
        else if (typeof item === 'object') {
          formData.append(`${key}`, JSON.stringify(item))
        }
        // fallback（原本行為）
        else {
          formData.append(`${key}`, String(item))
        }
      })
      return
    }

    // File 處理
    if (value instanceof File) {
      if (value.size === 0) return
      formData.append(key, value)
      return
    }

    // object → JSON（單一物件）
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
      return
    }

    // fallback
    formData.append(key, String(value))
  })

  return formData
}