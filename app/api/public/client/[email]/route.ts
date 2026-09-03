export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET(_req: Request, { params }: { params: { email: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ projects: [] })

  const decodedEmail = decodeURIComponent(params.email)

  if (!decodedEmail.trim() || !decodedEmail.includes("@")) {
    return NextResponse.json({ projects: [] })
  }

  const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean)
  const isAdmin = adminIds.includes(userId)

  if (!isAdmin) {
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then(r => r.json()).catch(() => null)

    const userEmail = clerkUser?.email_addresses?.[0]?.email_address || null
    if (userEmail !== decodedEmail) {
      return NextResponse.json({ projects: [] })
    }
  }

  const client = await prisma.client.findFirst({
    where: { email: decodedEmail },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        include: {
          proposal: true,
          quote: true,
        },
      },
    },
  })

  if (!client) {
    return NextResponse.json({ projects: [] })
  }

  const projects = client.projects.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    stage: p.stage,
    status: p.status,
    progress: p.progress,
    publicToken: p.publicToken,
    proposal: p.proposal
      ? {
          id: p.proposal.id,
          status: p.proposal.status,
          publicToken: p.proposal.publicToken,
          sentToClient: p.proposal.sentToClient,
        }
      : null,
    quote: p.quote
      ? {
          id: p.quote.id,
          status: p.quote.status,
          publicToken: p.quote.publicToken,
          sentToClient: p.quote.sentToClient,
        }
      : null,
    updatedAt: p.updatedAt.toISOString(),
  }))

  return NextResponse.json({
    projects,
    clientName: client.name,
  })
}
