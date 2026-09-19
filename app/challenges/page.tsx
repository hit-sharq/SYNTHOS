"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PageHead, PageWrap } from "@/components/app/Page"
import LevelBadge from "@/components/app/LevelBadge"

async function fetchChallenges() {
  const res = await fetch("/api/challenges")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

async function submitChallenge(challengeId: string, content: string) {
  const res = await fetch(`/api/challenges/${challengeId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function ChallengesPage() {
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [submitText, setSubmitText] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["challenges"],
    queryFn: fetchChallenges,
  })

  const submitMutation = useMutation({
    mutationFn: ({ challengeId, content }: { challengeId: string; content: string }) =>
      submitChallenge(challengeId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] })
    },
  })

  const challenges = data?.challenges || []

  return (
    <PageWrap>
      <PageHead
        eyebrow="// Creator Challenges"
        title="Prove your craft"
        desc="Join weekly creative challenges, compete with other creators, and earn XP and recognition."
      />

      {isLoading && <p className="muted">Loading challenges...</p>}
      {error && <p style={{ color: "var(--rejected)" }}>Failed to load challenges</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {challenges.map((c: any) => (
          <div key={c.id} className="panel p-5" style={{ borderRadius: 0 }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <span className="chip" style={{ color: "var(--signal-ink)", background: "var(--signal-soft)", border: "1px solid var(--signal)" }}>
                {c.status === "open" ? "Open" : c.status}
              </span>
              {c.featured && <span className="chip" style={{ color: "var(--approved)", background: "var(--approved-soft)" }}>Featured</span>}
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", marginBottom: 8, color: "var(--ink)" }}>
              {c.title}
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.6 }}>
              {c.description}
            </p>
            {c.createdByUser && (
              <div className="row gap-2 items-center mb-3" style={{ fontSize: "0.78rem" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: "var(--surface-2)", color: "var(--ink)" }}>
                  {c.createdByUser.initials}
                </div>
                <span style={{ color: "var(--ink-2)" }}>{c.createdByUser.name}</span>
                <LevelBadge level={c.createdByUser.level || 1} levelXP={c.createdByUser.levelXP || 0} size="sm" />
              </div>
            )}
            <div className="meta-row" style={{ marginBottom: 16 }}>
              <div className="meta-item">
                <strong>{c._count?.submissions || 0}</strong>
                Entries
              </div>
              <div className="meta-item">
                <strong>+100 XP</strong>
                Per entry
              </div>
            </div>
            <div className="stack gap-2">
              <textarea
                placeholder="Your submission..."
                style={{
                  width: "100%", minHeight: 80, padding: "10px 12px",
                  border: "1px solid var(--line)", background: "var(--surface)",
                  color: "var(--ink)", fontFamily: "inherit", fontSize: "0.88rem",
                  resize: "vertical", lineHeight: 1.5,
                }}
                value={submitText[c.id] || ""}
                onChange={e => setSubmitText(prev => ({ ...prev, [c.id]: e.target.value }))}
              />
              <button
                className="btn btn-primary btn-sm"
                disabled={submitting === c.id || !submitText[c.id]}
                onClick={() => {
                  setSubmitting(c.id)
                  submitMutation.mutate(
                    { challengeId: c.id, content: submitText[c.id] },
                    {
                      onSettled: () => {
                        setSubmitting(null)
                        setSubmitText(prev => ({ ...prev, [c.id]: "" }))
                      },
                    }
                  )
                }}
              >
                {submitting === c.id ? "Submitting..." : "Submit Entry"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {challenges.length === 0 && (
        <div className="panel p-8 text-center mt-6">
          <p className="muted">No challenges yet. Check back soon!</p>
        </div>
      )}
    </PageWrap>
  )
}
