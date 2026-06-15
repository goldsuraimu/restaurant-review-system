export interface ListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginationItem {
  key: string;
  page?: number;
  label: string;
  isEllipsis: boolean;
}
