export const ADMIN_RESTAURANT_SORT_FIELDS = [
  'submittedAt',
] as const

export type AdminRestaurantSortField =
  typeof ADMIN_RESTAURANT_SORT_FIELDS[number]

export function isAdminRestaurantSortField(v: unknown): v is AdminRestaurantSortField {
  return typeof v === 'string' &&
    (ADMIN_RESTAURANT_SORT_FIELDS as readonly string[]).includes(v as AdminRestaurantSortField)
}

