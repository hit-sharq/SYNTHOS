"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Check, Crown, Gem, Medal, Shield, Star, UserPlus, Users } from "lucide-react"
import { cn } from "@/lib/utils"

function fetchMe() {
  return fetch("/api/users/me").then(r => {
    if (!r.ok) throw new Error("Failed to load profile")
    return r.json()
  })
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  New: { bg: "bg-gray-400/10", border: "border-gray-400/30", text: "text-gray-400", glow: "shadow-gray-400/20" },
  Rising: { bg: "bg-blue-400/10", border: "border-blue-400/30", text: "text-blue-400", glow: "shadow-blue-400/20" },
  Established: { bg: "bg-green-400/10", border: "border-green-400/30", text: "text-green-400", glow: "shadow-green-400/20" },
  Featured: { bg: "bg-amber-400/10", border: "border-amber-400/30", text: "text-amber-400", glow: "shadow-amber-400/20" },
  Elite: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500", glow: "shadow-blue-500/20" },
}

export function CreatorProfile() {
  const { data: me, isLoading, error } = useQuery({ queryKey: ["creator-profile"], queryFn: fetchMe })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <p className="muted tiny">Loading your profile…</p>
        </div>
      </div>
    )
  }

  if (error || !me) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--rejected)" }}>Failed to load profile</p>
        </div>
      </div>
    )
  }

  const tierStyle = TIER_COLORS[me.tier.title] || TIER_COLORS.New
  const maxLevel = me.tier.level >= 5

  return (
    <div className="stack gap-6">
      <div className="panel" style={{ padding: 32, borderRadius: 12, position: "relative", overflow: "hidden" }}>
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-10"
          style={{ background: me.tier.badgeColor }}
        />
        <div className="row gap-4 items-start" style={{ position: "relative", zIndex: 1 }}>
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-mono text-xl font-bold"
              style={{ background: tierStyle.bg, color: me.tier.badgeColor, border: `2px solid ${me.tier.badgeColor}40` }}
            >
              {me.initials || "?"}
            </div>
            <div
              className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center", tierStyle.text)}
              style={{ background: "var(--surface)", border: `2px solid ${me.tier.badgeColor}` }}
              title={`Level ${me.level}`}
            >
              <span className="text-[10px] font-bold">{me.level}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="row gap-2 items-center flex-wrap">
              <h1 className="text-2xl font-bold" style={{ margin: 0 }}>{me.name}</h1>
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border", tierStyle.bg, tierStyle.border, tierStyle.text)}>
                {me.tier.title.toUpperCase()}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)", marginTop: 4 }}>
              {me.role.charAt(0).toUpperCase() + me.role.slice(1)} Creator
            </p>

            <div className="row gap-3 mt-3 flex-wrap" style={{ alignItems: "center" }}>
              {me.presence?.status === "online" ? (
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span style={{ color: "var(--ink-2)" }}>Online</span>
                </span>
              ) : me.presence?.status === "away" ? (
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span style={{ color: "var(--ink-2)" }}>Away</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span style={{ color: "var(--ink-2)" }}>Offline</span>
                </span>
              )}

              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                <Users size={12} className="inline mr-1" />
                {me.stats.followers} followers · {me.stats.following} following
              </span>
            </div>
          </div>
        </div>

        {!maxLevel && (
          <div className="mt-5" style={{ position: "relative", zIndex: 1 }}>
            <div className="row justify-between text-[11px] mono mb-1" style={{ color: "var(--muted-foreground)" }}>
              <span>Level {me.level} → {me.tier.title}</span>
              <span>{me.levelXP} XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${me.tier.level >= 5 ? 100 : (me.levelXP % 1000)}%`, background: me.tier.badgeColor }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Portfolios" value={me.stats.portfolios} icon={<Star size={14} />} />
        <StatCard label="Spotlights" value={me.stats.spotlights} icon={<Crown size={14} />} />
        <StatCard label="Challenges" value={me.stats.challenges} icon={<Medal size={14} />} />
        <StatCard label="Achievements" value={me.stats.achievements} icon={<Shield size={14} />} />
        <StatCard label="Submissions" value={me.stats.submissions} icon={<Check size={14} />} />
        <StatCard label="Skill Swaps" value={me.stats.skillSwaps} icon={<UserPlus size={14} />} />
        <StatCard label="Followers" value={me.stats.followers} icon={<Users size={14} />} />
        <StatCard label="Following" value={me.stats.following} icon={<UserPlus size={14} />} />
      </div>

      {me.tier.perks.length > 0 && (
        <div className="panel" style={{ padding: 24 }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Gem size={14} style={{ color: me.tier.badgeColor }} />
            Perks
          </h2>
          <div className="flex flex-wrap gap-2">
            {me.tier.perks.map(perk => (
              <span
                key={perk}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
                style={{
                  background: `${me.tier.badgeColor}10`,
                  borderColor: `${me.tier.badgeColor}30`,
                  color: me.tier.badgeColor,
                }}
              >
                <Star size={10} fill={me.tier.badgeColor} />
                {perk}
              </span>
            ))}
          </div>
        </div>
      )}

      {me.achievements.length > 0 && (
        <div className="panel" style={{ padding: 24 }}>
          <h2 className="text-sm font-semibold mb-3">Recent Achievements</h2>
          <div className="stack gap-2">
            {me.achievements.slice(0, 8).map((a: any) => (
              <div
                key={a.id}
                className="row gap-3 items-center"
                style={{ padding: "8px 12px", borderRadius: 8, background: "var(--surface-2)" }}
              >
                <span className="text-lg">{a.type === "level_up" || a.type === "challenge_win" ? "🏆" : a.type === "profile_complete" ? "⭐" : a.type === "first_connection" ? "🔗" : a.type === "first_post" ? "✍️" : "🎯"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ margin: 0 }}>{a.title}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)", margin: 0 }}>{a.description}</p>
                </div>
                {a.xpAwarded ? (
                  <span className="text-[10px] mono" style={{ color: me.tier.badgeColor }}>+{a.xpAwarded} XP</span>
                ) : null}
                <span className="text-[10px] mono" style={{ color: "var(--muted-foreground)" }}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {me.recentPosts.length > 0 && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">Recent Updates</h2>
            <div className="stack gap-2">
              {me.recentPosts.map((p: any) => (
                <div key={p.id} className="text-xs" style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                  <p style={{ color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
                    {p.content.length > 100 ? p.content.substring(0, 100) + "…" : p.content}
                  </p>
                  <span className="text-[10px] mono" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {me.portfolios.length > 0 && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">
              <Link href="/portfolio" className="hover:underline" style={{ color: "var(--ink)" }}>Portfolios</Link>
            </h2>
            <div className="stack gap-2">
              {me.portfolios.slice(0, 4).map((p: any) => (
                <Link key={p.id} href={`/portfolio/${p.slug || p.id}`} className="text-xs row gap-2 items-center" style={{ color: "var(--ink-2)", textDecoration: "none", padding: "4px 0" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--signal)" }} />
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {me.spotlights.length > 0 && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">
              <Link href="/spotlight" className="hover:underline" style={{ color: "var(--ink)" }}>Spotlights</Link>
            </h2>
            <div className="stack gap-2">
              {me.spotlights.slice(0, 4).map((s: any) => (
                <Link key={s.id} href="/spotlight" className="text-xs row gap-2 items-center" style={{ color: "var(--ink-2)", textDecoration: "none", padding: "4px 0" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {me.challenges.length > 0 && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">
              <Link href="/challenges" className="hover:underline" style={{ color: "var(--ink)" }}>Challenges</Link>
            </h2>
            <div className="stack gap-2">
              {me.challenges.slice(0, 4).map((c: any) => (
                <Link key={c.id} href="/challenges" className="text-xs row gap-2 items-center" style={{ color: "var(--ink-2)", textDecoration: "none", padding: "4px 0" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--signal)" }} />
                  {c.title}
                  {c.status && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted-foreground)" }}>
                      {c.status}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {me.skillSwaps.length > 0 && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">
              <Link href="/skill-swap" className="hover:underline" style={{ color: "var(--ink)" }}>Skill Swaps</Link>
            </h2>
            <div className="stack gap-2">
              {me.skillSwaps.slice(0, 4).map((s: any) => (
                <Link key={s.id} href="/skill-swap" className="text-xs row gap-2 items-center" style={{ color: "var(--ink-2)", textDecoration: "none", padding: "4px 0" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                  {s.title}
                  {s.status && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted-foreground)" }}>
                      {s.status}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {me.submissions.length > 0 && (
          <div className="panel" style={{ padding: 24 }}>
            <h2 className="text-sm font-semibold mb-3">Submissions</h2>
            <div className="stack gap-2">
              {me.submissions.slice(0, 4).map((s: any) => (
                <div key={s.id} className="text-xs row gap-2 items-center" style={{ padding: "4px 0", color: "var(--ink-2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.status === "winning" ? "var(--signal)" : s.status === "eliminated" ? "var(--rejected)" : "var(--muted-foreground)" }} />
                  {s.status}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="panel" style={{ padding: 16, textAlign: "center", borderRadius: 8 }}>
      <div className="row justify-center mb-1" style={{ color: "var(--signal)" }}>{icon}</div>
      <p className="text-xl font-bold" style={{ margin: 0 }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-foreground)", margin: 0 }}>{label}</p>
    </div>
  )
}