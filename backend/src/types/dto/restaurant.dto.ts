export interface CreateRestaurantDto {
  name: string
  nameEn?: string
  category: string
  location: string
  phone?: string
  description?: string
}

export interface UpdateRestaurantDto {
  name: string
  nameEn?: string | null
  category: string
  location: string
  phone?: string | null
  description?: string | null
}
