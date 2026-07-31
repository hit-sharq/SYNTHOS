"use client"

import { useState, useEffect } from "react"
import { useSignIn, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function ClientLoginPage() {
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { setActive, user } = useClerk()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRegistered(window.location.search.includes("registered=1"))
    }
    if (user) {
      router.push("/client/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!signInLoaded) throw new Error("Sign in not loaded")

      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/client/dashboard")
      } else {
        setError("Additional verification required")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandTitle="Track your projects. <em>Review & approve.</em>"
      brandDesc="Clients get token-based access to proposals, quotes, and deliverables. No account needed to view — but logging in gives you the full experience."
    >
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1>Welcome back</h1>
          <p>Log in to access your projects.</p>
        </div>

        {registered && (
          <div className="auth-success">
            Account created. Please log in.
          </div>
        )}

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
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/client/signup">Sign up</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
