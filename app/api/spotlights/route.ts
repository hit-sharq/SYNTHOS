import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return null
  return prisma.user.findUnique({ where: { email } })
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const isAdmin = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).includes(user.id)
  if (!isAdmin) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const spotlights = await prisma.spotlight.findMany({
    orderBy: { order: "asc" },
  })

  return NextResponse.json({ spotlights })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const isAdmin = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).includes(user.id)
  if (!isAdmin) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const body = await req.json()
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
