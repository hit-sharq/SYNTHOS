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

  const url = new URL(req.url)
  const status = url.searchParams.get("status") || "open"

  const where: any = {}
  if (status !== "all") where.status = status

  const challenges = await prisma.challenge.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdByUser: { select: { id: true, name: true, initials: true, level: true, levelXP: true } },
      submissions: {
        where: { status: "winning" },
        include: { user: { select: { id: true, name: true, initials: true } } },
      },
      _count: { select: { submissions: true } },
    },
  })

  return NextResponse.json({ challenges })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const challenge = await prisma.challenge.create({
    data: {
      title: body.title,
      description: body.description,
      brief: body.brief,
      rules: body.rules,
      status: "open",
      featured: body.featured || false,
      icon: body.icon,
      color: body.color,
      createdBy: user.id,
    },
  })

  return NextResponse.json(challenge, { status: 201 })
}
