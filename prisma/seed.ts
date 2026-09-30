/**
 * Idempotent development seed.
 *
 * Safe to re-run: every write is keyed on a natural unique column
 * (slug / email / title+kind) and skipped when already present. Existing
 * rows are never deleted or overwritten.
 *
 * Run with: npx tsx prisma/seed.ts
 */
import { PrismaClient, Role } from "@prisma/client"

const prisma = new PrismaClient()

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

async function main() {
  const stamp = Date.now()

  // ---------- Companies ----------
  const companySpecs = [
    { name: "Lake House Foods", email: "hello@lakehousefoods.co.ke", industry: "Food & Beverage", location: "Nairobi, KE", website: "https://lakehousefoods.co.ke", verified: true, status: "active", description: "Fast-casing food manufacturer serving East Africa." },
    { name: "Savannah Telecom", email: "team@savannahtel.co.ke", industry: "Telecommunications", location: "Mombasa, KE", website: "https://savannatel.co.ke", verified: true, status: "active", description: "Regional network operator." },
    { name: "Kilimanjaro Tours", email: "info@kilimanjarotours.co.ke", industry: "Travel & Tourism", location: "Arusha, TZ", website: "https://kilimanjarotours.co.tz", verified: false, status: "pending", description: "Safari and trekking operator." },
    { name: "Nairobi Fitness Co", email: "admin@nairobifitness.co.ke", industry: "Health & Fitness", location: "Nairobi, KE", verified: false, status: "active", description: "Boutique gym chain." },
  ]

  const companies = [] as { id: string; name: string }[]
  for (const c of companySpecs) {
    const slug = slugify(c.name)
    const found = await prisma.company.findUnique({ where: { slug } })
    const row = found ?? await prisma.company.create({
      data: {
        name: c.name,
        slug,
        email: c.email,
        industry: c.industry,
        location: c.location,
        website: "website" in c ? c.website : undefined,
        description: c.description,
        verified: c.verified,
        status: c.status as any,
        verifiedAt: c.verified ? new Date() : null,
      },
    })
    companies.push(row as { id: string; name: string })
  }
  console.log(`companies: ${companies.length}`)

  // ---------- Clients (CRM) ----------
  const clientSpecs = [
    { name: "Achieng Odhiambo", company: "Lake House Foods", email: "achieng@lakehousefoods.co.ke", industry: "Food & Beverage", status: "active", value: "KES 2.4M", tags: ["retainer", "brand"] },
    { name: "Brian Kimani", company: "Savannah Telecom", email: "brian@savannatel.co.ke", industry: "Telecommunications", status: "active", value: "KES 1.1M", tags: ["campaign"] },
    { name: "Neema Njoroge", company: "Nairobi Fitness Co", email: "neema@nairobifitness.co.ke", industry: "Health & Fitness", status: "lead", value: "KES 480K", tags: ["web", "new"] },
  ]

  const clients = [] as { id: string; name: string }[]
  for (const c of clientSpecs) {
    const found = await prisma.client.findFirst({ where: { email: c.email } })
    const row = found ?? await prisma.client.create({
      data: {
        name: c.name,
        company: c.company,
        email: c.email,
        industry: c.industry,
        status: c.status as any,
        value: c.value,
        tags: c.tags,
        nextAction: "Schedule discovery call",
      },
    })
    clients.push(row as { id: string; name: string })
  }
  console.log(`clients: ${clients.length}`)

  // ---------- Talent profiles ----------
  // Only the dedicated test account gets a seeded profile. Existing real users
  // are reused for connections and feed content, but are not modified, so the
  // seed never attaches a profile to somebody's real account.
  const SEED_TALENT = { name: "Wanjiku Kamau", email: "synthos.test@example.com", skills: ["Brand Strategy", "Art Direction", "Copywriting"], experience: 7, rate: "KES 120K/mo", availability: "available", notes: "Ex-agency lead. Strong on FMCG repositioning." }

  const talents = [] as { id: string; userId: string | null; name: string }[]
  {
    const t = SEED_TALENT
    const user = await prisma.user.findUnique({ where: { email: t.email } })
    const seedUser = user ?? await prisma.user.create({
      data: {
        email: t.email,
        name: t.name,
        initials: initialsOf(t.name),
        role: Role.talent,
        level: 3,
        levelXP: 620,
      },
    })
    const existing = await prisma.talent.findFirst({ where: { email: t.email } })
    let row
    if (existing) {
      // A bare placeholder row may already exist; fill it in without
      // overwriting anything a person has actually filled in.
      row = existing.skills.length === 0
        ? await prisma.talent.update({
            where: { id: existing.id },
            data: {
              userId: existing.userId ?? seedUser.id,
              skills: t.skills,
              experience: t.experience,
              rating: 4.6,
              availability: t.availability as any,
              rate: t.rate,
              notes: t.notes,
            },
          })
        : existing
    } else {
      row = await prisma.talent.create({
        data: {
          userId: seedUser.id,
          name: t.name,
          email: t.email,
          skills: t.skills,
          experience: t.experience,
          rating: 4.6,
          availability: t.availability as any,
          rate: t.rate,
          notes: t.notes,
        },
      })
    }
    talents.push({ id: row.id, userId: row.userId, name: row.name })
  }
  console.log(`talent: seeded ${talents.length} test profile`)

  // Real accounts are read-only participants for connections and feed content.
  const existingTalents = await prisma.talent.findMany({
    where: { userId: { not: null }, email: { not: SEED_TALENT.email } },
    select: { id: true, userId: true, name: true },
  })
  for (const t of existingTalents) talents.push({ id: t.id, userId: t.userId, name: t.name })
  console.log(`talent: ${existingTalents.length} existing profiles available for linking`)

  // ---------- Projects across the workflow stages ----------
  const projectSpecs = [
    { name: "Lake House Rebrand", client: "Lake House Foods", type: "Brand & Campaign", stage: "approval" as const, status: "review" as const, progress: 92, ownerIdx: 0, clientIdx: 0, nextAction: "Client sign-off on proposal" },
    { name: "Savannah Data Campaign", client: "Savannah Telecom", type: "Brand & Campaign", stage: "proposal" as const, status: "attention" as const, progress: 68, ownerIdx: 1, clientIdx: 1, nextAction: "Revise quote after scope change" },
    { name: "Kilimanjaro Booking Site", client: "Kilimanjaro Tours", type: "Web & Product", stage: "quote" as const, status: "active" as const, progress: 74, ownerIdx: 3, clientIdx: 0, nextAction: "Send revised estimate" },
    { name: "Nairobi Fitness Launch", client: "Nairobi Fitness Co", type: "Film & Motion", stage: "workshop" as const, status: "active" as const, progress: 45, ownerIdx: 1, clientIdx: 2, nextAction: "Run strategy workshop" },
    { name: "Savannah Packaging System", client: "Savannah Telecom", type: "Strategy & Campaign", stage: "brief" as const, status: "active" as const, progress: 12, ownerIdx: 0, clientIdx: 1, nextAction: "Complete creative brief" },
    { name: "Lake House Social Always-On", client: "Lake House Foods", type: "Brand & Campaign", stage: "transcript" as const, status: "attention" as const, progress: 30, ownerIdx: 2, clientIdx: 0, nextAction: "Transcribe discovery call" },
  ]

  const projects = [] as { id: string; name: string; ownerId: string | null }[]
  for (const spec of projectSpecs) {
    const slug = slugify(spec.name)
    const found = await prisma.project.findUnique({ where: { slug } })
    if (found) { projects.push({ id: found.id, name: found.name, ownerId: found.ownerId }); continue }

    const owner = talents[spec.ownerIdx]
    const created = await prisma.project.create({
      data: {
        slug,
        name: spec.name,
        client: spec.client,
        clientId: clients[spec.clientIdx].id,
        type: spec.type,
        stage: spec.stage,
        status: spec.status as any,
        progress: spec.progress,
        nextAction: spec.nextAction,
        ownerId: owner.userId,
        aiActivity: 12,
        publicToken: `pub_${slugify(spec.name)}_${stamp % 10000}`,
        lastActivity: new Date(Date.now() - 3 * 864e5),
      },
    })
    projects.push({ id: created.id, name: created.name, ownerId: created.ownerId })
  }
  console.log(`projects: ${projects.length}`)

  // ---------- Stage artifacts ----------
  for (const p of projects) {
    const briefExists = await prisma.brief.findUnique({ where: { projectId: p.id } })
    if (!briefExists) {
      await prisma.brief.create({
        data: {
          projectId: p.id,
          clientName: "Stakeholder",
          company: "Client Co",
          contact: "contact@client.co.ke",
          industry: "Consumer",
          title: `Creative brief — ${p.name}`,
          businessObjective: "Grow qualified demand while holding brand trust.",
          objectives: ["Increase awareness", "Drive trial"],
          audience: "Urban 24-40, mobile first",
          brand: "Premium but accessible",
          direction: "Editorial photography, bold type",
          deliverables: ["Key visual", "Social pack", "Launch film"],
          budget: "KES 1.2M",
          timeline: "10 weeks",
          attachments: [],
          context: "Competitive landscape is crowded; differentiation matters.",
          aiWants: ["Ownable visual language", "Consistent system across channels"],
          aiObjectives: ["Lift branded search", "Improve first-purchase conversion"],
          aiRequirements: ["Master artwork", "Editable templates", "Motion assets"],
          aiRisks: ["Tight timeline", "Approver availability"],
          aiMissing: ["Brand guidelines v2", "Budget ceiling confirmed"],
          aiQuestions: ["Who signs off final creative?", "Which channels are in scope?"],
          aiConfidence: 72,
        },
      })
    }

    const callExists = await prisma.clientCall.findUnique({ where: { projectId: p.id } })
    if (!callExists) {
      await prisma.clientCall.create({
        data: {
          projectId: p.id,
          date: new Date(Date.now() - 6 * 864e5).toISOString(),
          duration: "52 min",
          participants: ["Account lead", "Client marketing", "Creative lead"],
          summary: "Aligned on positioning and channel priorities. Client wants bolder art direction and a faster first delivery.",
          meetingSource: "zoom",
          transcript: "CLIENT: We need to stand out in a crowded shelf. LEADS: Understood, we will lead with product craft.",
        },
      })
    }

    const transcriptExists = await prisma.transcript.findUnique({ where: { projectId: p.id } })
    if (!transcriptExists) {
      await prisma.transcript.create({
        data: {
          projectId: p.id,
          lines: [
            { speaker: "Account lead", role: "team", text: "Walk us through the shelf competition." },
            { speaker: "Client", role: "client", text: "Three brands dominate. We look like them." },
            { speaker: "Account lead", role: "team", text: "Then we make product craft the hero." },
          ],
          moments: [{ time: "00:04", label: "Key tension", note: "Shelf sameness" }],
          decisions: ["Lead with product craft", "Shoot in-house"],
          actions: [{ who: "Client", task: "Send brand guidelines", due: "Friday" }],
          requirements: ["Hero product shot", "Bold endcap lockup"],
        },
      })
    }
  }
  console.log("stage artifacts: brief / call / transcript ensured")

  // ---------- Proposals & quotes for the later-stage projects ----------
  for (const p of projects) {
    const hasProposal = await prisma.proposal.findUnique({ where: { projectId: p.id } })
    if (!hasProposal) {
      await prisma.proposal.create({
        data: {
          projectId: p.id,
          clientDetails: "Prepared for client leadership",
          overview: "A repositioning and identity system built to be recognisable at shelf distance.",
          problem: "The current identity blends into three competitors and does not communicate craft.",
          solution: "A product-first visual system with bolder typography and a flexible motion toolkit.",
          scope: ["Strategy", "Identity", "Campaign"],
          deliverables: ["Brand book", "Key visual", "Social toolkit"],
          timeline: "10 weeks from kickoff",
          team: ["Creative lead", "Art director", "Copywriter"],
          investment: "KES 1,250,000",
          terms: "50% on signature, 50% on delivery.",
          status: "draft" as any,
          sections: [{ title: "Approach", body: "Product-first storytelling.", attr: "mixed" }],
        },
      })
    }
    const hasQuote = await prisma.quote.findUnique({ where: { projectId: p.id } })
    if (!hasQuote) {
      await prisma.quote.create({
        data: {
          projectId: p.id,
          services: [
            { name: "Brand strategy", desc: "Positioning and narrative", qty: 1, rate: 350000 },
            { name: "Visual identity", desc: "Logo, type, colour, system", qty: 1, rate: 550000 },
            { name: "Campaign toolkit", desc: "Social and OOH templates", qty: 1, rate: 350000 },
          ],
          discount: 0,
          tax: 16,
          paymentTerms: "50% upfront, 50% on delivery",
          status: "draft" as any,
        },
      })
    }
  }
  console.log("proposals / quotes ensured")

  // ---------- Approvals ----------
  for (const p of projects.slice(0, 3)) {
    const exists = await prisma.approval.findFirst({ where: { projectId: p.id, kind: "proposal" } })
    if (!exists) {
      await prisma.approval.create({
        data: { projectId: p.id, kind: "proposal", title: `Approve proposal — ${p.name}`, note: "Awaiting client review", status: "review" as any },
      })
    }
  }
  console.log("approvals ensured")

  // ---------- Job postings ----------
  const jobSpecs = [
    { title: "Senior Brand Designer", type: "full-time", category: "design", experience: "senior", skills: ["Brand Identity", "Art Direction"], budget: "KES 180K - 240K/mo", status: "approved", companyIdx: 0, description: "Own brand systems end to end for an FMCG client." },
    { title: "Motion Designer (Contract)", type: "contract", category: "design", experience: "mid", skills: ["After Effects", "3D"], budget: "KES 90K/mo", status: "approved", companyIdx: 1, description: "Three-month motion engagement for a telecom rebrand." },
    { title: "UX Researcher", type: "full-time", category: "design", experience: "mid", skills: ["User Interviews", "Usability Testing"], budget: "KES 130K - 170K/mo", status: "pending", companyIdx: 3, description: "Run discovery research for a new member app." },
    { title: "Front-end Engineer", type: "full-time", category: "technology", experience: "senior", skills: ["React", "TypeScript"], budget: "KES 200K - 280K/mo", status: "approved", companyIdx: 1, description: "Ship a booking platform used by regional travellers." },
    { title: "Copywriter", type: "part-time", category: "marketing", experience: "mid", skills: ["Brand Copy", "Campaign Writing"], budget: "KES 60K/mo", status: "pending", companyIdx: 0, description: "Write launch copy across channels." },
  ]

  let jobCount = 0
  for (const j of jobSpecs) {
    const exists = await prisma.jobPosting.findFirst({ where: { title: j.title, companyId: companies[j.companyIdx].id } })
    if (exists) { jobCount++; continue }
    await prisma.jobPosting.create({
      data: {
        companyId: companies[j.companyIdx].id,
        title: j.title,
        description: j.description,
        requirements: ["3+ years experience", "Portfolio required"],
        skills: j.skills,
        budget: j.budget,
        type: j.type as any,
        category: j.category,
        experience: j.experience,
        status: j.status,
        approvedAt: j.status === "approved" ? new Date() : null,
        expiresAt: new Date(Date.now() + 45 * 864e5),
      },
    })
    jobCount++
  }
  console.log(`jobs: ${jobCount}`)

  // ---------- Job reports awaiting review ----------
  const reportable = await prisma.jobPosting.findFirst({ where: { status: "approved" } })
  if (reportable) {
    const existing = await prisma.jobReport.findFirst({ where: { jobId: reportable.id, reason: "spam", status: "open" } })
    if (!existing) {
      await prisma.jobReport.create({
        data: {
          jobId: reportable.id,
          reason: "spam",
          details: "Seeded report so the moderation queue is not empty.",
          reportedByEmail: "reporter@example.com",
        },
      })
    }
  }
  console.log("job reports ensured")

  // ---------- Connections ----------
  const connected = talents.filter((t) => t.userId)
  let connCount = 0
  for (let i = 0; i + 1 < connected.length; i++) {
    const a = connected[i].userId!
    const b = connected[i + 1].userId!
    const existing = await prisma.connection.findUnique({ where: { followerId_followedId: { followerId: a, followedId: b } } })
    if (existing) { connCount++; continue }
    await prisma.connection.create({ data: { followerId: a, followedId: b, status: "accepted" } })
    connCount++
  }
  // one pending request so the inbox has something to action
  if (connected.length >= 2) {
    const pendingKey = { followerId_followedId: { followerId: connected[connected.length - 1].userId!, followedId: connected[0].userId! } }
    const pending = await prisma.connection.findUnique({ where: pendingKey })
    if (!pending) await prisma.connection.create({ data: { ...pendingKey.followerId_followedId, status: "pending" } })
  }
  console.log(`connections: ${connCount}`)

  // ---------- Feed posts, reactions, comments ----------
  const postBodies = [
    "Wrapped the Lake House shoot today. Product craft reads so much better under hard light.",
    "Reminder: brand systems fail at the edges, not the centre. Test your templates before launch.",
    "Three research patterns kept showing up this week. Writing them up shortly.",
    "Motion toolkit is now templated. Teams can ship a week of social in an afternoon.",
  ]
  let postCount = 0
  for (let i = 0; i < postBodies.length; i++) {
    const author = connected[i % connected.length]
    const dup = await prisma.feedPost.findFirst({ where: { authorId: author.userId!, content: postBodies[i] } })
    if (dup) { postCount++; continue }
    const post = await prisma.feedPost.create({
      data: {
        authorId: author.userId!,
        content: postBodies[i],
        postType: "status",
        privacy: "public",
        projectId: projects[i % projects.length].id,
      },
    })
    postCount++
    await prisma.reaction.create({ data: { postId: post.id, userId: connected[(i + 1) % connected.length].userId!, type: "celebrate" } })
    await prisma.comment.create({ data: { postId: post.id, userId: connected[(i + 2) % connected.length].userId!, body: "Strong agree — edge cases are where it breaks." } })
  }
  console.log(`feedPosts: ${postCount}`)

  // ---------- Spotlights, challenges, blog/news, careers ----------
  for (const s of [
    { title: "Lilian Moraa", subtitle: "Food photographer of the month", content: "Lilian turns ordinary plates into appetite. Her Lake House work redefined how we shoot the category.", category: "profile", isFeatured: true, order: 1 },
    { title: "The Shelf Test", subtitle: "Field note", content: "If your pack does not read at two metres, nothing else matters.", category: "story", isFeatured: false, order: 2 },
  ]) {
    const exists = await prisma.spotlight.findFirst({ where: { title: s.title } })
    if (!exists) {
      await prisma.spotlight.create({
        data: { ...s, creatorId: connected[0].userId!, imageUrl: null },
      })
    }
  }
  console.log("spotlights ensured")

  for (const c of [
    { title: "Rebrand in 30 Days", description: "Ship a credible identity refresh in a month.", brief: "Submit a before/after case study.", status: "open", featured: true, icon: "sparkles" },
    { title: "Motion Poster Challenge", description: "Animate one static poster.", brief: "5 second loop, no text.", status: "open", featured: false, icon: "film" },
  ]) {
    const exists = await prisma.challenge.findFirst({ where: { title: c.title } })
    if (!exists) await prisma.challenge.create({ data: { ...c, createdBy: connected[0].userId! } as any })
  }
  console.log("challenges ensured")

  for (const b of [
    { title: "Why AI assists but humans decide", kind: "blog", tags: ["process", "ai"], excerpt: "Automation is easy. Judgment is the product." },
    { title: "The two-week brand sprint", kind: "blog", tags: ["process"], excerpt: "Compressing a month of discovery without losing rigor." },
    { title: "Synthos expands to Dar es Salaam", kind: "news", tags: ["company"], excerpt: "New market, same standard." },
  ]) {
    const slug = slugify(b.title)
    const exists = await prisma.post.findUnique({ where: { slug } })
    if (!exists) {
      await prisma.post.create({
        data: { title: b.title, slug, kind: b.kind, tags: b.tags, excerpt: b.excerpt, content: `${b.excerpt}\n\nFull article body for development seeding.`, status: "published", publishedAt: new Date(), authorName: "Synthos" },
      })
    }
  }
  console.log("posts ensured")

  for (const c of [
    { title: "Senior Brand Designer", location: "Nairobi", type: "full-time", salaryMin: "KES 180K", salaryMax: "KES 240K" },
    { title: "Motion Designer", location: "Remote (EA)", type: "contract", salaryMin: "KES 90K", salaryMax: "KES 110K" },
  ]) {
    const slug = slugify(`career-${c.title}`)
    const exists = await prisma.career.findUnique({ where: { slug } })
    if (!exists) {
      await prisma.career.create({ data: { title: c.title, slug, description: c.title + " role at Synthos.", requirements: ["3+ years", "Portfolio"], type: c.type as any, location: c.location, salaryMin: c.salaryMin, salaryMax: c.salaryMax, status: "open", publishedAt: new Date() } })
    }
  }
  console.log("careers ensured")

  // ---------- Portfolios ----------
  let portCount = 0
  for (let i = 0; i < Math.min(3, connected.length); i++) {
    const t = talents[i]
    const slug = slugify(`${t.name}-portfolio`)
    const exists = await prisma.portfolio.findUnique({ where: { slug } })
    if (exists) { portCount++; continue }
    const portfolio = await prisma.portfolio.create({ data: { userId: t.userId!, title: `${t.name} — Selected Work`, slug, isPublic: true } })
    await prisma.portfolioItem.create({ data: { portfolioId: portfolio.id, title: "Case study 01", description: "Rebrand and launch campaign.", type: "case-study", order: 1 } })
    await prisma.portfolioItem.create({ data: { portfolioId: portfolio.id, title: "Case study 02", description: "Packaging system rollout.", type: "project", order: 2 } })
    portCount++
  }
  console.log(`portfolios: ${portCount}`)

  // ---------- Conversations ----------
  const convExists = await prisma.conversation.findFirst({ where: { projectId: projects[0].id } })
  if (!convExists && projects[0].ownerId) {
    const conv = await prisma.conversation.create({ data: { projectId: projects[0].id, participants: [projects[0].ownerId!, clients[0].id] } })
    await prisma.message.create({ data: { conversationId: conv.id, senderId: projects[0].ownerId, senderName: "Creative lead", senderRole: "admin", body: "Proposal is ready for your review.", kind: "message", attachments: [] } })
    await prisma.message.create({ data: { conversationId: conv.id, senderId: clients[0].id, senderName: clients[0].name, senderRole: "client", body: "Reviewing today, will revert by Thursday.", kind: "message", attachments: [] } })
  }
  console.log("conversation ensured")

  // ---------- Notifications ----------
  const adminUser = await prisma.user.findFirst({ where: { clerkId: { not: null } } })
  if (adminUser) {
    const notifExists = await prisma.notification.findFirst({ where: { userId: adminUser.id, title: "New connection request" } })
    if (!notifExists) {
      await prisma.notification.create({ data: { userId: adminUser.id, title: "New connection request", message: "Achieng wants to connect with you", kind: "message" } })
      await prisma.notification.create({ data: { userId: adminUser.id, title: "Proposal awaiting approval", message: `${projects[0].name} is ready for sign-off`, kind: "approval", refId: projects[0].id } })
    }
  }
  console.log("notifications ensured")

  console.log("\nSeed complete.")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })