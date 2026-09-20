import { DashboardShell } from "@/components/app/DashboardShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { getSessionEmail } from "@/lib/auth"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
  if (adminIds.includes(userId)) {
    return <DashboardShell role="admin">{children}</DashboardShell>
  }

  const email = await getSessionEmail()
  if (!email) redirect("/")

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const name = email.split("@")[0]
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TL"

    user = await prisma.user.create({
      data: {
        email,
        name,
        initials,
        role: Role.talent,
      },
    })

    await prisma.talent.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        skills: [],
        experience: 0,
        rating: 0,
        availability: "available",
        rate: "",
        notes: "",
      },
    })

    return <DashboardShell role="talent">{children}</DashboardShell>
  }

  if (user.role === Role.client) {
    redirect("/client/dashboard")
  }

  return <DashboardShell role="talent">{children}</DashboardShell>
}