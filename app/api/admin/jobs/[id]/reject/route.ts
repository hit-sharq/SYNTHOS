import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then(r => r.json()).catch(() => null)

    const email = clerkUser?.email_addresses?.[0]?.email_address
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { email }, select: { role: true } })
    if (!dbUser || dbUser.role !== Role.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const job = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        status: "rejected",
        rejectedAt: new Date(),
      },
    })

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Failed to reject job:", error)
    return NextResponse.json({ error: "Failed to reject job" }, { status: 500 })
  }
}
