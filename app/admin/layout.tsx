import { AdminShell } from "@/components/app/AdminShell"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { isAdminUser } from "@/lib/api-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  if (!isAdminUser(userId)) redirect("/dashboard/overview")

  return <AdminShell>{children}</AdminShell>
}
