// 共用 list query
export interface BaseListQuery {
  page?: number
  limit?: number
  sort?: string
  order?: SortOrder
}

// 共用排序方向
export type SortOrder = 'asc' | 'desc'