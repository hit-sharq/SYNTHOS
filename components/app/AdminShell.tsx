"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserPlus, Briefcase, MessageSquare, Settings, Newspaper, FileText, ArrowLeft, Menu, X, FileSignature, Calculator, CheckCircle, Calendar, FileSearch, FolderOpen, GitBranch, ShieldCheck } from "lucide-react"
import { NotificationBell } from "./NotificationBell"
import "./admin.css"

const WORKFLOW_NAV = [
  { href: "/admin/workflow/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/workflow/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/admin/workflow/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/workflow/briefs", label: "Blueprints", icon: FileText },
  { href: "/admin/workflow/meetings", label: "Sessions", icon: Calendar },
  { href: "/admin/workflow/proposals", label: "Offers", icon: FileSignature },
  { href: "/admin/workflow/quotes", label: "Estimates", icon: Calculator },
  { href: "/admin/workflow/approvals", label: "Approvals", icon: CheckCircle },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/workflow/messages", label: "Messages", icon: MessageSquare },
]

const ADMIN_NAV = [
  { href: "/admin", label: "Admin Overview", icon: ShieldCheck },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileSearch },
  { href: "/admin/projects", label: "Project Admin", icon: Briefcase },
  { href: "/admin/talent", label: "Talent", icon: Users },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/companies", label: "Companies", icon: Briefcase },
  { href: "/admin/jobs", label: "Job Postings", icon: Briefcase },
  { href: "/admin/jobs/reports", label: "Job Reports", icon: FileSearch },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/team", label: "Team", icon: UserPlus },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/messages", label: "Conversations", icon: MessageSquare },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/contact-reports", label: "Contact Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      {sidebarOpen && <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn("admin-sidebar", sidebarOpen && "admin-sidebar--open")}>
        <div className="admin-sidebar-head">
          <Link href="/" className="admin-brand" onClick={() => setSidebarOpen(false)}>
            <span className="admin-brand-word">Synthos <em>Unified Workspace</em></span>
          </Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav-section-label">Workflow</span>
          {WORKFLOW_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={cn("admin-nav-item", active && "admin-nav-item--active")} onClick={() => setSidebarOpen(false)}>
                <Icon size={18} strokeWidth={1.8} />
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            )
          })}

          <span className="admin-nav-section-label">Administration</span>

          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={cn("admin-nav-item", active && "admin-nav-item--active")} onClick={() => setSidebarOpen(false)}>
                <Icon size={18} strokeWidth={1.8} />
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar-foot">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <Link href="/" className="admin-back" onClick={() => setSidebarOpen(false)}>
              <ArrowLeft size={14} /> Back to Site
            </Link>
            <NotificationBell />
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        {children}
      </main>
    </div>
  )
}
