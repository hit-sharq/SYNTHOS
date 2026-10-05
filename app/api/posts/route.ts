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
  const kind = searchParams.get("kind") || undefined
  const status = searchParams.get("status") || undefined

  const where: any = {}
  if (kind) where.kind = kind
  if (status) where.status = status

  const { take, skip } = readPagination(new URL(req.url))
  const key = `post:${take}:${skip}:${searchParams.get("status") ?? ""}:${searchParams.get("kind") ?? ""}`

  const rows = await cached(key, DEFAULT_TTL_MS, () =>
    prisma.post.findMany({
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
  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      kind: body.kind || "blog",
      status: body.status || "draft",
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      authorId: body.authorId,
      authorName: body.authorName,
      tags: body.tags || [],
    },
  })
  return NextResponse.json(post, { status: 201 })
}
