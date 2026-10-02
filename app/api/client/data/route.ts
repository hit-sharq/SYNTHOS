import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { Errors } from "@/lib/errors"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const { getSessionUser } = await import("@/lib/auth")
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  // Company signup creates a User linked to a Company, not a Client record,
  // so resolve the client identity from the session user first and fall back
  // to a Client row for contacts that were created from a project instead.
  type ClientIdentity = { id: string; name: string; company: string; email: string }

  let client: ClientIdentity | null =
    (await prisma.client.findFirst({ where: { email: user.email } })) ?? null

  if (!client && user.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { id: true, name: true },
    })
    if (company) {
      client = {
        id: user.companyId,
        name: user.name,
        company: company.name,
        email: user.email,
      }
    }
  }

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
