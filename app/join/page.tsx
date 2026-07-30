import Link from "next/link"
import { BrandMark } from "@/components/app/Header"

export default function JoinPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "20px 32px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/">
          <BrandMark />
        </Link>
      </header>
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--ink)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Join Synthos
            </h1>
            <p style={{ fontSize: "0.92rem", color: "var(--ink-3)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
              Choose how you want to use the platform. Creators join the workspace. Clients manage their projects.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Link
              href="/sign-up?role=talent"
              style={{
                display: "block",
                padding: "32px 28px",
                border: "2px solid var(--ink)",
                background: "var(--bg)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--signal)", marginBottom: 10, fontWeight: 600 }}>
                Creators & Talents
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "var(--ink)", fontWeight: 500, marginBottom: 8 }}>
                Join as Talent
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
                Build your profile, collaborate on projects, and grow with AI-assisted creative workflows.
              </div>
            </Link>

            <Link
              href="/client/signup"
              style={{
                display: "block",
                padding: "32px 28px",
                border: "2px solid var(--line)",
                background: "var(--bg)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 10, fontWeight: 600 }}>
                Brands & Companies
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "var(--ink)", fontWeight: 500, marginBottom: 8 }}>
                Join as Client
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
                Start a project, review proposals and quotes, and track creative delivery in one place.
              </div>
            </Link>

            <Link
              href="/company/signup"
              style={{
                display: "block",
                padding: "32px 28px",
                border: "2px solid var(--line)",
                background: "var(--bg)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 10, fontWeight: 600 }}>
                Employers
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "var(--ink)", fontWeight: 500, marginBottom: 8 }}>
                Post Jobs
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
                Register your company and post verified jobs for Kenyan talent.
              </div>
            </Link>
          </div>

          <p style={{ marginTop: 32, fontSize: "0.88rem", color: "var(--ink-3)", textAlign: "center" }}>
            Already have an account? <Link href="/sign-in" style={{ color: "var(--signal)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
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
