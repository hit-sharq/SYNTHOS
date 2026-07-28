import { DashboardShell } from "@/components/app/DashboardShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map(id => id.trim()).filter(Boolean) || []
  if (adminIds.includes(userId)) {
    return <DashboardShell>{children}</DashboardShell>
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
        role: "talent",
      },
    })

    await prisma.talent.create({
      data: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        position: "creative",
        skills: [],
        experience: 0,
        rating: 0,
        availability: "available",
        rate: "",
        notes: "",
      },
    })

    return <DashboardShell>{children}</DashboardShell>
  }

  if (user.role === "talent") {
    return <DashboardShell>{children}</DashboardShell>
  }

  redirect("/")
}
