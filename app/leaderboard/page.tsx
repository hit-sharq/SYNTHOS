"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { PageHead, PageWrap } from "@/components/app/Page"
import LevelBadge from "@/components/app/LevelBadge"

async function fetchLeaderboard() {
  const res = await fetch("/api/leaderboard")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

const TIER_META: Record<string, { emoji: string; label: string }> = {
  New: { emoji: "🌱", label: "Just getting started" },
  Rising: { emoji: "📈", label: "Building momentum" },
  Established: { emoji: "🔥", label: "Known in the community" },
  Featured: { emoji: "⭐", label: "Hand-picked talent" },
  Elite: { emoji: "👑", label: "Top of the mountain" },
}

export default function LeaderboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  })

  const tiers = data?.tiers || []
  const top = data?.top || []

  return (
    <PageWrap>
      <PageHead
        eyebrow="// Leaderboard"
        title="Top creators"
        desc="The most accomplished creators on Synthos, ranked by level and XP."
      />

      {isLoading && <div className="panel p-5 mt-6"><p className="muted">Loading leaderboard…</p></div>}
      {error && <p style={{ color: "var(--rejected)" }}>Failed to load</p>}

      <div className="stack gap-8 mt-6">
        {/* Tier breakdown */}
        <section>
          <h2 className="section-title">Tiers</h2>
          <div className="stack gap-2">
            {tiers.map((t: any) => (
              <div key={t.tier} className="panel" style={{ padding: "16px 20px", borderRadius: 0 }}>
                <div className="row gap-4 items-center">
                  <div
                    style={{
                      width: 40, height: 40, display: "grid", placeItems: "center",
                      borderRadius: "50%", fontFamily: "var(--font-mono)",
                      fontWeight: 700, fontSize: "0.82rem", color: "#fff",
                      background: t.badgeColor, flexShrink: 0,
                    }}
                  >
                    {t.level}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{t.title}</p>
                    <p className="tiny mono" style={{ color: "var(--ink-3)", margin: 0 }}>{t.xpRequired} XP required</p>
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "var(--ink-2)" }}>
                    {TIER_META[t.title]?.emoji} {TIER_META[t.title]?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top creators */}
        <section>
          <h2 className="section-title">Top creators</h2>
          <div className="stack gap-2">
            {top.map((u: any, i: number) => (
              <div
                key={u.id}
                className="panel"
                style={{ padding: "12px 20px", borderRadius: 0, display: "flex", alignItems: "center", gap: 16 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)", color: "var(--ink-3)",
                    width: 32, fontSize: "0.82rem", fontWeight: 700,
                  }}
                >
                  #{i + 1}
                </span>
                <div
                  style={{
                    width: 36, height: 36, display: "grid", placeItems: "center",
                    borderRadius: "50%", background: "var(--surface-2)",
                    color: "var(--ink)", fontFamily: "var(--font-mono)",
                    fontWeight: 700, fontSize: "0.78rem", flexShrink: 0,
                  }}
                >
                  {u.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0, fontSize: "0.92rem" }}>
                    {u.talentId
                      ? <Link href={`/talents/${u.talentId}`} className="hover:underline" style={{ color: "var(--ink)", textDecoration: "none" }}>{u.name}</Link>
                      : u.name}
                  </p>
                  <LevelBadge level={u.level} levelXP={u.levelXP} size="sm" />
                </div>
                <span className="mono tiny" style={{ color: "var(--ink-2)" }}>
                  {u.levelXP.toLocaleString()} XP
                </span>
                <span className="mono tiny" style={{ color: "var(--muted-foreground)", width: 60, textAlign: "right" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""}
                </span>
              </div>
            ))}
            {top.length === 0 && (
              <div className="panel p-8 text-center" style={{ borderRadius: 0 }}>
                <p className="muted">No creators at level 4+ yet. Be the first!</p>
              </div>
            )}
          </div>
        </section>

        <div className="row gap-3">
          <Link href="/profile" className="btn btn-ghost btn-sm">My Profile</Link>
          <Link href="/spotlight" className="btn btn-ghost btn-sm">Spotlight</Link>
        </div>
      </div>
    </PageWrap>
  )
}