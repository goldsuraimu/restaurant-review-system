import type { ListMeta } from './pagination';

export interface ApiResponse<T> {
  result: T;
  message?: string;
}

// Page-based 分頁
export interface ApiPageResponse<T> {
  results: T[]
  meta: ListMeta
}

export type ApiPageWith<T, M extends object = {}> = {
  results: T[]
  meta: ListMeta
} & M

// Cursor-based 分頁
export interface ApiCursorResponse<T> {
  results: T[]
  nextCursor: string | null
  hasNext: boolean
}