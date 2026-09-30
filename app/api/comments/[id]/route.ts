export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null
  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, role: true } })
  if (!user) return null
  return { ...user, clerkId: userId }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const comment = await prisma.comment.findUnique({ where: { id: params.id }, select: { userId: true } })
  if (!comment) return NextResponse.json({ error: Errors.resources.commentNotFound }, { status: 404 })

  if (comment.userId !== user.id) {
    if (!(await isAdmin(user.clerkId))) {
      return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
    }
  }

  await prisma.comment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
