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

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ portfolios })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const portfolio = await prisma.portfolio.create({
    data: {
      userId: user.id,
      title: body.title,
      description: body.description || null,
      slug: body.slug,
      isPublic: body.isPublic ?? true,
    },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { levelXP: { increment: 150 } },
  })

  return NextResponse.json(portfolio, { status: 201 })
}
