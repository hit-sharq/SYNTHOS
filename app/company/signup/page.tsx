"use client"

import { useState } from "react"
import { useSignUp, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function CompanySignupPage() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { setActive } = useClerk()
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

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

      const res = await fetch("/api/company/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          website,
          industry,
          location,
          slug,
          clerkId: result.createdUserId,
        }),
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
    <AuthLayout>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--ink)", fontWeight: 500, marginBottom: 8 }}>Register Your Company</h1>
          <p style={{ fontSize: "0.92rem", color: "var(--ink-3)" }}>Create an account to post jobs and hire Kenyan talent.</p>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--rejected-soft)", border: "1px solid var(--rejected)", color: "var(--rejected)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-grid-2">
            <div className="field">
              <label>Company Name <span style={{ color: "var(--signal)" }}>*</span></label>
              <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Industry</label>
              <input className="admin-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology, Finance" />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Email <span style={{ color: "var(--signal)" }}>*</span></label>
              <input className="admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="admin-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000000" />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Website</label>
              <input className="admin-input" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.co.ke" />
            </div>
            <div className="field">
              <label>Location</label>
              <input className="admin-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nairobi, Kenya" />
            </div>
          </div>

          <div className="field">
            <label>Password <span style={{ color: "var(--signal)" }}>*</span></label>
            <input className="admin-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>

          <button type="submit" className="btn btn-signal" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account…" : "Create Company Account"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: "0.88rem", color: "var(--ink-3)", textAlign: "center" }}>
          Already have an account? <Link href="/sign-in" style={{ color: "var(--signal)" }}>Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
