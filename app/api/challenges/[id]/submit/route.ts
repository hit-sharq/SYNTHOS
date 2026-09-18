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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const challenge = await prisma.challenge.findUnique({ where: { id: params.id } })
  if (!challenge) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })
  if (challenge.status !== "open") return NextResponse.json({ error: "Challenge is not open" }, { status: 400 })

  const body = await req.json()
  const { content, mediaUrl } = body
  if (!content) return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })

  const existing = await prisma.submission.findUnique({
    where: { challengeId_userId: { challengeId: params.id, userId: user.id } },
  })
  if (existing) return NextResponse.json({ error: Errors.actions.duplicateEntry }, { status: 409 })

  const submission = await prisma.submission.create({
    data: {
      challengeId: params.id,
      userId: user.id,
      content,
      mediaUrl: mediaUrl || null,
    },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { levelXP: { increment: 100 } },
  })

  return NextResponse.json(submission, { status: 201 })
}
