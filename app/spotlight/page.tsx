"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageHead, PageWrap } from "@/components/app/Page"
import LevelBadge from "@/components/app/LevelBadge"

async function fetchSpotlights() {
  const res = await fetch("/api/spotlights")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

async function fetchLeaderboard() {
  const res = await fetch("/api/leaderboard")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function SpotlightPage() {
  const { data: spotlightData, isLoading: sLoading } = useQuery({
    queryKey: ["spotlights"],
    queryFn: fetchSpotlights,
  })

  const { data: lbData, isLoading: lLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  })

  const spotlights = spotlightData?.spotlights || []
  const tiers = lbData?.tiers || []
  const top = lbData?.top || []

  return (
    <PageWrap>
      <PageHead
        eyebrow="// Spotlight"
        title="Featured creators"
        desc="The brightest minds on Synthos. Hand-picked by our team for outstanding work."
      />

      <div className="stack gap-8 mt-6">
        {/* Spotlight Creators */}
        <section>
          <h2 className="section-title">Creator Spotlight</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sLoading && <div className="panel p-5"><p className="muted">Loading...</p></div>}
            {spotlights.map((s: any) => (
              <div key={s.id} className="panel p-5" style={{ borderRadius: 0 }}>
                {s.imageUrl && (
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    style={{ width: "100%", height: 160, objectFit: "cover", marginBottom: 12 }}
                  />
                )}
                <span className="chip" style={{ marginBottom: 8 }}>{s.category}</span>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--ink)", marginBottom: 4 }}>
                  {s.title}
                </h3>
                {s.subtitle && <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: 8 }}>{s.subtitle}</p>}
                <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.6 }}>{s.content}</p>
              </div>
            ))}
          </div>
          {spotlights.length === 0 && <p className="muted mt-4">No spotlights yet.</p>}
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="section-title">Leaderboard</h2>
          <div className="panel" style={{ borderRadius: 0, overflow: "hidden" }}>
            {lLoading && <div style={{ padding: 24 }}><p className="muted">Loading...</p></div>}
            {tiers.map((t: any) => (
              <div
                key={t.tier}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px", borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, display: "grid", placeItems: "center",
                    background: t.badgeColor, color: "#fff", fontFamily: "var(--font-mono)",
                    fontWeight: 700, fontSize: "0.78rem",
                  }}
                >
                  {t.level}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{t.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>{t.xpRequired} XP required</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>Top creators</p>
                </div>
              </div>
            ))}
            <div style={{ padding: 20 }}>
              {top.map((u: any, i: number) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 0", borderBottom: i < top.length - 1 ? "1px solid var(--line)" : "none",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", width: 24, fontSize: "0.82rem" }}>
                    #{i + 1}
                  </span>
                  <div style={{ width: 32, height: 32, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--ink)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.72rem" }}>
                    {u.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.88rem" }}>{u.name}</p>
                    <LevelBadge level={u.level} levelXP={u.levelXP} size="sm" />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: "0.78rem" }}>
                    {u.levelXP} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageWrap>
  )
}
