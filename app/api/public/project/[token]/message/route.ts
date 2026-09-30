import { NextResponse } from "next/server"
import { getAdminEmails } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { Errors } from "@/lib/errors"

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const { name, email, subject, message: msg } = body || {}

    if (!name?.trim() || !email?.trim() || !msg?.trim()) {
      return NextResponse.json({ error: Errors.validation.requiredField }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { publicToken: params.token },
      include: { clientRef: true, owner: true },
    })

    if (!project) {
      return NextResponse.json({ error: Errors.resources.projectNotFound }, { status: 404 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        projectId: project.id,
        participants: [email, ...(project.clientRef?.email ? [project.clientRef.email] : [])],
      },
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: email,
        senderName: name.trim(),
        senderRole: "client",
        subject: subject?.trim() || `Re: ${project.name}`,
        body: msg.trim(),
        kind: "message",
      },
    })

    const emailSubject = subject?.trim() || `New message on ${project.name}`
    const emailHtml = `
      <p>You have a new message from <strong>${name.trim()}</strong> on project <strong>${project.name}</strong>.</p>
      <p><strong>Subject:</strong> ${emailSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${msg.trim()}</p>
      <hr />
      <p style="color: #888; font-size: 0.85rem;">Project: ${project.name}</p>
    `

    const recipients = new Set<string>()
    if (project.owner?.email) recipients.add(project.owner.email)

    for (const adminEmail of await getAdminEmails()) recipients.add(adminEmail)

    for (const recipientEmail of recipients) {
      await sendEmail({
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      })
    }

    if (project.ownerId) {
      await sendNotification({
        userId: project.ownerId,
        title: `New message from ${name.trim()}`,
        message: `${emailSubject} — ${msg.trim().slice(0, 120)}`,
        kind: "message",
        refId: project.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send message:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
