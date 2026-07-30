import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function CompanyPendingPage() {
  return (
    <AuthLayout>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--ink)", fontWeight: 500, marginBottom: 12 }}>Application Submitted</h1>
        <p style={{ fontSize: "0.92rem", color: "var(--ink-3)", lineHeight: 1.6, marginBottom: 24 }}>
          Thank you for registering your company. Our team will review your application and verify your business details. This usually takes 24–48 hours.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/" className="btn btn-ghost">Back to Home</Link>
          <Link href="/sign-in" className="btn btn-signal">Sign In</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
