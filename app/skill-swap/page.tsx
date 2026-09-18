"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageHead, PageWrap } from "@/components/app/Page"
import LevelBadge from "@/components/app/LevelBadge"

async function fetchPublicSwaps() {
  const res = await fetch("/api/skill-swaps/public")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function SkillSwapPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["skill-swaps"],
    queryFn: fetchPublicSwaps,
  })

  const swaps = data?.swaps || []

  return (
    <PageWrap>
      <PageHead
        eyebrow="// Skill Swap"
        title="Trade skills"
        desc="Offer your skills and find creators who have what you need. No money — just trade."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {isLoading && <div className="panel p-5"><p className="muted">Loading...</p></div>}
        {error && <div className="panel p-5"><p style={{ color: "var(--rejected)" }}>Failed</p></div>}

        {swaps.map((s: any) => (
          <div key={s.id} className="panel p-5" style={{ borderRadius: 0 }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <span className="chip" style={{ color: "var(--signal-ink)", background: "var(--signal-soft)", border: "1px solid var(--signal)" }}>
                {s.status}
              </span>
            </div>
            <div className="stack gap-1" style={{ marginBottom: 12 }}>
              <div className="row gap-2" style={{ alignItems: "center" }}>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold" style={{ background: "var(--surface-2)", color: "var(--ink)" }}>
                  {s.user?.initials?.[0] || "?"}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.92rem" }}>{s.user?.name || "Anonymous"}</p>
                  <LevelBadge level={s.user?.level || 1} levelXP={s.user?.levelXP || 0} size="sm" />
                </div>
              </div>
            </div>
            <div className="stack gap-2" style={{ marginBottom: 12 }}>
              <div style={{ padding: "8px 12px", background: "var(--signal-soft)", border: "1px solid var(--signal)", fontSize: "0.82rem" }}>
                <span className="mono" style={{ color: "var(--signal-ink)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Offers</span>
                <br/>
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.offerSkill}</span>
              </div>
              <div className="row" style={{ justifyContent: "center", color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                &#8597;
              </div>
              <div style={{ padding: "8px 12px", background: "var(--human-soft)", border: "1px solid var(--human)", fontSize: "0.82rem" }}>
                <span className="mono" style={{ color: "var(--human-ink)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Wants</span>
                <br/>
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.wantSkill}</span>
              </div>
            </div>
            {s.description && <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", lineHeight: 1.6 }}>{s.description}</p>}
          </div>
        ))}
      </div>

      {swaps.length === 0 && (
        <div className="panel p-8 text-center mt-6">
          <p className="muted">No skill swaps yet. Be the first!</p>
        </div>
      )}
    </PageWrap>
  )
}
