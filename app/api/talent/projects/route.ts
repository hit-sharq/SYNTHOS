export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then(r => r.json()).catch(() => null)

    const email = clerkUser?.email_addresses?.[0]?.email_address || null
    if (!email) return NextResponse.json({ projects: [] })

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
    if (!user) return NextResponse.json({ projects: [] })

    const projects = await prisma.project.findMany({
      where: user.role === Role.talent ? { ownerId: user.id } : undefined,
      orderBy: { updatedAt: "desc" },
      include: { brief: true, understanding: true, workshop: true, proposal: true, quote: true },
    })

    return NextResponse.json({ projects: user.role === Role.talent ? projects : [] })
  } catch (error) {
    console.error("Failed to fetch talent projects:", error)
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 })
  }
}
