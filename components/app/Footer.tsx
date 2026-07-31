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
            Kenya's creative job board and talent marketplace. Verified employers, curated roles, and AI-assisted project delivery.
          </p>
          <p className="foot-hai">
            <span className="chip" style={{ color: "var(--ai-ink)", background: "var(--ai-soft)" }}><span className="dot dot-ai" /> AI assists</span>
            <span className="chip" style={{ color: "var(--human-ink)", background: "var(--human-soft)" }}><span className="dot dot-human" /> Humans decide</span>
          </p>
        </div>

        <div className="foot-col">
          <h5>Platform</h5>
          <Link href="/about">Overview</Link>
          <Link href="/intake">Start Project</Link>
          <Link href="/talents">Talent</Link>
          <Link href="/companies">Companies</Link>
        </div>

        <div className="foot-col">
          <h5>Company</h5>
          <Link href="/team">Team</Link>
          <Link href="/talents">Talents &amp; Creators</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="foot-col">
          <h5>For Companies</h5>
          <Link href="/company/signup">Post a Job</Link>
          <Link href="/company/login">Company Login</Link>
        </div>

        <div className="foot-col">
          <h5>For Creators</h5>
          <Link href="/talent/signup">Join</Link>
          <Link href="/jobs">Open Gigs</Link>
          <Link href="/sign-in">Talent Login</Link>
        </div>

        <div className="foot-col">
          <h5>Resources</h5>
          <Link href="/blog">Blog</Link>
          <Link href="/news">News</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/">Help center</Link>
        </div>

        <div className="foot-col">
          <h5>Legal</h5>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="container foot-base">
        <span className="tiny muted">© {new Date().getFullYear()} Synthos. Human + AI creative intelligence.</span>
        <span className="tiny muted">Built for creative teams &amp; agencies.</span>
      </div>
    </footer>
  )
}
