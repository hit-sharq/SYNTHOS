"use client"

import Link from "next/link"
import { BrandMark } from "@/components/app/Header"
import { RevealOnScroll, StaggerContainer } from "@/components/app/useReveal"
import "./home.css"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <main>
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <span className="eyebrow anim-fade-up">Kenya's Creative Job Board</span>
          <h1 className="hero-title anim-fade-up anim-delay-1">
            Find creative work.<br />
            Hire <span className="hero-human">verified talent.</span>
          </h1>
          <p className="hero-lede anim-fade-up anim-delay-2">
            The marketplace for Kenya's best creative professionals. Verified companies post curated roles. Talents showcase skills, set rates, and get hired.
          </p>
          <div className="hero-actions anim-fade-up anim-delay-3">
            <Link href="/jobs" className="btn btn-signal btn-lg">Browse Open Gigs →</Link>
            <Link href="/company/signup" className="btn btn-ghost btn-lg">Post a Job</Link>
          </div>
          <div className="hero-meta anim-fade-up anim-delay-4">
            <div><strong>Verified</strong>Companies</div>
            <div><strong>Curated</strong>Roles</div>
            <div><strong>Creative</strong>Talent</div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS BAR
      ============================================================ */}
      <RevealOnScroll>
        <section className="stats-bar">
          <div className="container">
            <div className="stat-row">
              <div className="stat-cell">
                <div className="sv">Job Board</div>
                <div className="sl">Verified roles</div>
              </div>
              <div className="stat-cell">
                <div className="sv">Talents</div>
                <div className="sl">Creative professionals</div>
              </div>
              <div className="stat-cell">
                <div className="sv">Companies</div>
                <div className="sl">Verified employers</div>
              </div>
              <div className="stat-cell">
                <div className="sv">AI-Assisted</div>
                <div className="sl">Smart matching</div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================================================
          JOBS & TALENT — PRIMARY SECTION
      ============================================================ */}
      <RevealOnScroll>
        <section className="dk">
          <div className="container">
            <span className="eyebrow section-label">Opportunities</span>
            <h2 className="section-title">Hire talent. Find work.<br/>Build your team.</h2>
            <p className="lede" style={{ color: "#888", maxWidth: 720, margin: "0 auto 48px" }}>
              Verified companies post curated roles. Talents showcase skills, experience, and availability. A transparent marketplace for creative professionals.
            </p>

            <StaggerContainer>
              <div className="triple-grid">
                <div className="triple-card">
                  <div className="triple-icon">
                    <span className="mono">01</span>
                  </div>
                  <h3>For Companies</h3>
                  <p>Post jobs, review applications, and hire verified creative talent. Full control over your hiring pipeline.</p>
                  <Link href="/company/signup" className="btn btn-ghost btn-sm" style={{ marginTop: 16, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>Post a Job →</Link>
                </div>
                <div className="triple-card">
                  <div className="triple-icon">
                    <span className="mono">02</span>
                  </div>
                  <h3>For Talents</h3>
                  <p>Showcase your portfolio, set your rate, and apply to curated opportunities from verified companies.</p>
                  <Link href="/talents" className="btn btn-ghost btn-sm" style={{ marginTop: 16, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>Browse Gigs →</Link>
                </div>
                <div className="triple-card">
                  <div className="triple-icon">
                    <span className="mono">03</span>
                  </div>
                  <h3>Public Board</h3>
                  <p>All approved jobs are visible on the public board. Search by type, location, and budget. No account required to browse.</p>
                  <Link href="/jobs" className="btn btn-ghost btn-sm" style={{ marginTop: 16, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>View Open Gigs →</Link>
                </div>
              </div>
            </StaggerContainer>
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================================================
          HOW IT WORKS
      ============================================================ */}
      <RevealOnScroll>
        <section>
          <div className="container">
            <span className="eyebrow section-label">How It Works</span>
            <h2 className="section-title">Three ways to use<br/>Synthos.</h2>
            <p className="lede" style={{ maxWidth: 720, margin: "0 auto 48px" }}>
              Whether you're hiring, looking for work, or running a project — there's a path for you.
            </p>

            <StaggerContainer>
              <div className="triple-grid">
                <div className="triple-card">
                  <div className="triple-icon">
                    <span className="mono">01</span>
                  </div>
                  <h3>Find Work</h3>
                  <p>Browse verified job postings from top companies. Apply with one click. Showcase your portfolio and get matched with opportunities that fit your skills.</p>
                  <Link href="/jobs" className="btn btn-signal btn-sm" style={{ marginTop: 16 }}>Browse Jobs →</Link>
                </div>
                <div className="triple-card">
                  <div className="triple-icon">
                    <span className="mono">02</span>
                  </div>
                  <h3>Post Jobs</h3>
                  <p>Register your company and post curated roles. Review applications, shortlist talent, and hire the best creative professionals in Kenya.</p>
                  <Link href="/company/signup" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>Post a Job →</Link>
                </div>
                <div className="triple-card">
                  <div className="triple-icon">
                    <span className="mono">03</span>
                  </div>
                  <h3>Run Projects</h3>
                  <p>Have a brief? Launch it on Synthos. Our AI-assisted workflow takes it from intake to greenlight — structured, attributed, and human-centered.</p>
                  <Link href="/intake" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>Start a Project →</Link>
                </div>
              </div>
            </StaggerContainer>
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================================================
          WORKFLOW — Fast Project Delivery
      ============================================================ */}
      <RevealOnScroll>
        <section className="dk">
          <div className="container">
            <span className="eyebrow section-label">Project Delivery</span>
            <h2 className="section-title">From brief to greenlight —<br/>ten stages, zero wasted motion.</h2>
            <p className="lede" style={{ color: "#888", maxWidth: 720, margin: "0 auto 48px" }}>
              For clients who need speed without chaos. AI handles understanding and drafting in parallel. Humans review, refine, and approve at every gate — so you ship on time, every time.
            </p>

            <div className="pipeline">
              {[
                ["01", "Blueprint", "Intent and objectives"],
                ["02", "Discovery", "Rapid scoping and intake"],
                ["03", "Capture", "Intelligent capture at scale"],
                ["04", "Intelligence", "Structured insight, instantly"],
                ["05", "Blueprint", "Refined direction, locked fast"],
                ["06", "Workshop", "Human + AI strategy"],
                ["07", "Synthesis", "Unified direction from every input"],
                ["08", "Pitch Deck", "Professional deck, AI-drafted"],
                ["09", "Estimate", "Pricing ready for partner review"],
                ["10", "Greenlight", "Final human decision"],
              ].map(([n, t, d]) => (
                <div key={n} className="pstage anim-fade-up" style={{ animationDelay: `${parseInt(n) * 0.05}s` }}>
                  <span className="pnum">{n}</span>
                  <div className="picon">{t[0]}</div>
                  <span className="pname">{t}</span>
                  <span className="pdesc">{d}</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/intake" className="btn btn-signal btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Launch Fast Project →<span style={{ fontSize: "0.85em", opacity: 0.85 }}>10 stages, urgent delivery</span>
              </Link>
            </div>

            <div className="stats">
              <div className="st"><div className="st-v">10</div><div className="st-l">Pipeline Stages</div></div>
              <div className="st"><div className="st-v">AI-Assisted</div><div className="st-l">Stages 1–9</div></div>
              <div className="st"><div className="st-v">Human-Gated</div><div className="st-l">Stage 10</div></div>
              <div className="st"><div className="st-v">Full Trace</div><div className="st-l">Attribution Tracked</div></div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================================================
          BLOG + NEWS
      ============================================================ */}
      <RevealOnScroll>
        <section>
          <div className="container">
            <span className="eyebrow section-label">Insights</span>
            <h2 className="section-title">Thinking in public.<br/>Latest from the blog and newsroom.</h2>
            <p className="lede" style={{ maxWidth: 720, margin: "0 auto 48px" }}>
              Perspectives on AI-assisted creativity, creative ops, and the future of agency work.
            </p>

            <StaggerContainer>
              <div className="double-grid">
                <div className="insight-col">
                  <div className="insight-header">
                    <span className="mono" style={{ color: "var(--ink-3)" }}>Blog</span>
                    <Link href="/blog" className="btn btn-ghost btn-sm">All Posts →</Link>
                  </div>
                  <div className="insight-list">
                    <div className="insight-placeholder">
                      <p className="tiny muted">Latest thoughts on creative intelligence and AI-assisted workflows.</p>
                    </div>
                  </div>
                </div>
                <div className="insight-col">
                  <div className="insight-header">
                    <span className="mono" style={{ color: "var(--ink-3)" }}>News</span>
                    <Link href="/news" className="btn btn-ghost btn-sm">All Updates →</Link>
                  </div>
                  <div className="insight-list">
                    <div className="insight-placeholder">
                      <p className="tiny muted">Product updates, announcements, and company news.</p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerContainer>
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================================================
          TEAM
      ============================================================ */}
      <RevealOnScroll>
        <section className="dk">
          <div className="container">
            <span className="eyebrow section-label">People</span>
            <h2 className="section-title">The humans behind<br/>the intelligence.</h2>
            <p className="lede" style={{ color: "#888", maxWidth: 720, margin: "0 auto 48px" }}>
              Writers, producers, account managers, and technologists. The team that makes AI-assisted creative work feel human.
            </p>

            <StaggerContainer>
              <div className="triple-grid">
                <div className="team-card">
                  <div className="team-avatar" style={{ background: "var(--surface-2)" }}>
                    <span className="mono">Synthos</span>
                  </div>
                  <h3>Creative Directors</h3>
                  <p className="tiny muted">Strategy, concept, and creative oversight. Every brief gets a human touch.</p>
                </div>
                <div className="team-card">
                  <div className="team-avatar" style={{ background: "var(--surface-2)" }}>
                    <span className="mono">Synthos</span>
                  </div>
                  <h3>Producers</h3>
                  <p className="tiny muted">Project delivery, client relationships, and workflow orchestration.</p>
                </div>
                <div className="team-card">
                  <div className="team-avatar" style={{ background: "var(--surface-2)" }}>
                    <span className="mono">Synthos</span>
                  </div>
                  <h3>Engineers</h3>
                  <p className="tiny muted">The AI infrastructure, attribution layer, and platform that powers it all.</p>
                </div>
              </div>
            </StaggerContainer>

            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link href="/team" className="btn btn-ghost">Meet the Full Team →</Link>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================================================
          FINAL CTA
      ============================================================ */}
      <RevealOnScroll>
        <section className="foot-cta">
          <div className="container" style={{ textAlign: "center" }}>
            <h2 className="display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 14 }}>Ready to find work or hire talent?</h2>
            <p className="lede" style={{ marginBottom: 28 }}>Browse open gigs, post a job, or run your next project with AI-assisted precision.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/jobs" className="btn btn-signal btn-lg">Browse Gigs →</Link>
              <Link href="/company/signup" className="btn btn-ghost btn-lg">Post a Job</Link>
              <Link href="/intake" className="btn btn-ghost btn-lg">Start a Project</Link>
            </div>
          </div>
        </section>
      </RevealOnScroll>
    </main>
  )
}
