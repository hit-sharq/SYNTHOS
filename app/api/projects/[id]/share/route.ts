export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { isProjectAccessible } from "@/lib/api-auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  const authResult = await isProjectAccessible(params.id, userId || undefined)
  if (!authResult.accessible) return authResult.error!
  try {
    const body = await req.json().catch(() => ({}))
    const action = body?.action as string | undefined

    if (action !== "generate" && action !== "regenerate") {
      return NextResponse.json({ error: "Invalid action. Use 'generate' or 'regenerate'." }, { status: 400 })
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } })
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const publicToken = crypto.randomUUID()
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { publicToken },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const publicUrl = `${baseUrl}/public/project/${publicToken}`

    if (project.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: "Client portal link ready",
        message: `A shareable client portal link has been generated for "${project.name}".`,
        kind: "system",
        refId: project.id,
      })
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      publicToken: updated.publicToken,
      publicUrl,
    })
  } catch (error) {
    console.error("Failed to generate share link:", error)
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 })
  }
}
