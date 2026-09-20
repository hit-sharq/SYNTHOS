import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Errors } from "@/lib/errors"

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  const { getSessionEmail } = await import("@/lib/auth")
  const email = await getSessionEmail()
  if (!email) return null
  return prisma.user.findUnique({ where: { email } })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const { submissionId, winner } = body
  if (winner && user.role !== "admin") {
    return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: winner ? "winning" : "eliminated",
    },
  })

  return NextResponse.json(submission)
}
