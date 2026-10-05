import { NextResponse } from "next/server"

export const MAX_PAGE_SIZE = 50
export const DEFAULT_PAGE_SIZE = 20

export function readPagination(url: URL | null) {
  const rawLimit = Number(url?.searchParams.get("limit") ?? DEFAULT_PAGE_SIZE)
  const rawPage = Number(url?.searchParams.get("page") ?? 1)

  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1

  return { page, limit, skip: (page - 1) * limit, take: limit }
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      hasMore: page * limit < total,
    },
  })
}