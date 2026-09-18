export interface LevelTierInfo {
  tier: string
  level: number
  title: string
  xpRequired: number
  badgeColor: string
  perks: string[]
}

export const LEVEL_TIERS: LevelTierInfo[] = [
  { tier: "new", level: 1, title: "New", xpRequired: 0, badgeColor: "#888888", perks: ["Basic profile"] },
  { tier: "rising", level: 2, title: "Rising", xpRequired: 100, badgeColor: "#4a90d9", perks: ["Profile badge", "Priority search"] },
  { tier: "established", level: 3, title: "Established", xpRequired: 500, badgeColor: "#27ae60", perks: ["Verified badge", "Showcase on feed", "Portfolio feature"] },
  { tier: "featured", level: 4, title: "Featured", xpRequired: 2000, badgeColor: "#e67e22", perks: ["Featured creator", "Challenge host", "Custom domain"] },
  { tier: "elite", level: 5, title: "Elite", xpRequired: 10000, badgeColor: "#0066ff", perks: ["Elite badge", "Spotlight eligible", "API access", "Mentor program"] },
]

export function getTierForXP(xp: number): LevelTierInfo {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].xpRequired) return LEVEL_TIERS[i]
  }
  return LEVEL_TIERS[0]
}

export function getXPForNextLevel(xp: number): number {
  const tier = getTierForXP(xp)
  const next = LEVEL_TIERS.find(t => t.level === tier.level + 1)
  return next ? next.xpRequired : tier.xpRequired
}

export function getXPProgress(xp: number): { current: number; needed: number; percent: number } {
  const tier = getTierForXP(xp)
  const next = LEVEL_TIERS.find(t => t.level === tier.level + 1)
  if (!next) return { current: xp, needed: tier.xpRequired, percent: 100 }
  const start = tier.xpRequired
  const needed = next.xpRequired - start
  const current = xp - start
  return { current, needed, percent: Math.min(100, Math.round((current / needed) * 100)) }
}

export const XP_EVENTS = {
  profile_complete: { xp: 100, title: "Complete your profile", description: "Fill in all profile fields" },
  first_connection: { xp: 10, title: "Make a connection", description: "Connect with your first creator" },
  first_post: { xp: 20, title: "Share your first post", description: "Create a feed post" },
  first_project: { xp: 500, title: "Land a project", description: "Complete your first project" },
  review_received: { xp: 50, title: "Got a review", description: "Receive your first review" },
  challenge_participate: { xp: 100, title: "Join a challenge", description: "Submit to your first challenge" },
  challenge_win: { xp: 1000, title: "Win a challenge", description: "Win a creator challenge" },
  portfolio_create: { xp: 150, title: "Build a portfolio", description: "Create your first portfolio" },
  skill_swap: { xp: 75, title: "Skill swap", description: "Post a skill swap request" },
} as const
