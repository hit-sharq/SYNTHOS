"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Briefcase, Users, Settings, Building2, ArrowLeft, Menu, X, FileText, MessageSquare } from "lucide-react"
import "./company-shell.css"

const COMPANY_NAV = [
  { href: "/company/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/company/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/company/applications", label: "Applications", icon: Users },
  { href: "/company/profile", label: "Profile", icon: Building2 },
  { href: "/company/messages", label: "Messages", icon: MessageSquare },
  { href: "/company/settings", label: "Settings", icon: Settings },
]

export function CompanyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="company-layout">
      {sidebarOpen && <div className="company-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn("company-sidebar", sidebarOpen && "company-sidebar--open")}>
        <div className="company-sidebar-head">
          <Link href="/" className="company-brand" onClick={() => setSidebarOpen(false)}>
            <span className="company-brand-word">Synthos <em>Company Hub</em></span>
          </Link>
          <button className="company-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="company-nav">
          {COMPANY_NAV.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={cn("company-nav-item", active && "company-nav-item--active")} onClick={() => setSidebarOpen(false)}>
                <Icon size={18} strokeWidth={1.8} />
                <span className="company-nav-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="company-sidebar-foot">
          <Link href="/" className="company-back" onClick={() => setSidebarOpen(false)}>
            <ArrowLeft size={14} /> Back to Site
          </Link>
        </div>
      </aside>

      <main className="company-main">
        <button className="company-mobile-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        {children}
      </main>
    </div>
  )
}
