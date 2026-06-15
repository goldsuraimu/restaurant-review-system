function toPositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined

  const num = Number(value)
  if (!Number.isInteger(num) || num <= 0) return undefined

  return num
}

export function parsePaginationQuery(query: any) {
  const page = toPositiveInt(query.page)
  const limit = toPositiveInt(query.limit)

  const order =
    query.order === 'asc' || query.order === 'desc'
      ? query.order
      : undefined

  return { page, limit, order }
}