"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PageHead, PageWrap } from "@/components/app/Page"

async function fetchAllChallenges() {
  const res = await fetch("/api/challenges")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function LeaderboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchAllChallenges,
  })

  const challenges = data?.challenges || []

  return (
    <PageWrap>
      <PageHead
        eyebrow="// Leaderboard"
        title="Top creators"
        desc="The most accomplished creators on Synthos, ranked by level and XP."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel p-5"><p className="muted">Loading...</p></div>
        ))}
        {error && <p style={{ color: "var(--rejected)" }}>Failed</p>}

        {challenges.slice(0, 3).map((c: any, i: number) => (
          <div key={c.id} className="panel p-5" style={{ borderRadius: 0, textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, display: "grid", placeItems: "center",
              borderRadius: "50%", margin: "0 auto 16px",
              background: i === 0 ? "var(--signal)" : i === 1 ? "var(--ink-3)" : "var(--approved)",
              color: "#fff", fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-mono)",
            }}>
              {i + 1}
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--ink)", marginBottom: 4 }}>
              {c.title}
            </h3>
            <p className="tiny muted">{c._count?.submissions || 0} submissions</p>
          </div>
        ))}
      </div>

      <div className="panel mt-8" style={{ borderRadius: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>Active Challenges</h2>
        </div>
        {challenges.map((c: any, i: number) => (
          <div key={c.id} style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "12px 20px", borderBottom: "1px solid var(--line)",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", width: 24 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{c.title}</p>
              <p className="tiny" style={{ color: "var(--ink-3)" }}>{c.description?.slice(0, 80)}</p>
            </div>
            <span className="chip">{c._count?.submissions || 0} entries</span>
            <span className="chip" style={{ color: c.status === "open" ? "var(--approved)" : "var(--ink-3)", background: c.status === "open" ? "var(--approved-soft)" : "var(--surface-2)" }}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </PageWrap>
  )
}
