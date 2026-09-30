import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isAdminUser } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"
import { readJson, isJsonError } from "@/lib/request"

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  if (!isAdminUser(userId)) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const spotlights = await prisma.spotlight.findMany({
    orderBy: { order: "asc" },
  })

  return NextResponse.json({ spotlights })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  if (!isAdminUser(userId)) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const body = await readJson<any>(req)
  if (isJsonError(body)) return body
  const spotlight = await prisma.spotlight.create({
    data: {
      title: body.title,
      subtitle: body.subtitle || null,
      creatorId: body.creatorId || null,
      content: body.content,
      imageUrl: body.imageUrl || null,
      category: body.category || "profile",
      isFeatured: body.isFeatured || false,
      order: body.order || 0,
    },
  })

  return NextResponse.json(spotlight, { status: 201 })
}
