import { describe, it, expect } from "vitest"
import { readPagination, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, paginated } from "@/lib/pagination"

const url = (q: string) => new URL(`http://localhost/x?${q}`)

describe("readPagination", () => {
  it("defaults when nothing is supplied", () => {
    expect(readPagination(url(""))).toEqual({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      skip: 0,
      take: DEFAULT_PAGE_SIZE,
    })
  })

  it("computes skip from page and limit", () => {
    expect(readPagination(url("page=3&limit=10"))).toEqual({ page: 3, limit: 10, skip: 20, take: 10 })
  })

  it("caps the limit so a client cannot request the whole table", () => {
    expect(readPagination(url("limit=100000")).limit).toBe(MAX_PAGE_SIZE)
  })

  it("falls back on a non-numeric limit", () => {
    expect(readPagination(url("limit=abc")).limit).toBe(DEFAULT_PAGE_SIZE)
  })

  it("falls back on a non-numeric page", () => {
    expect(readPagination(url("page=abc")).page).toBe(1)
  })

  it("rejects zero and negative values", () => {
    expect(readPagination(url("limit=0")).limit).toBe(DEFAULT_PAGE_SIZE)
    expect(readPagination(url("limit=-5")).limit).toBe(DEFAULT_PAGE_SIZE)
    expect(readPagination(url("page=0")).page).toBe(1)
    expect(readPagination(url("page=-2")).page).toBe(1)
  })

  it("floors fractional values", () => {
    expect(readPagination(url("limit=10.9")).limit).toBe(10)
    expect(readPagination(url("page=2.7")).page).toBe(2)
  })

  it("tolerates a missing url", () => {
    expect(readPagination(null).page).toBe(1)
  })
})

describe("paginated", () => {
  it("returns the page envelope", async () => {
    const res = paginated([{ id: 1 }], 40, 1, 20)
    const body = await res.json()
    expect(body.items).toEqual([{ id: 1 }])
    expect(body.pagination).toEqual({ page: 1, limit: 20, total: 40, totalPages: 2, hasMore: true })
  })

  it("reports no more pages on the last page", async () => {
    const body = await paginated([], 40, 2, 20).json()
    expect(body.pagination.hasMore).toBe(false)
  })

  it("handles an empty result set", async () => {
    const body = await paginated([], 0, 1, 20).json()
    expect(body.items).toEqual([])
    expect(body.pagination.totalPages).toBe(0)
    expect(body.pagination.hasMore).toBe(false)
  })
})