import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/api-auth", () => ({
  requireAdmin: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

const { NextResponse } = await import("next/server")
const { requireAdmin } = await import("@/lib/api-auth")
const { prisma } = await import("@/lib/prisma")
const { PATCH, GET } = await import("../app/api/companies/[id]/route")
const { GET: PUBLIC_GET } = await import("../app/api/companies/public/route")

function req(body: unknown) {
  return { json: async () => body } as unknown as Request
}
const listReq = () => new Request("http://localhost/api/companies/public")
const params = { id: "co_1" }

describe("PATCH /api/companies/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdmin).mockResolvedValue({ userId: "u1", error: null })
    vi.mocked(prisma.company.findUnique).mockResolvedValue({ id: "co_1", verified: false } as any)
  })

  it("rejects a non-admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    } as any)
    const res = await PATCH(req({ verified: true }), { params })
    expect(res.status).toBe(403)
  })

  it("only sends the fields present in the body to prisma", async () => {
    vi.mocked(prisma.company.update).mockResolvedValue({ id: "co_1" } as any)
    await PATCH(req({ industry: "Tech" }), { params })
    expect(prisma.company.update).toHaveBeenCalledWith({
      where: { id: "co_1" },
      data: { industry: "Tech" },
    })
  })

  it("never clears omitted columns", async () => {
    vi.mocked(prisma.company.update).mockResolvedValue({ id: "co_1" } as any)
    await PATCH(req({ verified: true }), { params })
    const data = vi.mocked(prisma.company.update).mock.calls[0][0].data as Record<string, unknown>
    // The admin verify toggle sends only `verified`; anything else present
    // here would blank the company name, email and phone.
    for (const key of ["name", "email", "phone", "slug"]) {
      expect(data).not.toHaveProperty(key)
    }
  })

  it("records who verified the company and activates it", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u_admin" } as any)
    vi.mocked(prisma.company.update).mockResolvedValue({ id: "co_1" } as any)
    await PATCH(req({ verified: true }), { params })
    const data = vi.mocked(prisma.company.update).mock.calls[0][0].data as Record<string, unknown>
    expect(data.verifiedBy).toBe("u_admin")
    expect(data.verifiedAt).toBeInstanceOf(Date)
    expect(data.status).toBe("active")
  })

  it("clears the verification trail when a company is unverified", async () => {
    vi.mocked(prisma.company.findUnique).mockResolvedValue({ id: "co_1", verified: true } as any)
    vi.mocked(prisma.company.update).mockResolvedValue({ id: "co_1" } as any)
    await PATCH(req({ verified: false }), { params })
    const data = vi.mocked(prisma.company.update).mock.calls[0][0].data as Record<string, unknown>
    expect(data.verifiedAt).toBeNull()
    expect(data.verifiedBy).toBeNull()
  })

  it("applies a full edit when every field is sent", async () => {
    vi.mocked(prisma.company.update).mockResolvedValue({ id: "co_1" } as any)
    await PATCH(req({ name: "Acme", email: "a@x.com", status: "active" }), { params })
    expect(prisma.company.update).toHaveBeenCalledWith({
      where: { id: "co_1" },
      data: { name: "Acme", email: "a@x.com", status: "active" },
    })
  })

  it("returns 400 for an empty body", async () => {
    const res = await PATCH(req({}), { params })
    expect(res.status).toBe(400)
    expect(prisma.company.update).not.toHaveBeenCalled()
  })

  it("returns 404 for an unknown company", async () => {
    vi.mocked(prisma.company.findUnique).mockResolvedValue(null as any)
    const res = await PATCH(req({ verified: true }), { params })
    expect(res.status).toBe(404)
  })
})

describe("GET /api/companies/public", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.company.count).mockResolvedValue(0 as any)
    vi.mocked(prisma.$transaction).mockImplementation((arg: any) =>
      Array.isArray(arg) ? Promise.all(arg) : Promise.resolve(arg)
    )
  })

  it("returns only verified, active companies", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([
      { id: "c1", name: "Verified Co", slug: "verified-co", industry: null, location: null, website: null, description: null, logo: null, verified: true, joinedAt: new Date(), jobs: [{ id: "j1" }, { id: "j2" }] },
    ] as any)

    const res = await PUBLIC_GET(listReq())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.items).toHaveLength(1)
    expect(body.items[0].openJobs).toBe(2)

    const call = vi.mocked(prisma.company.findMany).mock.calls[0][0]
    expect(call?.where).toEqual({ verified: true, status: "active" })
  })

  it("counts only approved jobs", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([] as any)
    await PUBLIC_GET(listReq())
    const call = vi.mocked(prisma.company.findMany).mock.calls[0][0] as any
    expect(call.select.jobs.where).toEqual({ status: "approved" })
  })

  it("never exposes private contact fields", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([] as any)
    await PUBLIC_GET(listReq())
    const call = vi.mocked(prisma.company.findMany).mock.calls[0][0] as any
    const keys = Object.keys(call.select)
    expect(keys).not.toContain("email")
    expect(keys).not.toContain("phone")
    expect(keys).not.toContain("users")
  })

  it("needs no authentication", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([] as any)
    const res = await PUBLIC_GET(listReq())
    expect(res.status).toBe(200)
    expect(requireAdmin).not.toHaveBeenCalled()
  })
})