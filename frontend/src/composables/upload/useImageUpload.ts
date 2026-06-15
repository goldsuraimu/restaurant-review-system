import { ref, computed } from 'vue'
import type { BaseImage, ImageUI } from '@/types'

interface UseImageUploadOptions {
  maxImages?: number
}

export function useImageUpload(
  initialImages: BaseImage[] = [],
  options?: UseImageUploadOptions
) {
  const maxImages = options?.maxImages ?? 6

  const images = ref<ImageUI[]>(
    initialImages.map(img => ({
      type: 'existing',
      uuid: img.uuid,
      url: img.url
    }))
  )

  const deletedImageUuids = ref<string[]>([])

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files || [])
    const remaining = maxImages - images.value.length

    if (remaining <= 0) {
      input.value = ''
      return
    }

    const accepted = files.slice(0, remaining)

    accepted.forEach(file => {
      images.value.push({
        type: 'new',
        file,
        previewUrl: URL.createObjectURL(file)
      })
    })
      ; (e.target as HTMLInputElement).value = ''
  }

  function removeImage(index: number) {
    const img = images.value[index]

    if (!img) return

    if (img.type === 'existing') {
      deletedImageUuids.value.push(img.uuid)
    }

    images.value.splice(index, 1)
  }

  function resetImages(newImages: BaseImage[] = []) {
    images.value = newImages.map(img => ({
      type: 'existing',
      uuid: img.uuid,
      url: img.url
    }))

    deletedImageUuids.value = []
  }

  function getNewFiles(): File[] {
    return images.value
      .filter(img => img.type === 'new')
      .map(img => img.file)
  }

  // 圖片數量是否達到上限
  const isFull = computed(() => images.value.length >= maxImages)

  // 提示選擇數量文字
  const imageCountText = computed(
    () => `已選擇 ${images.value.length} / ${maxImages} 張圖片`
  )

  // 圖片是否變更
  const isImageChanged = computed(() => {
    return (
      images.value.some(img => img.type === 'new') ||
      deletedImageUuids.value.length > 0
    )
  })

  return {
    images,
    deletedImageUuids,
    isFull,
    imageCountText,
    isImageChanged,

    onFileChange,
    removeImage,
    resetImages,
    getNewFiles
  }
}
