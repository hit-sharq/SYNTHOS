import { AdminShell } from "@/components/app/AdminShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
  if (adminIds.includes(userId)) {
    return <AdminShell>{children}</AdminShell>
  }

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)

  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) redirect("/")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const initials = (clerkUser?.first_name || email.split("@")[0] || "TL")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const newUser = await prisma.user.create({
      data: {
        email,
        name: clerkUser?.first_name || email.split("@")[0],
        initials: initials || "TL",
        role: Role.talent,
      },
    })

    await prisma.talent.create({
      data: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        skills: [],
        experience: 0,
        rating: 0,
        availability: "available",
        rate: "",
        notes: "",
      },
    })

    return <AdminShell>{children}</AdminShell>
  }

  if (user.role === Role.talent) {
    return <AdminShell>{children}</AdminShell>
  }

  if (user.role === Role.client) {
    redirect("/client/dashboard")
  }

  redirect("/")
}
