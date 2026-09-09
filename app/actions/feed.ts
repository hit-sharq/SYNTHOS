"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function createPost(input: { content: string; authorId: string }) {
  const post = await prisma.feedPost.create({
    data: {
      content: input.content,
      authorId: input.authorId,
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
