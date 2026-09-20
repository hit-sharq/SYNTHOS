import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return null
  return prisma.user.findUnique({ where: { email } })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { order: "asc" } } },
  })

  if (!portfolio) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })

  const isOwner = portfolio.userId === user.id
  if (!portfolio.isPublic && !isOwner) {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  return NextResponse.json(portfolio)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const portfolio = await prisma.portfolio.findUnique({ where: { id: params.id } })
  if (!portfolio) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })
  if (portfolio.userId !== user.id) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const body = await req.json()
  const updated = await prisma.portfolio.update({
    where: { id: params.id },
    data: {
      title: body.title ?? portfolio.title,
      description: body.description ?? portfolio.description,
      isPublic: body.isPublic ?? portfolio.isPublic,
    },
  })

  return NextResponse.json(updated)
}
