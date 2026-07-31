import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/legal.css"

export default function AboutPage() {
  return (
    <PageWrap>
      <PageHead eyebrow="Company" title="About Synthos" desc="The operating system for creative intelligence. AI accelerates the work — humans provide the judgment." />

      <div className="legal-wrap">
        <div className="legal-hero">
          <div className="legal-hero-eyebrow">About Synthos</div>
          <h1>AI-assisted creative intelligence<br/>for structured delivery.</h1>
          <p>From first brief to final greenlight — every step is tracked, attributed, and optimized.</p>
        </div>

        <div className="legal-grid">
          <div className="legal-card">
            <div className="legal-card-num">01</div>
            <h2>Our Mission</h2>
            <p>Synthos was built to solve a fundamental problem in creative agencies: the gap between client conversations and structured project intelligence. We believe AI should handle the workflow so humans can focus on what they do best — creativity, judgment, and relationships.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">02</div>
            <h2>What We Do</h2>
            <p>Our platform transforms client briefs, meetings, and transcripts into actionable project intelligence. From the first creative brief to final human approval, every step is tracked, attributed, and optimized. AI drafts — humans decide.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">03</div>
            <h2>Who We Serve</h2>
            <p>Modern creative agencies, brand teams, and production studios that need structure without sacrificing creativity. Synthos fits into your existing workflow and amplifies your team&apos;s output.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">04</div>
            <h2>How We Build</h2>
            <p>Synthos is designed and developed for creative teams worldwide. We combine cutting-edge AI with proven agency workflows to deliver a platform that feels native to how creative work actually happens.</p>
          </div>

          <div className="legal-card legal-card-full">
            <div className="legal-card-num">05</div>
            <h2>The Human + AI Layer</h2>
            <p>Every output in Synthos is a collaboration between AI and human intelligence. AI assists with understanding, drafting, and synthesis. Humans provide judgment, direction, and final approval. Full transparency at every step — because great creative work needs both.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <Link href="/intake" className="btn btn-signal btn-sm">Start a Project</Link>
              <Link href="/contact" className="btn btn-ghost btn-sm">Contact Us</Link>
            </div>
          </div>
        </div>

        <div className="legal-footer">
          <span className="legal-footer-meta">Synthos · Human + AI creative intelligence</span>
          <div className="legal-footer-links">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}
