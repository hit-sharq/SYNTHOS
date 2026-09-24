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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const { vote } = body // up or down

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { user: true },
  })
  if (!submission) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })
  if (submission.userId === user.id) return NextResponse.json({ error: "Cannot vote on your own submission" }, { status: 400 })

  const existing = await prisma.vote.findFirst({
    where: { submissionId: params.id, userId: user.id },
  })
  if (existing) {
    if (existing.voteType === vote) {
      await prisma.vote.delete({ where: { id: existing.id } })
      await prisma.submission.update({
        where: { id: params.id },
        data: { voteCount: { decrement: 1 } },
      })
    } else {
      await prisma.vote.update({
        where: { id: existing.id },
        data: { voteType: vote },
      })
      await prisma.submission.update({
        where: { id: params.id },
        data: { voteCount: { increment: vote === "up" ? 2 : -2 } },
      })
    }
  } else {
    await prisma.vote.create({
      data: { submissionId: params.id, userId: user.id, voteType: vote },
    })
    await prisma.submission.update({
      where: { id: params.id },
      data: { voteCount: { increment: vote === "up" ? 1 : -1 } },
    })
  }

  return NextResponse.json({ ok: true })
}
