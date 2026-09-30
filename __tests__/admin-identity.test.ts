import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock("@/lib/auth", () => ({
  getSessionEmail: vi.fn(),
}))

const { prisma } = await import("@/lib/prisma")
const { isAdmin, getAdminUserIds, getAdminsExcept, getAdminEmails } = await import("@/lib/api-auth")

describe("database-driven admin identity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("treats a user with the admin role as an admin", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "admin" } as any)
    expect(await isAdmin("user_a")).toBe(true)
  })

  it("rejects users with other roles", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "talent" } as any)
    expect(await isAdmin("user_a")).toBe(false)
  })

  it("rejects when no user record matches the session id", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as any)
    expect(await isAdmin("user_a")).toBe(false)
  })

  it("rejects an absent session without querying the database", async () => {
    expect(await isAdmin(null)).toBe(false)
    expect(await isAdmin(undefined)).toBe(false)
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })

  it("does not read ADMIN_USER_IDS from the environment", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "talent" } as any)
    await isAdmin("user_a")
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: "user_a" } })
    )
  })

  it("returns database ids of all admins", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: "cuid_1" }, { id: "cuid_2" }] as any)
    expect(await getAdminUserIds()).toEqual(["cuid_1", "cuid_2"])
  })

  it("excludes the project owner from admin fan-out", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any)
    await getAdminsExcept("cuid_owner")
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { role: "admin", id: { not: "cuid_owner" } } })
    )
  })

  it("omits the owner filter when there is no owner", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any)
    await getAdminsExcept(null)
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { role: "admin" } })
    )
  })

  it("returns admin emails for recipient fan-out", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ email: "a@x.com" }] as any)
    expect(await getAdminEmails()).toEqual(["a@x.com"])
  })
})
