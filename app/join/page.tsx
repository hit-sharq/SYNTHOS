import Link from "next/link"

export default function JoinPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--ink)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Join Synthos
          </h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
            Choose how you want to use the platform. Creators join the workspace. Clients manage their projects.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Link
            href="/sign-up?role=talent"
            style={{
              display: "block",
              padding: "28px 24px",
              border: "2px solid var(--ink)",
              background: "var(--bg)",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 8 }}>
              Creators
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--ink)", fontWeight: 500, marginBottom: 6 }}>
              Join as Talent
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
              Build your profile, collaborate on projects, and grow with AI-assisted creative workflows.
            </div>
          </Link>

          <Link
            href="/client/signup"
            style={{
              display: "block",
              padding: "28px 24px",
              border: "2px solid var(--line)",
              background: "var(--bg)",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 8 }}>
              Brands & Companies
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--ink)", fontWeight: 500, marginBottom: 6 }}>
              Join as Client
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
              Start a project, review proposals and quotes, and track creative delivery in one place.
            </div>
          </Link>
        </div>

        <p style={{ marginTop: 24, fontSize: "0.82rem", color: "var(--ink-3)", textAlign: "center" }}>
          Already have an account? <Link href="/sign-in" style={{ color: "var(--signal)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
