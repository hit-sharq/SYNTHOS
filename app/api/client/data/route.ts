import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { Errors } from "@/lib/errors"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)

  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const client = await prisma.client.findFirst({ where: { email } })
  if (!client) return NextResponse.json({ projects: [] })

  const projects = await prisma.project.findMany({
    where: { clientId: client.id },
    orderBy: { updatedAt: "desc" },
    include: {
      brief: true,
      call: true,
      contactReport: true,
      productionMeeting: true,
      proposal: true,
      quote: true,
    },
  })

  return NextResponse.json({
    client: { id: client.id, name: client.name, company: client.company, email: client.email },
    projects: projects.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      stage: p.stage,
      status: p.status,
      progress: p.progress,
      nextAction: p.nextAction,
      publicToken: p.publicToken,
      brief: p.brief ? { id: p.brief.id, title: p.brief.title, businessObjective: p.brief.businessObjective, timeline: p.brief.timeline } : null,
      call: p.call ? { id: p.call.id, date: p.call.date, duration: p.call.duration, summary: p.call.summary, roomUrl: p.call.roomUrl } : null,
      contactReport: p.contactReport ? { id: p.contactReport.id, summary: p.contactReport.summary, actionItems: p.contactReport.actionItems, sentToClient: p.contactReport.sentToClient } : null,
      productionMeeting: p.productionMeeting ? { id: p.productionMeeting.id, decision: p.productionMeeting.decision, notes: p.productionMeeting.notes } : null,
      proposal: p.proposal ? { id: p.proposal.id, status: p.proposal.status, publicToken: p.proposal.publicToken, sentToClient: p.proposal.sentToClient, overview: p.proposal.overview } : null,
      quote: p.quote ? { id: p.quote.id, status: p.quote.status, publicToken: p.quote.publicToken, sentToClient: p.quote.sentToClient, services: p.quote.services } : null,
    })),
  })
}
