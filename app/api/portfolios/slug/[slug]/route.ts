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

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser()
  const slug = params.slug

  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: { items: { orderBy: { order: "asc" } } },
  })

  if (!portfolio || !portfolio.isPublic) {
    if (!user) return NextResponse.json({ error: Errors.auth.unauthorized }, { status: 401 })
    if (portfolio?.userId !== user.id) return NextResponse.json({ error: Errors.access.forbidden }, { status: 403 })
  }

  return NextResponse.json(portfolio)
}
