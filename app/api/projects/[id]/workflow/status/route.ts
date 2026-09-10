import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isProjectAccessible } from "@/lib/api-auth"
import { Errors } from "@/lib/errors"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  const authResult = await isProjectAccessible(params.id, userId || undefined)
  if (!authResult.accessible) return authResult.error!
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      brief: true,
      call: true,
      contactReport: true,
      productionMeeting: true,
      proposal: true,
      quote: true,
    },
  })

  if (!project) {
    return NextResponse.json({ error: Errors.resources.projectNotFound }, { status: 404 })
  }

  return NextResponse.json({
    project: {
      id: project.id,
      name: project.name,
      stage: project.stage,
      progress: project.progress,
      nextAction: project.nextAction,
      aiWorkflowStatus: project.aiWorkflowStatus,
    },
  })
}
