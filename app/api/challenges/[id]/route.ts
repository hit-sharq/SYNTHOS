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

  const challenge = await prisma.challenge.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        orderBy: { voteCount: "desc" },
        include: { user: { select: { id: true, name: true, initials: true } } },
      },
      _count: { select: { submissions: true } },
    },
  })

  if (!challenge) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })
  return NextResponse.json(challenge)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const challenge = await prisma.challenge.findUnique({ where: { id: params.id } })
  if (!challenge) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })
  if (challenge.createdBy !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.challenge.update({
    where: { id: params.id },
    data: {
      title: body.title ?? challenge.title,
      description: body.description ?? challenge.description,
      status: body.status ?? challenge.status,
    },
  })

  return NextResponse.json(updated)
}
