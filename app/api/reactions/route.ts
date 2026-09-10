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

export async function POST(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const { postId, type = "like" } = body
  const validTypes = ["like", "celebrate", "support", "insightful", "congrats"]
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: Errors.validation.invalidType }, { status: 400 })
  }

  const post = await prisma.feedPost.findUnique({ where: { id: postId }, select: { authorId: true } })
  if (!post) return NextResponse.json({ error: Errors.resources.postNotFound }, { status: 404 })

  await prisma.reaction.upsert({
    where: { postId_userId_type: { postId, userId: user.id, type } },
    update: {},
    create: { postId, userId: user.id, type },
  })

  if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: "New reaction",
        message: `${user.name} reacted to your post`,
        kind: "message",
        refId: post.authorId,
      },
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const { postId, type = "like" } = body

  await prisma.reaction.deleteMany({
    where: { postId, userId: user.id, type },
  })

  return NextResponse.json({ ok: true })
}
