import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.companyId) return NextResponse.json({ error: Errors.access.roleRestricted }, { status: 403 })

    const applications = await prisma.jobApplication.findMany({
      where: { job: { companyId: user.companyId } },
      include: {
        job: { select: { id: true, title: true, type: true, status: true } },
        talent: { select: { id: true, name: true, email: true, skills: true, experience: true, rating: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      applications: applications.map(a => ({
        id: a.id,
        status: a.status,
        message: a.message,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        job: { id: a.job.id, title: a.job.title, type: a.job.type, status: a.job.status },
        talent: { id: a.talent.id, name: a.talent.name, email: a.talent.email, skills: a.talent.skills, experience: a.talent.experience, rating: a.talent.rating },
      })),
    })
  } catch (error) {
    console.error("Failed to fetch company applications:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
