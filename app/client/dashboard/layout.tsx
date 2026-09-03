import { ClientShell } from "@/components/app/ClientShell"

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>
}
