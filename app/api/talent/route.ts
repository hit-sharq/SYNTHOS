import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"
import { readPagination } from "@/lib/pagination"
import { cached, cachedJson, pruneCache, DEFAULT_TTL_MS } from "@/lib/cache"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const { take, skip, page } = readPagination(url)
    const key = `talent:${take}:${skip}:${url.searchParams.get("q") ?? ""}`

    const talents = await cached(key, DEFAULT_TTL_MS, () =>
      prisma.talent.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      })
    )
    pruneCache()

    return cachedJson(talents, 30)
  } catch (error) {
    console.error("Failed to fetch talent:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson<any>(req)
    if (isJsonError(body)) return body
    const talent = await prisma.talent.create({
      data: {
        name: body.name,
        email: body.email,
        skills: body.skills || [],
        experience: body.experience || 0,
        rating: body.rating || 0,
        availability: body.availability || "available",
        rate: body.rate || "",
        portfolio: body.portfolio,
        notes: body.notes,
      },
    })
    return NextResponse.json(talent, { status: 201 })
  } catch (error) {
    console.error("Failed to create talent:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
