"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function createPost(input: { content: string }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)
  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) throw new Error("Unauthorized")

  const post = await prisma.feedPost.create({
    data: {
      content: input.content,
      authorId: user.id,
    },
    include: {
      author: { select: { id: true, name: true, initials: true, role: true } },
      reactions: { select: { type: true, userId: true } },
      comments: {
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: { select: { id: true, name: true, initials: true, role: true } },
        },
      },
    },
  })

  await logAudit({
    action: "post.created",
    targetType: "FeedPost",
    targetId: post.id,
  })

  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  }
}
