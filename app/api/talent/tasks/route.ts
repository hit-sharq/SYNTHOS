export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

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

export async function GET() {
  try {
    const user = await getCurrentUserId()
    if (!user) return NextResponse.json({ tasks: [] })

    let tasks: any[]

    if (user.role === Role.talent) {
      tasks = await prisma.task.findMany({
        where: { assigneeId: user.id },
        orderBy: { createdAt: "desc" },
        include: { project: true },
      })
    } else {
      return NextResponse.json({ tasks: [] })
    }

    return NextResponse.json({
      tasks: tasks.map(t => ({
        id: t.id,
        projectId: t.projectId,
        projectName: t.project?.name || "Unknown",
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUserId()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== Role.talent) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const task = await prisma.task.create({
    data: {
      projectId: body.projectId,
      assigneeId: user.id,
      title: body.title,
      description: body.description,
      status: body.status || "todo",
      priority: body.priority,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  })
  return NextResponse.json(task, { status: 201 })
}
