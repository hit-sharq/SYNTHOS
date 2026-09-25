"use client"

import { useState } from "react"
import Link from "next/link"
import { FollowButton } from "@/components/app/FollowButton"
import LevelBadge from "@/components/app/LevelBadge"

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

interface TalentCardProps {
  talent: {
    id: string
    name: string
    skills: string[]
    experience: number
    rating: number
    availability: string
    rate: string | null
    notes: string | null
    user: { level: number; levelXP: number } | null
  }
  followers: number
}

export function TalentCard({ talent, followers }: TalentCardProps) {
  const tier = getTierForLevel(talent.user?.level || 1)
  const tierColor = TIER_COLORS[tier]

  return (
    <div className="blog-card" style={{ borderLeft: `3px solid ${tierColor}` }}>
      <div className="blog-card-body">
        <div className="row gap-2 items-center flex-wrap" style={{ marginBottom: 4 }}>
          <h3 style={{ margin: 0 }}>{talent.name}</h3>
          {talent.user && <LevelBadge level={talent.user.level} levelXP={talent.user.levelXP} size="sm" />}
        </div>
        <span className="tiny mono" style={{ color: tierColor }}>{tier}</span>
        {talent.skills.length > 0 && (
          <div className="row gap-2 wrap" style={{ marginTop: 10, marginBottom: 10 }}>
            {talent.skills.slice(0, 5).map((skill) => (
              <span key={skill} className="chip">{skill}</span>
            ))}
          </div>
        )}
        <div className="row gap-2 wrap" style={{ marginBottom: 10 }}>
          {talent.experience > 0 && <span className="chip">{talent.experience}y exp</span>}
          {talent.rate && <span className="chip">{talent.rate}</span>}
          <span
            className="chip"
            style={{
              color:
                talent.availability === "available"
                  ? "var(--approved)"
                  : talent.availability === "busy"
                    ? "var(--review)"
                    : "var(--rejected)",
              background: "var(--surface-2)",
            }}
          >
            {talent.availability}
          </span>
        </div>
        {talent.notes && (
          <p
            className="tiny"
            style={{ color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {talent.notes}
          </p>
        )}
        <div className="row gap-3 mt-2" style={{ alignItems: "center" }}>
          <FollowButton talentId={talent.id} size="sm" />
          <Link href={`/talents/${talent.id}`} className="tiny" style={{ color: "var(--signal)", marginLeft: "auto" }}>
            View profile →
          </Link>
          {followers > 0 && (
            <span className="tiny" style={{ color: "var(--ink-3)" }}>
              <strong style={{ color: "var(--ink-2)" }}>{followers}</strong> followers
            </span>
          )}
        </div>
      </div>
    </div>
  )
}