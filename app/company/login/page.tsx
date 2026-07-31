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
    <AuthLayout
      brandTitle="Welcome back to your <em>company dashboard.</em>"
      brandDesc="Manage jobs, review applications, and hire the best creative talent in the network."
    >
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1>Company Login</h1>
          <p>Access your company dashboard to manage jobs.</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email <span className="req">*</span></label>
            <div className="auth-input-wrap">
              <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="auth-field">
            <label>Password <span className="req">*</span></label>
            <div className="auth-input-wrap">
              <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading || !signInLoaded}>
            {loading && <span className="auth-btn-spinner" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/company/signup">Register</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
