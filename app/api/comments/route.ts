export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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

export async function GET(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const postId = url.searchParams.get("postId")
  if (!postId) return NextResponse.json({ comments: [] })

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, initials: true, role: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, initials: true, role: true } } },
      },
    },
  })

  return NextResponse.json({ comments: comments.map(c => ({
    id: c.id,
    postId: c.postId,
    userId: c.userId,
    user: c.user,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    replies: c.replies.map(r => ({
      id: r.id,
      userId: r.userId,
      user: r.user,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
  })) })
}

export async function POST(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { postId, body: text, parentId } = body
  if (!postId || !text) return NextResponse.json({ error: "postId and body required" }, { status: 400 })

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: user.id,
      body: text,
      parentId: parentId || undefined,
    },
  })

  if (!parentId) {
    const post = await prisma.feedPost.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (post?.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post!.authorId,
          title: "New comment",
          message: `${user.name} commented on your post`,
          kind: "message",
          refId: postId,
        },
      })
    }
  }

  return NextResponse.json(comment, { status: 201 })
}
