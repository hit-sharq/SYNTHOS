"use client"

import { useState, useEffect } from "react"
import { useSignUp, useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function ClientSignupPage() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { setActive } = useClerk()
  const { user, isLoaded: userLoaded } = useUser()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!userLoaded || !user) return
    const role = (user as any).publicMetadata?.role
    if (role === "client" || role === "company") {
      router.push("/client/dashboard")
    } else if (role === "talent") {
      setError("You are already signed in as a Talent. Client and Talent accounts are separate. Please sign out first if you want to create a Client account, or use a different browser or incognito window.")
    } else if (role === "admin") {
      setError("You are already signed in as an Admin. Admin accounts cannot create Client accounts. Please sign out or use a different browser.")
    }
  }, [user, userLoaded, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!signUpLoaded) throw new Error("Sign up not loaded")

      await signUp.create({
        emailAddress: email,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setVerifying(true)

    try {
      if (!signUp) throw new Error("Sign up not loaded")

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      await setActive({ session: result.createdSessionId })

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
      setVerifying(false)
    }
  }

  return (
    <AuthLayout
      brandTitle="Hire talent.<br/><em>One place.</em>"
      brandDesc="Create an account to manage your projects, review proposals and quotes, and track creative delivery — or browse the talent marketplace."
    >
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1>Client Access</h1>
          <p>Create an account to hire talent and manage projects.</p>
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
              I agree to the <Link href="/terms" style={{ color: "var(--signal)" }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: "var(--signal)" }}>Privacy Policy</Link>.
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading || !agreed}>
            {loading && <span className="auth-btn-spinner" />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {pendingVerification && (
          <form onSubmit={handleVerify} style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <div className="auth-form-header">
              <h1>Verify Your Email</h1>
              <p>We've sent a verification code to {email}. Enter it below to complete your registration.</p>
            </div>

            <div className="auth-field">
              <label>Verification Code <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <input className="auth-input" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required placeholder="123456" autoFocus />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={verifying}>
              {verifying && <span className="auth-btn-spinner" />}
              {verifying ? "Verifying…" : "Verify Email"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
