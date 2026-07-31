"use client"

import Link from "next/link"
import "./auth.css"

export function AuthLayout({ children, brandTitle, brandDesc }: { children: React.ReactNode; brandTitle?: string; brandDesc?: string }) {
  return (
    <div className="auth-wrap">
      <header className="auth-header">
        <div className="auth-header-inner">
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
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-brand">
          <div className="auth-brand-grid" />
          <div className="auth-brand-glow" />
          <div className="auth-shape auth-shape-1" />
          <div className="auth-shape auth-shape-2" />
          <div className="auth-shape auth-shape-3" />

          <div className="auth-brand-content">
            <div className="auth-brand-tag">Human + AI Creative Intelligence</div>
            <h2 className="auth-brand-title">
              {brandTitle || "The operating system for creative <em>intelligence.</em>"}
            </h2>
            <p className="auth-brand-desc">
              {brandDesc || "AI accelerates the work. Humans provide the judgment. From first brief to final greenlight — structured, attributed, and human-centered."}
            </p>

            <div className="auth-brand-stats">
              <div className="auth-brand-stat">
                <div className="auth-brand-stat-val">10</div>
                <div className="auth-brand-stat-lbl">Pipeline Stages</div>
              </div>
              <div className="auth-brand-stat">
                <div className="auth-brand-stat-val">AI + Human</div>
                <div className="auth-brand-stat-lbl">Decision Layer</div>
              </div>
              <div className="auth-brand-stat">
                <div className="auth-brand-stat-val">Swiss</div>
                <div className="auth-brand-stat-lbl">Precision</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          {children}
        </div>
      </main>

      <footer className="auth-footer-bar">
        <div className="auth-footer-inner">
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
