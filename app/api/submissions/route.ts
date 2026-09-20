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

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const url = new URL(req.url)
  const challengeId = url.searchParams.get("challengeId")

  const submissions = await prisma.submission.findMany({
    where: challengeId ? { challengeId } : { userId: user.id },
    orderBy: { votes: "desc" },
    include: {
      user: { select: { id: true, name: true, initials: true } },
      challenge: { select: { id: true, title: true } },
    },
  })

  return NextResponse.json({ submissions })
}
