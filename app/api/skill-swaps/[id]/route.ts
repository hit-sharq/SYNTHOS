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

  const swap = await prisma.skillSwap.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, initials: true } } },
  })

  if (!swap) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })
  return NextResponse.json(swap)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const swap = await prisma.skillSwap.findUnique({ where: { id: params.id } })
  if (!swap) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })
  if (swap.userId !== user.id) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const body = await req.json()
  const updated = await prisma.skillSwap.update({
    where: { id: params.id },
    data: { status: body.status },
  })

  return NextResponse.json(updated)
}
