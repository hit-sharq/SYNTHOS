"use client"

import { useState, useEffect } from "react"
import { useSignUp, useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function TalentSignupPage() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { setActive } = useClerk()
  const { user, isLoaded: userLoaded } = useUser()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [skills, setSkills] = useState("")
  const [experience, setExperience] = useState("")
  const [rate, setRate] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!userLoaded || !user) return
    const role = (user as any).publicMetadata?.role
    if (role === "talent") {
      router.push("/dashboard/talent")
    } else if (role) {
      setError(`You are already signed in as a ${role === "client" ? "Client" : role === "company" ? "Company" : role}. Please sign out first if you want to create a Talent account. Use a different browser or incognito window, or contact support if you need to change your role.`)
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
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      const res = await fetch("/api/talent/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean),
          experience: parseInt(experience) || 0,
          rate,
          portfolio,
          clerkId: result.createdUserId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create talent account")
      }

      router.push("/talents/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandTitle="Showcase your <em>creative talent.</em>"
      brandDesc="Join the creator network. Build your profile, set your rate, and get matched with projects that fit your skills."
    >
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1>Creator Sign Up</h1>
          <p>Create your talent profile and start collaborating.</p>
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
              <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" />
            </div>
          </div>
          <div className="auth-field">
            <label>Email <span className="req">*</span></label>
            <div className="auth-input-wrap">
              <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
            </div>
          </div>
          <div className="auth-field">
            <label>Skills <span className="req">*</span></label>
            <div className="auth-input-wrap">
              <input className="auth-input" value={skills} onChange={(e) => setSkills(e.target.value)} required placeholder="writing, strategy, design (comma separated)" />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="auth-field">
              <label>Experience (years)</label>
              <div className="auth-input-wrap">
                <input className="auth-input" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="3" min="0" />
              </div>
            </div>
            <div className="auth-field">
              <label>Rate</label>
              <div className="auth-input-wrap">
                <input className="auth-input" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="$500/day" />
              </div>
            </div>
          </div>
          <div className="auth-field">
            <label>Portfolio URL</label>
            <div className="auth-input-wrap">
              <input className="auth-input" type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yourportfolio.com" />
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
            {loading ? "Creating account…" : "Create Talent Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
