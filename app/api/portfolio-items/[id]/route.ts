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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const item = await prisma.portfolioItem.findUnique({ where: { id: params.id } })
  if (!item) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })

  const portfolio = await prisma.portfolio.findUnique({ where: { id: item.portfolioId } })
  if (portfolio?.userId !== user.id) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  await prisma.portfolioItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
