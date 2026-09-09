"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"
import "@/components/app/dashboard.css"

type Creative = {
  id: string
  name: string
  email: string
  skills: string[]
  experience: number
  rating: number
  availability: string
  rate: string
  portfolio?: string | null
  notes?: string | null
}

export default function ClientCreativesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/client/login"); return }
    fetch("/api/creatives")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any) => setCreatives(data.talent || []))
      .catch(() => setError("Failed to load creatives"))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  const filtered = creatives.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading creatives…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load creatives" message={error} /></PageWrap>
  }

  return (
    <PageWrap>
      <PageHead
        eyebrow="Client"
        title="Browse Creatives"
        desc="Find and connect with available creative talent."
        actions={<input className="admin-input" style={{ maxWidth: 300 }} placeholder="Search by name, skill..." value={search} onChange={e => setSearch(e.target.value)} />}
      />
      {filtered.length === 0 ? (
        <Empty title="No creatives found" hint={search ? "Try a different search term." : "No available creatives at the moment."} />
      ) : (
        <StaggerContainer>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {filtered.map((c) => (
              <RevealOnScroll key={c.id}>
                <div className="panel-soft" style={{ padding: 20, display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--ink-3)" }}>
                      {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.95rem" }}>{c.name}</span>
                      <span className="tiny muted" style={{ display: "block" }}>{c.rate || "Rate on request"}</span>
                    </div>
                  </div>
                  {c.rating > 0 && (
                    <div style={{ fontSize: "0.82rem", color: "var(--ink-2)", marginBottom: 8 }}>★ {c.rating.toFixed(1)} · {c.experience} years</div>
                  )}
                  {c.skills && c.skills.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {c.skills.map((s) => (
                        <span key={s} className="chip" style={{ fontSize: "0.72rem" }}>{s}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                    {c.portfolio && (
                      <a href={c.portfolio} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Portfolio</a>
                    )}
                    <button className="btn btn-signal btn-sm">Contact</button>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
