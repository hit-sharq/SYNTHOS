export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const post = await prisma.feedPost.findUnique({ where: { id: params.id }, select: { authorId: true } })
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (post.authorId !== user.id && !adminIds.includes(user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.feedPost.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
