export interface RestaurantFormFields {
  name: string
  nameEn: string
  category: string
  description: string
  phone: string
  location: string
}


export interface CreateRestaurantForm {
  name: string
  nameEn?: string | null
  category: string
  description?: string | null
  phone?: string | null
  location: string


  coverImage: File[]
  galleryImages: File[]
  menuImages: File[]
}

export interface UpdateRestaurantForm extends CreateRestaurantForm {
  deletedImages: string[]
}