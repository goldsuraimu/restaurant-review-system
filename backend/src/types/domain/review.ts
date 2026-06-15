// 評論列表允許的排序欄位
export const REVIEW_SORT_FIELDS = [
  'latest', 
  'oldest', 
  'rating_desc', 
  'rating_asc'
] as const

export type ReviewSortField =
  typeof REVIEW_SORT_FIELDS[number]


// 業主查看評論列表允許的排序欄位
export const OWNER_REVIEW_SORT_FIELDS = [
  'createdAt',
  'rating'
] as const

export type OwnerReviewSortField =
  typeof OWNER_REVIEW_SORT_FIELDS[number]


export type OwnerReviewScope =
  | { type: 'ALL' }
  | { type: 'RESTAURANT'; restaurantUuid: string }