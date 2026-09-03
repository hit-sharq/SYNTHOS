import { describe, it, expect } from "vitest"
import { requireAuth, requireAdmin, isProjectAccessible } from "@/lib/api-auth"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    client: {
      findFirst: vi.fn(),
    },
  },
}))

describe("API Auth Helpers", () => {
  it("requireAuth should reject when no user", async () => {
    const { auth } = await import("@clerk/nextjs/server")
    vi.mocked(auth).mockResolvedValue({ userId: null })
    const result = await requireAuth()
    expect(result.error).toBeDefined()
    expect(result.userId).toBeNull()
  })

  it("requireAdmin should reject when user is not admin", async () => {
    const { auth } = await import("@clerk/nextjs/server")
    vi.mocked(auth).mockResolvedValue({ userId: "user_123" })
    const result = await requireAdmin()
    expect(result.error).toBeDefined()
    expect(result.userId).toBeNull()
  })
})
