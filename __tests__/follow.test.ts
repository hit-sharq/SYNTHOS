import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  getSessionEmail: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    talent: { findUnique: vi.fn() },
    connection: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

const { auth } = await import("@clerk/nextjs/server")
const { prisma } = await import("@/lib/prisma")
const { getSessionEmail } = await import("@/lib/auth")
const { POST, GET } = await import("../app/api/follow/[id]/route")

function mockReq(body: any = {}) {
  return { json: async () => body } as unknown as Request
}

function mockParams(id: string) {
  return { params: { id } }
}

describe("POST /api/follow/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ userId: "user_me" } as any)
    vi.mocked(getSessionEmail).mockResolvedValue("me@x.com")
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_me", email: "me@x.com" } as any)
  })

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)
    const res = await POST(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(401)
  })

  it("returns 400 when following self", async () => {
    const res = await POST(mockReq(), mockParams("user_me"))
    expect(res.status).toBe(400)
  })

  it("returns 404 when talent not found", async () => {
    vi.mocked(prisma.talent.findUnique).mockResolvedValue(null as any)
    const res = await POST(mockReq(), mockParams("missing"))
    expect(res.status).toBe(404)
  })

  it("returns 404 when talent has no linked user", async () => {
    vi.mocked(prisma.talent.findUnique).mockResolvedValue({ id: "talent_1", userId: null } as any)
    const res = await POST(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(404)
  })

  it("creates a connection and returns followed=true", async () => {
    vi.mocked(getSessionEmail).mockResolvedValue("me@x.com")
    vi.mocked(prisma.talent.findUnique).mockResolvedValue({ id: "talent_1", userId: "user_talent" } as any)
    vi.mocked(prisma.connection.findUnique).mockResolvedValue(null as any)
    vi.mocked(prisma.connection.create).mockResolvedValue({ id: "conn_1" } as any)

    const res = await POST(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.followed).toBe(true)
    expect(prisma.connection.create).toHaveBeenCalledWith({
      data: { followerId: "user_me", followedId: "user_talent", status: "accepted" },
    })
  })

  it("toggles off when an accepted connection already exists", async () => {
    vi.mocked(getSessionEmail).mockResolvedValue("me@x.com")
    vi.mocked(prisma.talent.findUnique).mockResolvedValue({ id: "talent_1", userId: "user_talent" } as any)
    vi.mocked(prisma.connection.findUnique).mockResolvedValue({ id: "conn_1", status: "accepted" } as any)
    vi.mocked(prisma.connection.delete).mockResolvedValue({} as any)

    const res = await POST(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.followed).toBe(false)
    expect(prisma.connection.delete).toHaveBeenCalledWith({ where: { id: "conn_1" } })
  })

  it("accepts a pending connection", async () => {
    vi.mocked(getSessionEmail).mockResolvedValue("me@x.com")
    vi.mocked(prisma.talent.findUnique).mockResolvedValue({ id: "talent_1", userId: "user_talent" } as any)
    vi.mocked(prisma.connection.findUnique).mockResolvedValue({ id: "conn_1", status: "pending" } as any)
    vi.mocked(prisma.connection.update).mockResolvedValue({ id: "conn_1", status: "accepted" } as any)

    const res = await POST(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.followed).toBe(true)
    expect(prisma.connection.update).toHaveBeenCalledWith({
      where: { id: "conn_1" },
      data: { status: "accepted" },
    })
  })
})

describe("GET /api/follow/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ userId: "user_me" } as any)
    vi.mocked(getSessionEmail).mockResolvedValue("me@x.com")
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_me", email: "me@x.com" } as any)
  })

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)
    const res = await GET(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(401)
  })

  it("returns 404 when talent not found", async () => {
    vi.mocked(prisma.talent.findUnique).mockResolvedValue(null as any)
    const res = await GET(mockReq(), mockParams("missing"))
    expect(res.status).toBe(404)
  })

  it("returns empty state when talent has no linked user", async () => {
    vi.mocked(prisma.talent.findUnique).mockResolvedValue({ id: "talent_1", userId: null } as any)
    const res = await GET(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ followed: false, followerCount: 0, followingCount: 0 })
  })

  it("returns follow status and counts", async () => {
    vi.mocked(prisma.talent.findUnique).mockResolvedValue({ id: "talent_1", userId: "user_talent" } as any)
    vi.mocked(prisma.connection.findFirst).mockResolvedValue({ id: "conn_1" } as any)
    vi.mocked(prisma.connection.count)
      .mockResolvedValueOnce(5) // followerCount
      .mockResolvedValueOnce(3) // followingCount

    const res = await GET(mockReq(), mockParams("talent_1"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ followed: true, followerCount: 5, followingCount: 3 })
  })
})