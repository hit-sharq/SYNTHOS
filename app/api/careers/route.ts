export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { readJson, isJsonError } from "@/lib/request"
import { readPagination } from "@/lib/pagination"
import { cached, cachedJson, pruneCache, DEFAULT_TTL_MS } from "@/lib/cache"

export async function GET(req: Request) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined

  const where: any = {}
  if (status) where.status = status

  const { take, skip } = readPagination(new URL(req.url))
  const key = `career:${take}:${skip}:${searchParams.get("status") ?? ""}:${searchParams.get("kind") ?? ""}`

  const rows = await cached(key, DEFAULT_TTL_MS, () =>
    prisma.career.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    })
  )
  pruneCache()
  return cachedJson(rows)
}

export async function POST(req: Request) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const body = await readJson<any>(req)
  if (isJsonError(body)) return body
  const career = await prisma.career.create({
    data: {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      description: body.description,
      requirements: body.requirements || [],
      type: body.type || "full-time",
      location: body.location,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      status: body.status || "open",
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  })
  return NextResponse.json(career, { status: 201 })
}
