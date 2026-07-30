
"use client"

import Link from "next/link"
import { BrandMark } from "@/components/app/Header"
import "./home.css"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container">
          <span className="eyebrow">Creative Operations</span>
          <h1 className="hero-title">
            AI accelerates.<br />
            <span className="hero-human">Humans decide.</span>
          </h1>
          <p className="hero-lede">
            The operating system for creative teams. Structured intelligence from first brief to final approval — calm, clear, human-centered.
          </p>
          <div className="hero-actions">
            <Link href="/intake" className="btn btn-signal">Launch a Blueprint</Link>
          </div>
          <div className="hero-meta">
            <div><strong>10</strong>Pipeline Stages</div>
            <div><strong>AI + Human</strong>Decision Layer</div>
            <div><strong>Swiss</strong>Precision</div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <span className="eyebrow section-label">Design System</span>
          <h2 className="section-title">Built on<br/>visual precision.</h2>
          <p className="lede">Strong typography, generous whitespace, sharp edges, and purposeful color — no noise, just clarity.</p>

          <div className="frow">
            <div className="fcell">
              <span className="mono">Typography</span>
              <h3>Fraunces + Inter + Mono</h3>
              <p>Serif for hierarchy. Sans for body clarity. Mono for system labels. Tight tracking, sharp alignment.</p>
            </div>
            <div className="fcell">
              <span className="mono">Colour</span>
              <h3>No gradients. No glow.</h3>
              <p>White canvas. Black ink. Blue signal for action. Slate for AI. Green for human. Every color has a purpose.</p>
            </div>
            <div className="fcell">
              <span className="mono">Spatial</span>
              <h3>Generous whitespace</h3>
              <p>Content breathes. Attention moves. Sharp edges divide without clutter. Every pixel serves a purpose.</p>
            </div>
            <div className="fcell">
              <span className="mono">Attribution</span>
              <h3>Traceable intelligence</h3>
              <p>Every AI contribution is tagged. Every human edit is recorded. Full accountability at every step.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dk">
        <div className="container">
          <span className="eyebrow section-label">Workflow</span>
          <h2 className="section-title">From brief to greenlight —<br/>ten stages of structured delivery.</h2>
          <p className="lede" style={{ color: "#888" }}>AI handles understanding and drafting. Humans review, refine, and approve at every gate.</p>

          <div className="pipeline">
            {[
              ["01", "Blueprint", "Intent and objectives"],
              ["02", "Discovery", "Exploration and intake"],
              ["03", "Capture", "Intelligent recording"],
              ["04", "Intelligence", "Structured insight"],
              ["05", "Blueprint", "Refined direction"],
              ["06", "Workshop", "Human + AI strategy"],
              ["07", "Synthesis", "Clear direction from all sources"],
              ["08", "Pitch Deck", "Professional, AI-drafted"],
              ["09", "Estimate", "Pricing for partner review"],
              ["10", "Greenlight", "Final human decision"],
            ].map(([n, t, d]) => (
              <div key={n} className="pstage">
                <span className="pnum">{n}</span>
                <div className="picon">{t[0]}</div>
                <span className="pname">{t}</span>
                <span className="pdesc">{d}</span>
              </div>
            ))}
          </div>

          <div className="stats">
            <div className="st"><div className="st-v">10</div><div className="st-l">Pipeline Stages</div></div>
            <div className="st"><div className="st-v">AI-Assisted</div><div className="st-l">Stages 1–9</div></div>
            <div className="st"><div className="st-v">Human-Gated</div><div className="st-l">Stage 10</div></div>
            <div className="st"><div className="st-v">Full Trace</div><div className="st-l">Attribution Tracked</div></div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <span className="eyebrow section-label">Philosophy</span>
          <h2 className="section-title">Technology should amplify<br/>human judgment.</h2>
          <blockquote className="bq-text">
            The best creative work emerges when AI handles the heavy lifting<br/>
            and humans make the final call — with full transparency at every step.
          </blockquote>
          <div className="bq-att">— Synthos Design Principle</div>
        </div>
      </section>

      <section className="foot-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: 14 }}>Ready to move work forward?</h2>
          <p className="lede" style={{ marginBottom: 28 }}>Start your first blueprint and see what needs your attention next.</p>
          <Link href="/intake" className="btn btn-signal btn-lg">Start a Blueprint →</Link>
        </div>
      </section>
    </main>
  )
}
