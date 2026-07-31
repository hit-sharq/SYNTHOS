import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import "@/components/app/legal.css"

export default function AboutPage() {
  return (
    <PageWrap>
      <PageHead eyebrow="Company" title="About Synthos" desc="Kenya's creative job board and talent marketplace. Verified employers, curated roles, and AI-assisted project delivery." />

      <div className="legal-wrap">
        <div className="legal-hero">
          <div className="legal-hero-eyebrow">About Synthos</div>
          <h1>Kenya's creative job board<br/>and talent marketplace.</h1>
          <p>Connecting verified employers with the best creative professionals. Post jobs, find work, and deliver projects with AI-assisted precision.</p>
        </div>

        <div className="legal-grid">
          <div className="legal-card">
            <div className="legal-card-num">01</div>
            <h2>Our Mission</h2>
            <p>Synthos was built to solve a fundamental problem in Kenya's creative industry: the gap between talented professionals and verified employers. We built a transparent marketplace where companies post curated roles and creative professionals showcase their skills, set their rates, and get hired.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">02</div>
            <h2>What We Do</h2>
            <p>Our platform connects employers with creative talent and gives project teams an AI-assisted workflow for urgent deliverables. From job posting to final human approval, every step is tracked and attributed. AI assists — humans decide.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">03</div>
            <h2>Who We Serve</h2>
            <p>Creative agencies, brand teams, production studios, and freelance networks that need verified talent and structured project delivery. Synthos fits into your workflow and amplifies your output.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">04</div>
            <h2>How We Build</h2>
            <p>Synthos is designed for creative teams and employers in Kenya and beyond. We combine a verified job board with AI-assisted project workflows to deliver a platform that feels native to how creative work and hiring actually happens.</p>
          </div>

          <div className="legal-card legal-card-full">
            <div className="legal-card-num">05</div>
            <h2>The Human + AI Layer</h2>
            <p>Every interaction on Synthos is built on trust and transparency. The job board connects verified employers with verified talent. For urgent projects, our 10-stage AI-assisted workflow handles the heavy lifting while humans provide judgment and final approval. Full traceability at every step.</p>
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
