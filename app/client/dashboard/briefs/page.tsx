"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileText } from "lucide-react"
import { PageHead, PageWrap } from "@/components/app/Page"
import { Empty, ErrorState } from "@/components/app/ui"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "@/components/app/admin.css"

type Brief = {
  id: string
  projectId: string
  projectName: string
  title: string
  businessObjective: string
  timeline: string
}

export default function ClientBriefsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/client/login"); return }
    fetch("/api/client/data")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data: any) => {
        const list: Brief[] = []
        for (const p of data.projects || []) {
          if (p.brief) {
            list.push({
              id: p.brief.id,
              projectId: p.id,
              projectName: p.name,
              title: p.brief.title || p.name,
              businessObjective: p.brief.businessObjective || "",
              timeline: p.brief.timeline || "",
            })
          }
        }
        setBriefs(list)
      })
      .catch(() => setError("Failed to load briefs"))
      .finally(() => setLoading(false))
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading briefs…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load briefs" message={error} /></PageWrap>
  }

  return (
    <PageWrap>
      <PageHead eyebrow="Client" title="Briefs" desc="AI-generated briefs for your projects." />
      {briefs.length === 0 ? (
        <Empty title="No briefs yet" hint="Briefs are generated during the discovery phase of your project." />
      ) : (
        <StaggerContainer>
          <div className="stack gap-2">
            {briefs.map((b) => (
              <RevealOnScroll key={b.id}>
                <Link href={`/public/project/${b.projectId}`} className="panel-soft" style={{ padding: 20, display: "block", textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <FileText size={18} style={{ color: "var(--signal)" }} />
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{b.title}</span>
                  </div>
                  <p className="tiny muted" style={{ marginBottom: 4 }}>{b.projectName}</p>
                  {b.businessObjective && <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.6 }}>{b.businessObjective}</p>}
                  {b.timeline && <p className="tiny muted" style={{ marginTop: 6 }}>Timeline: {b.timeline}</p>}
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </StaggerContainer>
      )}
    </PageWrap>
  )
}
