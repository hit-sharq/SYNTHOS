"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageSquare,
  Calendar,
  Users,
  FileSignature,
  Calculator,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  GitBranch,
  User,
  Briefcase,
  Bell,
} from "lucide-react"
import { NotificationBell } from "./NotificationBell"
import "./dashboard.css"

const TALENT_NAV = [
  { href: "/dashboard/talent", label: "My Workspace", icon: User },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/dashboard/talent/profile", label: "Talent Profile", icon: User },
  { href: "/dashboard/talent/tasks", label: "Tasks", icon: CheckCircle },
  { href: "/dashboard/talent/deadlines", label: "Deadlines", icon: Calendar },
  { href: "/dashboard/talent/meetings", label: "Meetings", icon: Calendar },
  { href: "/dashboard/talent/applications", label: "Applications", icon: Briefcase },
  { href: "/jobs", label: "Open Gigs", icon: Briefcase },
]

const CLIENT_NAV = [
  { href: "/client/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/client/dashboard", label: "Projects", icon: FolderOpen },
  { href: "/client/dashboard", label: "Proposals", icon: FileSignature },
  { href: "/client/dashboard", label: "Quotes", icon: Calculator },
  { href: "/client/dashboard", label: "Approvals", icon: CheckCircle },
  { href: "/client/dashboard", label: "Messages", icon: MessageSquare },
]

export function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode
  role: "admin" | "talent" | "client"
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Admins are redirected to /admin before this shell renders, so only the
  // talent and client navs remain here.
  const NAV = role === "talent" ? TALENT_NAV : CLIENT_NAV

  return (
    <div className="dash-layout">
      {mobileOpen && <div className="dash-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside
        className={cn(
          "dash-sidebar",
          collapsed && "dash-sidebar--collapsed",
          mobileOpen && "dash-sidebar--mobile-open"
        )}
      >
        <div className="dash-sidebar-head">
          <Link href="/" className="dash-brand" onClick={() => setMobileOpen(false)}>
            <span className="dash-brand-word">
              Synthos <em>Creative Intelligence</em>
            </span>
          </Link>
          <div className="dash-sidebar-actions">
            <button
              className="dash-collapse"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              className="dash-sidebar-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="dash-nav">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin/workflow/overview" &&
                item.href !== "/dashboard/talent" &&
                pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("dash-nav-item", active && "dash-nav-item--active")}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} />
                {!collapsed && <span className="dash-nav-label">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="dash-sidebar-foot">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span className="dash-ai-status">
              <span className="dash-ai-dot" />
              {!collapsed && <span>AI online</span>}
            </span>
            <NotificationBell />
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-toolbar">
          <button
            className="dash-mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}
