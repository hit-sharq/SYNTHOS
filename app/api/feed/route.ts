export const dynamic = 'force-dynamic'
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
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, initials: true, role: true } })
  return user
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const url = new URL(req.url)
  const limit = Number(url.searchParams.get("limit") || 20)
  const offset = Number(url.searchParams.get("offset") || 0)
  const workplaceId = url.searchParams.get("workplaceId")

  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { followerId: user.id, status: "accepted" },
        { followedId: user.id, status: "accepted" },
      ],
      status: "accepted",
    },
    select: { followerId: true, followedId: true },
  })

  const connectionIds = new Set<string>()
  for (const c of connections) {
    connectionIds.add(c.followerId)
    connectionIds.add(c.followedId)
  }
  connectionIds.delete(user.id)

  let workplaceWhere: any = {}
  if (workplaceId) {
    const membership = await prisma.workplaceMember.findFirst({
      where: { workplaceId, userId: user.id },
    })
    if (!membership) return NextResponse.json({ error: Errors.actions.membershipRequired }, { status: 403 })
    workplaceWhere = { workplaceId }
  } else {
    workplaceWhere = {
      workplaceId: null,
      OR: [
        { authorId: user.id },
        { authorId: { in: Array.from(connectionIds) }, privacy: { in: ["public", "connections"] } },
      ],
    }
  }

  const posts = await prisma.feedPost.findMany({
    where: {
      ...workplaceWhere,
      projectId: url.searchParams.get("projectId") || undefined,
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    include: {
      author: { select: { id: true, name: true, initials: true, role: true } },
      project: { select: { id: true, name: true } },
      reactions: { select: { id: true, type: true, userId: true } },
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

  return NextResponse.json({
    posts: posts.map(p => ({
      id: p.id,
      content: p.content,
      media: p.media,
      mediaType: p.mediaType,
      postType: p.postType,
      privacy: p.privacy,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      author: p.author,
      project: p.project ? { id: p.project.id, name: p.project.name } : null,
      reactions: p.reactions,
      comments: p.comments.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    })),
  })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  const isAdmin = adminIds.includes(user.id)

  if (body.workplaceId) {
    const membership = await prisma.workplaceMember.findFirst({
      where: { workplaceId: body.workplaceId, userId: user.id },
    })
    if (!membership && !isAdmin) {
      return NextResponse.json({ error: Errors.actions.workplaceMemberRequired }, { status: 403 })
    }
  }

  if (body.projectId) {
    const project = await prisma.project.findUnique({ where: { id: body.projectId } })
    if (!project) return NextResponse.json({ error: Errors.resources.projectNotFound }, { status: 404 })
    if (project.ownerId !== user.id && project.clientId !== user.id && !isAdmin) {
      return NextResponse.json({ error: Errors.actions.projectAccessDenied }, { status: 403 })
    }
  }

  const post = await prisma.feedPost.create({
    data: {
      authorId: user.id,
      content: body.content,
      media: body.media,
      mediaType: body.mediaType,
      postType: body.postType || "status",
      privacy: body.privacy || "public",
      projectId: body.projectId || undefined,
      workplaceId: body.workplaceId || undefined,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
