import { CompanyShell } from "@/components/app/CompanyShell"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  }).then(r => r.json()).catch(() => null)

  const email = clerkUser?.email_addresses?.[0]?.email_address || null
  if (!email) redirect("/")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) redirect("/")

  if (user.role !== Role.client || !user.companyId) {
    redirect("/client/dashboard")
  }

  return <CompanyShell>{children}</CompanyShell>
}
