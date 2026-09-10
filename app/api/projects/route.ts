import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Stage, ProjStatus, ReviewStatus } from "@prisma/client"
import { runAutoWorkflow } from "@/lib/auto-workflow"
import { requireAuth, getUserEmail, getUserByEmail } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

export async function GET(req: Request) {
  const authResult = await requireAuth()
  if (authResult.error) return authResult.error
  const userId = authResult.userId!

  const url = new URL(req.url)
  const owner = url.searchParams.get("owner")
  
  const email = await getUserEmail(userId)
  if (!email) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  const user = await getUserByEmail(email)
  if (!user) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  const isAdmin = adminIds.includes(userId)

  let where: any = {}
  if (!isAdmin) {
    if (user.role === "talent") {
      where.ownerId = user.id
    } else if (user.role === "client") {
      const client = await prisma.client.findFirst({ where: { email } })
      if (client) {
        where.clientId = client.id
      } else {
        where.clientId = "none"
      }
    }
  }
  if (owner === "true") where.ownerId = { not: null }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { brief: true, understanding: true, workshop: true, proposal: true, quote: true },
  })
  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const authResult = await requireAuth()
  if (authResult.error) return authResult.error
  const userId = authResult.userId!

  const email = await getUserEmail(userId)
  if (!email) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  const user = await getUserByEmail(email)
  if (!user) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  if (!adminIds.includes(userId) && user.role !== "talent") {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  try {
    const body = await req.json()
    const project = await prisma.project.create({
      data: {
        name: body.name,
        client: body.client,
        type: body.type || "Strategy & Campaign",
        stage: body.stage ? (body.stage as Stage) : Stage.brief,
        progress: body.progress ?? 0,
        status: body.status ? (body.status as ProjStatus) : ProjStatus.active,
        nextAction: body.nextAction || "Complete the creative brief",
        slug: (body.name || "Untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40),
        clientId: body.clientId || undefined,
      },
    })

    const client = body.clientId
      ? await prisma.client.findUnique({ where: { id: body.clientId } })
      : await prisma.client.findFirst({ where: { name: body.client } })

    if (!client) {
      await prisma.client.create({
        data: {
          name: body.client || "Unknown",
          company: body.company || "",
          email: body.email || "",
          industry: "Unknown",
          status: "lead",
          source: "Admin",
          tags: ["admin-created"],
        },
      })
    }

    await prisma.brief.create({
      data: {
        projectId: project.id,
        clientName: body.client || "",
        company: body.company || "",
        contact: body.email || "",
        industry: "Unknown",
        title: body.name || "",
        businessObjective: body.objective || "",
        objectives: [],
        audience: body.audience || "",
        brand: "",
        direction: body.direction || "",
        deliverables: [],
        budget: body.budget || "",
        timeline: body.timeline || "",
        attachments: [],
        context: body.context || "",
      },
    })

    runAutoWorkflow(project.id).catch((err) => console.error("Auto-workflow failed after project creation:", err))

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
