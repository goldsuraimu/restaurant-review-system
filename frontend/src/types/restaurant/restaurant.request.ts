import type { UploadedImage } from '../common/uploaded-image'

interface BaseRestaurantPayload {
  name: string
  nameEn?: string | null
  category: string
  description?: string | null
  phone?: string | null
  location: string

  coverImage: UploadedImage[]
  galleryImages: UploadedImage[]
  menuImages: UploadedImage[]
}

export interface CreateRestaurantRequest extends BaseRestaurantPayload {
  restaurantUuid: string
}

export interface UpdateRestaurantRequest extends BaseRestaurantPayload {
  deletedImages: string[]
}