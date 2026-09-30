import { DashboardShell } from "@/components/app/DashboardShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  let user = await getSessionUser()
  if (!user) {
    const { getSessionEmail } = await import("@/lib/auth")
    const email = await getSessionEmail()
    if (!email) redirect("/")

    const name = email.split("@")[0]
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TL"

    user = await prisma.user.create({
      data: {
        clerkId: userId,
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

  if (user.role === Role.admin) {
    return <DashboardShell role="admin">{children}</DashboardShell>
  }

  if (user.role === Role.client) {
    redirect("/client/dashboard")
  }

  return <DashboardShell role="talent">{children}</DashboardShell>
}