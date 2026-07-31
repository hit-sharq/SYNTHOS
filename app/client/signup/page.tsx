"use client"

import { useState } from "react"
import { useSignUp, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function ClientSignupPage() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { setActive } = useClerk()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!signUpLoaded) throw new Error("Sign up not loaded")

      const result = await signUp.create({
        emailAddress: email,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      const res = await fetch("/api/client/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, clerkId: result.createdUserId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create client account")
      }

      router.push("/client/login?registered=1")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandTitle="Your projects. <em>One place.</em>"
      brandDesc="Get access to proposals, quotes, deliverables, and approval gates. Transparent, structured, and always in your control."
    >
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1>Client Access</h1>
          <p>Create an account to view your projects.</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Full Name <span className="req">*</span></label>
            <div className="auth-input-wrap">
              <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="auth-field">
            <label>Email <span className="req">*</span></label>
            <div className="auth-input-wrap">
              <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="auth-field">
            <label>Company</label>
            <div className="auth-input-wrap">
              <input className="auth-input" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="auth-field">
            <label>Password <span className="req">*</span></label>
            <div className="auth-input-wrap">
              <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
          </div>

          <div className="auth-terms">
            <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
            <label htmlFor="terms" style={{ marginBottom: 0, textTransform: "none", letterSpacing: 0, fontSize: "0.82rem", color: "var(--ink-3)" }}>
              I agree to the <Link href="/" style={{ color: "var(--signal)" }}>Terms of Service</Link> and <Link href="/" style={{ color: "var(--signal)" }}>Privacy Policy</Link>.
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading || !agreed}>
            {loading && <span className="auth-btn-spinner" />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
