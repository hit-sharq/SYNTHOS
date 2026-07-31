"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser, UserButton } from "@clerk/nextjs"
import { Bell, X, Check } from "lucide-react"

import "./header.css"

export function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="brandmark" aria-label="Synthos home">
      <span className="brandmark-mark" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 17 L9 6 L13 13 L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="19" cy="4" r="2.1" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="brandmark-word">
          Synthos
          <em>Creative Intelligence</em>
        </span>
      )}
    </Link>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { user, isLoaded, isSignedIn } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/auth/is-admin")
        .then(res => res.json())
        .then(data => {
          setIsAdmin(data.isAdmin)
          if (data.isAdmin) setUserRole("admin")
        })
      fetch("/api/auth/role")
        .then(res => res.json())
        .then(data => {
          if (data.role) setUserRole(data.role)
          if (data.companyId) setCompanyId(data.companyId)
        })
        .catch(() => {})
    } else {
      setIsAdmin(false)
      setUserRole(null)
      setCompanyId(null)
    }
  }, [isSignedIn])

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          setNotifications(data.notifications || [])
          setUnread(data.unread || 0)
        })
        .catch(() => {})
    }
  }, [isSignedIn])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(Math.max(0, unread - 1))
  }

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id)
    setNotifOpen(false)
    if (n.refId) {
      router.push(`/dashboard/projects/${n.refId}`)
    }
  }

  const markAllAsRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => fetch(`/api/notifications/${n.id}`, { method: "PATCH" })))
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }

    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside as any)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside as any)
    }
  }, [notifOpen])

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <BrandMark />
        </div>

        <nav className={`topnav ${open ? "open" : ""}`} aria-label="Main navigation">
          <Link href="/" className={`topnav-link ${pathname === "/" ? "active" : ""}`} onClick={() => setOpen(false)}>Home</Link>
          <Link href="/talents" className={`topnav-link ${pathname === "/talents" ? "active" : ""}`} onClick={() => setOpen(false)}>Talent</Link>
          <Link href="/jobs" className={`topnav-link ${pathname === "/jobs" ? "active" : ""}`} onClick={() => setOpen(false)}>Jobs</Link>
          <Link href="/companies" className={`topnav-link ${pathname === "/companies" || pathname.startsWith("/companies") ? "active" : ""}`} onClick={() => setOpen(false)}>Companies</Link>
          {!isSignedIn && (
            <Link href="/talent/signup" className={`topnav-link ${pathname === "/talent/signup" ? "active" : ""}`} onClick={() => setOpen(false)}>Join</Link>
          )}
           {isSignedIn && isAdmin && (
            <>
              <Link
                href="/dashboard/overview"
                className={`topnav-link ${pathname === "/dashboard/overview" || pathname.startsWith("/dashboard") ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admin"
                className={`topnav-link ${pathname === "/admin" || pathname.startsWith("/admin") ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            </>
          )}
          {isSignedIn && userRole === "client" && companyId && (
            <>
              <Link href="/company/dashboard" className={`topnav-link ${pathname === "/company/dashboard" ? "active" : ""}`} onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/company/jobs" className={`topnav-link ${pathname === "/company/jobs" ? "active" : ""}`} onClick={() => setOpen(false)}>My Jobs</Link>
              <Link href="/company/jobs/new" className={`topnav-link ${pathname === "/company/jobs/new" ? "active" : ""}`} onClick={() => setOpen(false)}>Post Job</Link>
            </>
          )}
          {isSignedIn && userRole === "client" && !companyId && (
            <Link href="/client/dashboard" className={`topnav-link ${pathname === "/client/dashboard" ? "active" : ""}`} onClick={() => setOpen(false)}>Client Dashboard</Link>
          )}
        </nav>

        <div className="topbar-right">
          {!isLoaded ? (
            <div style={{ width: 32, height: 32, background: "var(--surface-2)", borderRadius: "50%" }} />
          ) : isSignedIn ? (
            <>
              <div ref={notifRef} style={{ position: "relative" }}>
                <button className="iconbtn" aria-label="Notifications" title="Notifications" onClick={() => setNotifOpen((v) => !v)}>
                  <Bell size={18} strokeWidth={1.8} />
                  {unread > 0 && <span className="iconbtn-count">{unread}</span>}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-head">
                      <span style={{ fontWeight: 600, fontSize: "0.86rem" }}>Notifications</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {unread > 0 && (
                          <button className="notif-mark-read" onClick={markAllAsRead}>
                            <Check size={12} /> Mark all read
                          </button>
                        )}
                        <button className="notif-close" onClick={() => setNotifOpen(false)}><X size={14} /></button>
                      </div>
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-item">
                          <p style={{ fontSize: "0.84rem", color: "var(--ink)" }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`notif-item ${!n.read ? "notif-item--unread" : ""}`} onClick={() => handleNotificationClick(n)} style={{ cursor: "pointer" }}>
                            <p style={{ fontSize: "0.84rem", color: "var(--ink)", fontWeight: !n.read ? 600 : 400 }}>{n.title}</p>
                            <p style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginTop: 2 }}>{n.message}</p>
                            <span className="tiny muted" style={{ marginTop: 4, display: "block" }}>{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link href="/sign-in" className="btn btn-signal btn-sm">Get Started</Link>
          )}
          <button className={`topbar-burger ${open ? "open" : ""}`} onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
