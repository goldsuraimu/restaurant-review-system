// 餐廳列表允許的排序欄位
export const RESTAURANT_SORT_FIELDS = [
  'createdAt',
  'rating',
  'ratingCount',
  'reviewCount',
  'relevance',
] as const

export type RestaurantSortField =
  typeof RESTAURANT_SORT_FIELDS[number]

