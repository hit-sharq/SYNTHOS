import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
  try {
    const body = await req.json()
    const { projectId, title, meetingSource } = body

    const roomName = `synthos-${projectId}-${Date.now()}`
    const roomUrl = `https://meet.jit.si/${roomName}`

    const meeting = await prisma.clientCall.upsert({
      where: { projectId },
      update: {
        date: new Date().toISOString().split("T")[0],
        duration: "00:00",
        participants: ["Admin", "Client"],
        summary: "Meeting scheduled",
        meetingSource: meetingSource || "embedded",
        roomName,
        roomUrl,
      },
      create: {
        projectId,
        date: new Date().toISOString().split("T")[0],
        duration: "00:00",
        participants: ["Admin", "Client"],
        summary: "Meeting scheduled",
        meetingSource: meetingSource || "embedded",
        roomName,
        roomUrl,
      },
    })

    return NextResponse.json({
      roomName,
      url: roomUrl,
      meeting,
    })
  } catch (error) {
    console.error("Meeting creation error:", error)
    return NextResponse.json({ error: Errors.actions.operationFailed }, { status: 500 })
  }
}
