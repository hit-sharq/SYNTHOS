import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}))

vi.mock("@/lib/auth", () => ({
  getSessionEmail: vi.fn(),
}))

const { auth } = await import("@clerk/nextjs/server")
const { prisma } = await import("@/lib/prisma")
const { getSessionEmail } = await import("@/lib/auth")
const { GET } = await import("../app/api/auth/role/route")

const ORIGINAL = process.env.ADMIN_USER_IDS

describe("GET /api/auth/role", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_USER_IDS = "user_admin"
  })

  afterEach(() => {
    process.env.ADMIN_USER_IDS = ORIGINAL
  })

  it("returns a null role when signed out", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ role: null })
  })

  it("reports admin for an env-listed Clerk id even with no database role", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_admin" } as any)
    vi.mocked(getSessionEmail).mockResolvedValue(null)

    const body = await (await GET()).json()
    expect(body).toEqual({ role: "admin", isAdmin: true, companyId: null })
  })

  it("does not mark non-admins as admin", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_other" } as any)
    vi.mocked(getSessionEmail).mockResolvedValue("other@x.com")
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "talent", companyId: null } as any)

    const body = await (await GET()).json()
    expect(body.role).toBe("talent")
    expect(body.isAdmin).toBe(false)
  })

  it("ignores a database role of admin, since admin is env-only", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_other" } as any)
    vi.mocked(getSessionEmail).mockResolvedValue("other@x.com")
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "admin", companyId: null } as any)

    const body = await (await GET()).json()
    expect(body.isAdmin).toBe(false)
  })
})
