"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PageHead, PageWrap } from "@/components/app/Page"
import LevelBadge from "@/components/app/LevelBadge"
import { Empty, ErrorState } from "@/components/app/ui"

export const dynamic = "force-dynamic"

async function fetchTalentProfile(id: string) {
  const res = await fetch(`/api/talents/${id}`)
  if (!res.ok) throw new Error("Failed to load profile")
  return res.json()
}

const TIER_COLORS: Record<string, string> = {
  New: "#888888",
  Rising: "#4a90d9",
  Established: "#27ae60",
  Featured: "#e67e22",
  Elite: "#0066ff",
}

function getTierForLevel(level: number) {
  if (level >= 5) return "Elite"
  if (level >= 4) return "Featured"
  if (level >= 3) return "Established"
  if (level >= 2) return "Rising"
  return "New"
}

export default function TalentProfilePage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("No talent ID provided")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setData(null)
    fetchTalentProfile(id as string)
      .then(setData)
      .catch((err: any) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading…</p></div></PageWrap>
  }

  if (error) {
    return <PageWrap><ErrorState title="Could not load profile" message={error} onRetry={() => window.location.reload()} /></PageWrap>
  }

  const talent = data?.talent
  const user = data?.user

  if (!talent) {
    return <PageWrap><Empty title="Talent not found" hint="This creator may have been removed." /></PageWrap>
  }

  const tier = user ? getTierForLevel(user.level) : "New"
  const tierColor = TIER_COLORS[tier]

  return (
    <PageWrap>
      <PageHead
        eyebrow="Creator Profile"
        title={talent.name}
        desc={talent.email}
      />

      <div className="stack gap-6">
        {/* Header */}
        <div className="panel" style={{ padding: 32, borderRadius: 12, position: "relative", overflow: "hidden" }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-10" style={{ background: tierColor }} />
          <div className="row gap-4 items-start" style={{ position: "relative", zIndex: 1 }}>
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-mono text-xl font-bold" style={{ background: `${tierColor}20`, color: tierColor, border: `2px solid ${tierColor}60` }}>
                {talent.name?.charAt(0) || "?"}
              </div>
              {user && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: tierColor }}>
                  {user.level}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="row gap-2 items-center flex-wrap">
                <h1 className="text-2xl font-bold" style={{ margin: 0 }}>{talent.name}</h1>
                {user && <LevelBadge level={user.level} levelXP={user.levelXP} size="sm" />}
              </div>
              <span className="text-sm" style={{ color: tierColor, fontFamily: "var(--font-mono)" }}>{tier}</span>
              <div className="row gap-3 mt-3 flex-wrap items-center">
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className={`w-2 h-2 rounded-full ${talent.availability === "available" ? "bg-green-500" : talent.availability === "busy" ? "bg-yellow-500" : "bg-gray-400"}`} />
                  <span style={{ color: "var(--ink-2)" }}>{talent.availability}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {talent.skills?.map((skill: string) => (
                <span key={skill} className="chip">{skill}</span>
              ))}
            </div>
            {talent.skills?.length === 0 && <p className="tiny muted">No skills listed</p>}
          </div>

          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">Details</h2>
            <div className="stack gap-2">
              <div className="row between gap-2">
                <span className="tiny" style={{ color: "var(--muted-foreground)" }}>Experience</span>
                <span className="tiny mono">{talent.experience || 0} years</span>
              </div>
              <div className="row between gap-2">
                <span className="tiny" style={{ color: "var(--muted-foreground)" }}>Rating</span>
                <span className="tiny mono">{(talent.rating || 0).toFixed(1)} / 5.0</span>
              </div>
              <div className="row between gap-2">
                <span className="tiny" style={{ color: "var(--muted-foreground)" }}>Rate</span>
                <span className="tiny mono">{talent.rate || "—"}</span>
              </div>
              <div className="row between gap-2">
                <span className="tiny" style={{ color: "var(--muted-foreground)" }}>Availability</span>
                <span className="tiny mono">{talent.availability}</span>
              </div>
            </div>
          </div>
        </div>

        {talent.notes && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">About</h2>
            <p style={{ color: "var(--ink-2)", lineHeight: 1.6, fontSize: "0.92rem", margin: 0 }}>{talent.notes}</p>
          </div>
        )}

        {talent.portfolio && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">Portfolio</h2>
            <a href={talent.portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-signal btn-sm">View Portfolio →</a>
          </div>
        )}

        <div className="row gap-3">
          <Link href="/talents" className="btn btn-ghost btn-sm">← All Talents</Link>
          <Link href="/jobs" className="btn btn-ghost btn-sm">Browse Jobs</Link>
        </div>
      </div>
    </PageWrap>
  )
}