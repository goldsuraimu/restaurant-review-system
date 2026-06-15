export enum RestaurantImageType {
  COVER = 'cover',
  GALLERY = 'gallery',
  MENU = 'menu'
}

export function isRestaurantImageType(value: string): value is RestaurantImageType {
  return Object.values(RestaurantImageType).includes(value as RestaurantImageType)
}