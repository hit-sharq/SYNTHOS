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

  const swaps = await prisma.skillSwap.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ swaps })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })

  const body = await req.json()
  const swap = await prisma.skillSwap.create({
    data: {
      userId: user.id,
      offerSkill: body.offerSkill,
      wantSkill: body.wantSkill,
      description: body.description || null,
    },
  })

  return NextResponse.json(swap, { status: 201 })
}
