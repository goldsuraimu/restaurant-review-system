export type ReviewSort =
  | 'latest'
  | 'oldest'
  | 'rating_desc' 
  | 'rating_asc'

export interface ReviewCursorQuery {
  cursor?: string
  limit?: number
  sort?: ReviewSort
}

export interface ReviewCursorResponse<T> {
  results: T[]
  nextCursor: string | null
  hasNext: boolean
}