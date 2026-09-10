import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Errors } from "@/lib/errors"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then(r => r.json()).catch(() => null)

    const email = clerkUser?.email_addresses?.[0]?.email_address || null
    if (!email) return NextResponse.json({ applications: [] })

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
    if (!user || user.role !== Role.talent) return NextResponse.json({ applications: [] })

    const applications = await prisma.jobApplication.findMany({
      where: { talentId: user.id },
      include: {
        job: {
          include: { company: { select: { id: true, name: true, slug: true, verified: true } } },
        },
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
        job: {
          id: a.job.id,
          title: a.job.title,
          description: a.job.description,
          type: a.job.type,
          location: a.job.location,
          budget: a.job.budget,
          timeline: a.job.timeline,
          skills: a.job.skills,
          postedAt: a.job.postedAt,
          company: a.job.company,
        },
      })),
    })
  } catch (error) {
    console.error("Failed to fetch talent applications:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
