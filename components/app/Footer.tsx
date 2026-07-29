import Link from "next/link"
import { BrandMark } from "./Header"
import "./footer.css"

export default function Footer() {
  return (
    <footer className="foot">
      <div className="container foot-grid">
        <div className="foot-brand">
          <BrandMark />
          <p className="foot-tag">
            The operating system for creative intelligence. AI accelerates the work — humans provide the judgment.
          </p>
          <p className="foot-hai">
            <span className="chip" style={{ color: "var(--ai-ink)", background: "var(--ai-soft)" }}><span className="dot dot-ai" /> AI assists</span>
            <span className="chip" style={{ color: "var(--human-ink)", background: "var(--human-soft)" }}><span className="dot dot-human" /> Humans decide</span>
          </p>
        </div>

        <div className="foot-col">
          <h5>News & Insights</h5>
          <Link href="/blog">Blog</Link>
          <Link href="/news">News</Link>
          <Link href="/careers">Careers</Link>
        </div>

        <div className="foot-col">
          <h5>Company</h5>
          <Link href="/team">Team</Link>
          <Link href="/talents">Talents & Creators</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="foot-col">
          <h5>For Creators</h5>
           <Link href="/join">Join</Link>
          <Link href="/sign-in">Talent Login</Link>
        </div>

        <div className="foot-col">
          <h5>Resources</h5>
          <Link href="/">Documentation</Link>
          <Link href="/">Help center</Link>
          <Link href="/">Contact</Link>
        </div>

        <div className="foot-col">
          <h5>Legal</h5>
          <Link href="/">Privacy</Link>
          <Link href="/">Terms</Link>
        </div>
      </div>
      <div className="container foot-base">
        <span className="tiny muted">© {new Date().getFullYear()} Lumyn. Human + AI creative intelligence.</span>
        <span className="tiny muted">Built for creative teams &amp; agencies.</span>
      </div>
    </footer>
  )
}
