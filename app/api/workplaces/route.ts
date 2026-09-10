export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, role: true } })
  return user
}

export async function GET() {
  const workplaces = await prisma.workplace.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ workplaces })
}

export async function POST(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (!adminIds.includes(user.id)) {
    return NextResponse.json({ error: Errors.access.adminOnly }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, slug } = body
  if (!name) return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })

  const workplace = await prisma.workplace.create({
    data: { name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50), description: description || "" },
  })

  return NextResponse.json(workplace, { status: 201 })
}
