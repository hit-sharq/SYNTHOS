export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

export async function GET() {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { conversation: true },
  })

  return NextResponse.json(messages)
}

export async function POST(req: Request) {
  const adminResult = await requireAdmin()
  if (adminResult.error) return adminResult.error

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const message = await prisma.message.create({
    data: {
      conversationId: body.conversationId,
      senderId: userId,
      senderName: body.senderName || "Admin",
      senderRole: "admin",
      subject: body.subject,
      body: body.body,
      kind: body.kind || "message",
      refId: body.refId,
      attachments: body.attachments || [],
    },
  })

  await prisma.conversation.update({
    where: { id: body.conversationId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(message, { status: 201 })
}
