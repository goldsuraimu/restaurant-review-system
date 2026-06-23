import { ref, computed } from 'vue'
import type { ImageUI } from '@/types'
import type { RestaurantFormFields } from '@/types/restaurant'

export function useRestaurantPreview(
  form: RestaurantFormFields,
  coverImages: ImageUI[],
  galleryImages: ImageUI[],
  menuImages: ImageUI[]
) {
  const previewMode = ref(false)

  const previewRestaurant = computed(() => {
    const trim = (v: string) => v.trim()

    const displayGallery = [
      ...coverImages.map((img, i) => ({
        uuid: img.type === 'existing' ? img.uuid : `cover-${i}`,
        publicId: img.type === 'existing' ? img.publicId : undefined,
        url: img.type === 'existing' ? undefined : img.previewUrl,
        sortOrder: 0,
      })),
      ...galleryImages.map((img, i) => ({
        uuid: img.type === 'existing' ? img.uuid : `gallery-${i}`,
        publicId: img.type === 'existing' ? img.publicId : undefined,
        url: img.type === 'existing' ? undefined : img.previewUrl,
        sortOrder: i + 1,
      })),
    ]

    return {
      name: trim(form.name),
      nameEn: trim(form.nameEn),
      category: trim(form.category),
      location: trim(form.location),
      phone: trim(form.phone),
      description: trim(form.description),
      rating: null,
      galleryImages: displayGallery,
      menuImages: menuImages.map((img, i) => ({
        uuid: img.type === 'existing' ? img.uuid : `menu-${i}`,
        publicId: img.type === 'existing' ? img.publicId : undefined,
        url: img.type === 'existing' ? undefined : img.previewUrl,
        sortOrder: i
      })),
    }
  })

  return {
    previewMode,
    previewRestaurant
  }
}