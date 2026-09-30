import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    jobPosting: { findUnique: vi.fn(), update: vi.fn() },
    jobReport: { findFirst: vi.fn(), create: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}))

vi.mock("@/lib/auth", () => ({
  getSessionUser: vi.fn(),
}))

const { prisma } = await import("@/lib/prisma")
const { getSessionUser } = await import("@/lib/auth")
const { POST } = await import("../app/api/jobs/[id]/report/route")

function req(body: unknown) {
  return { json: async () => body } as unknown as Request
}

const params = { id: "job_1" }

describe("POST /api/jobs/[id]/report", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSessionUser).mockResolvedValue(null)
    vi.mocked(prisma.jobPosting.findUnique).mockResolvedValue({ id: "job_1", status: "approved" } as any)
    vi.mocked(prisma.jobReport.count).mockResolvedValue(1)
  })

  it("rejects an unknown reason", async () => {
    const res = await POST(req({ reason: "because" }), { params })
    expect(res.status).toBe(400)
    expect(prisma.jobReport.create).not.toHaveBeenCalled()
  })

  it("rejects a missing reason", async () => {
    const res = await POST(req({}), { params })
    expect(res.status).toBe(400)
  })

  it("returns 404 for an unknown job", async () => {
    vi.mocked(prisma.jobPosting.findUnique).mockResolvedValue(null as any)
    const res = await POST(req({ reason: "spam" }), { params })
    expect(res.status).toBe(404)
  })

  it("records a report and leaves the job status alone", async () => {
    vi.mocked(prisma.jobReport.findFirst).mockResolvedValue(null as any)
    vi.mocked(prisma.jobReport.create).mockResolvedValue({ id: "rep_1" } as any)

    const res = await POST(req({ reason: "spam", details: "junk" }), { params })
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ success: true, reportId: "rep_1" })
    expect(prisma.jobPosting.update).not.toHaveBeenCalled()
  })

  it("never marks the job rejected", async () => {
    vi.mocked(prisma.jobReport.findFirst).mockResolvedValue(null as any)
    vi.mocked(prisma.jobReport.create).mockResolvedValue({ id: "rep_1" } as any)

    await POST(req({ reason: "misleading" }), { params })
    for (const call of vi.mocked(prisma.jobPosting.update).mock.calls) {
      expect(JSON.stringify(call[0])).not.toContain("rejected")
      expect(JSON.stringify(call[0])).not.toContain("rejectedAt")
    }
  })

  it("blocks a duplicate open report from the same person", async () => {
    vi.mocked(prisma.jobReport.findFirst).mockResolvedValue({ id: "rep_1" } as any)
    const res = await POST(req({ reason: "spam" }), { params })
    expect(res.status).toBe(409)
    expect(prisma.jobReport.create).not.toHaveBeenCalled()
  })

  it("flags a listing for review once reports accumulate", async () => {
    vi.mocked(prisma.jobReport.findFirst).mockResolvedValue(null as any)
    vi.mocked(prisma.jobReport.create).mockResolvedValue({ id: "rep_1" } as any)
    vi.mocked(prisma.jobReport.count).mockResolvedValue(3)

    await POST(req({ reason: "spam" }), { params })
    expect(prisma.jobPosting.update).toHaveBeenCalledWith({
      where: { id: "job_1" },
      data: { status: "pending" },
    })
  })

  it("does not downgrade a job that is already pending", async () => {
    vi.mocked(prisma.jobPosting.findUnique).mockResolvedValue({ id: "job_1", status: "pending" } as any)
    vi.mocked(prisma.jobReport.findFirst).mockResolvedValue(null as any)
    vi.mocked(prisma.jobReport.create).mockResolvedValue({ id: "rep_1" } as any)
    vi.mocked(prisma.jobReport.count).mockResolvedValue(5)

    await POST(req({ reason: "spam" }), { params })
    expect(prisma.jobPosting.update).not.toHaveBeenCalled()
  })

  it("attributes the report when signed in", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: "user_1", email: "a@x.com" } as any)
    vi.mocked(prisma.jobReport.findFirst).mockResolvedValue(null as any)
    vi.mocked(prisma.jobReport.create).mockResolvedValue({ id: "rep_1" } as any)

    await POST(req({ reason: "duplicate" }), { params })
    expect(prisma.jobReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ reportedById: "user_1", reportedByEmail: "a@x.com" }),
    })
  })

  it("accepts an anonymous report", async () => {
    vi.mocked(prisma.jobReport.findFirst).mockResolvedValue(null as any)
    vi.mocked(prisma.jobReport.create).mockResolvedValue({ id: "rep_1" } as any)

    const res = await POST(req({ reason: "expired" }), { params })
    expect(res.status).toBe(201)
    expect(prisma.jobReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ reportedById: null }),
    })
  })
})