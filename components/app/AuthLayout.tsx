"use client"

import Link from "next/link"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "20px 32px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: "var(--ink)" }}>
              <path d="M3 17 L9 6 L13 13 L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="4" r="2.1" fill="currentColor" />
            </svg>
          </span>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 500, letterSpacing: "-0.01em" }}>
            Synthos
            <em style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 400, fontStyle: "normal", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginLeft: 8 }}>Creative Intelligence</em>
          </span>
        </Link>
      </header>
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        {children}
      </main>
      <footer style={{ padding: "20px 32px", borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
          <span className="tiny muted">© {new Date().getFullYear()} Synthos. Human + AI creative intelligence.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/" className="tiny" style={{ color: "var(--ink-3)" }}>Home</Link>
            <Link href="/jobs" className="tiny" style={{ color: "var(--ink-3)" }}>Jobs</Link>
            <Link href="/intake" className="tiny" style={{ color: "var(--ink-3)" }}>Start a Project</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
