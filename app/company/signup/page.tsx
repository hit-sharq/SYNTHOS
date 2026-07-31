"use client"

import { useState, useEffect } from "react"
import { useSignUp, useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function CompanySignupPage() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { setActive } = useClerk()
  const { user, isLoaded: userLoaded } = useUser()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!userLoaded || !user) return
    const role = (user as any).publicMetadata?.role
    if (role === "company" || role === "client") {
      router.push("/company/jobs")
    } else if (role === "talent") {
      setError("You are already signed in as a Talent. Company and Talent accounts are separate. Please sign out first if you want to register a company, or use a different browser or incognito window.")
    } else if (role === "admin") {
      setError("You are already signed in as an Admin. Admin accounts cannot register companies. Please sign out or use a different browser.")
    }
  }, [user, userLoaded, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!signUpLoaded) throw new Error("Sign up not loaded")

      const result = await signUp.create({
        emailAddress: email,
        password: password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

      const payload = {
        name: name,
        email: email,
        phone: phone,
        website: website,
        industry: industry,
        location: location,
        slug: slug,
        clerkId: result.createdUserId,
      }

      const res = await fetch("/api/company/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create company account")
      }

      router.push("/company/pending")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandTitle="Post jobs.<br/>Hire <em>verified talent.</em>"
      brandDesc="Register your company to post curated roles, review applications, and hire creative professionals from the Synthos talent marketplace."
    >
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1>Register Your Company</h1>
          <p>Create an account to post jobs and hire talent.</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="auth-field">
              <label>Company Name <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="auth-field">
              <label>Industry</label>
              <div className="auth-input-wrap">
                <input className="auth-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology, Finance" />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="auth-field">
              <label>Email <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="auth-field">
              <label>Phone</label>
              <div className="auth-input-wrap">
                <input className="auth-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000000" />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="auth-field">
              <label>Website</label>
              <div className="auth-input-wrap">
                <input className="auth-input" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.co.ke" />
              </div>
            </div>
            <div className="auth-field">
              <label>Location</label>
              <div className="auth-input-wrap">
                <input className="auth-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nairobi, Kenya" />
              </div>
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
              I agree to the <Link href="/terms" style={{ color: "var(--signal)" }}>Terms</Link> and <Link href="/privacy" style={{ color: "var(--signal)" }}>Privacy Policy</Link>.
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading || !agreed}>
            {loading && <span className="auth-btn-spinner" />}
            {loading ? "Creating account…" : "Create Company Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/company/login">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
