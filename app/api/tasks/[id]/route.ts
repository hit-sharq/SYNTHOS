export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Errors } from "@/lib/errors"

async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)

  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
  return user
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const existing = await prisma.task.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: Errors.resources.taskNotFound }, { status: 404 })

  if (user.role === Role.talent && existing.assigneeId !== user.id) {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  const updates: any = {}
  if (body.status) updates.status = body.status
  if (body.status === "complete") updates.completedAt = new Date()
  if (body.title) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.priority) updates.priority = body.priority
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null

  const task = await prisma.task.update({
    where: { id: params.id },
    data: updates,
  })
  return NextResponse.json(task)
}
