import { describe, it, expect, vi } from "vitest"
import { logAuditAction } from "@/app/actions/audit"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "1" }),
    },
  },
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_123" }),
}))

describe("Audit Logging", () => {
  it("should log an audit event", async () => {
    const result = await logAuditAction({
      action: "test.action",
      targetType: "Test",
      targetName: "Test Item",
    })
    expect(result).toBeUndefined()
  })
})
