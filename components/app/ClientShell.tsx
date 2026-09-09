"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  FileText,
  CheckSquare,
  MessageSquare,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { NotificationBell } from "./NotificationBell"
import "./admin.css"

const CLIENT_NAV = [
  { href: "/client/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/client/dashboard/creatives", label: "Browse Creatives", icon: Users },
  { href: "/client/dashboard", label: "Projects", icon: FolderOpen },
  { href: "/client/dashboard/meetings", label: "Meetings", icon: Calendar },
  { href: "/client/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/client/dashboard/briefs", label: "Briefs", icon: FileText },
  { href: "/client/dashboard/messages", label: "Messages", icon: MessageSquare },
]

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="admin-layout">
      {sidebarOpen && <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn("admin-sidebar", sidebarOpen && "admin-sidebar--open")}>
        <div className="admin-sidebar-head">
          <Link href="/" className="admin-brand" onClick={() => setSidebarOpen(false)}>
            <span className="admin-brand-word">Synthos <em>Client Portal</em></span>
          </Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {CLIENT_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/client/dashboard" && pathname.startsWith(item.href))
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
              Back to Site
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
