import { AdminShell } from "@/components/app/AdminShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)

  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) redirect("/dashboard/overview")

  const dbUser = await prisma.user.findUnique({ where: { email }, select: { role: true } })
  if (!dbUser || dbUser.role !== Role.admin) redirect("/dashboard/overview")

  return <AdminShell>{children}</AdminShell>
}
