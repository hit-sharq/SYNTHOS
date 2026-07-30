"use client"

import { useState } from "react"
import { useSignIn, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function CompanyLoginPage() {
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { setActive } = useClerk()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!signInLoaded) throw new Error("Sign in not loaded")

      const result = await signIn.create({
        emailAddress: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/company/jobs")
      } else {
        router.push("/company/pending")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--ink)", fontWeight: 500, marginBottom: 8 }}>Company Login</h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>Access your company dashboard to manage jobs.</p>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label>Email <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-signal" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: "0.88rem", color: "var(--ink-3)", textAlign: "center" }}>
          Don't have an account? <Link href="/company/signup" style={{ color: "var(--signal)" }}>Register</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
