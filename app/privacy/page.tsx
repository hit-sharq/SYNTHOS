import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import { Metadata } from "next"
import "@/components/app/legal.css"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Synthos.",
}

export default function PrivacyPage() {
  return (
    <PageWrap>
      <PageHead eyebrow="Legal" title="Privacy Policy" desc="How we collect, use, and protect your personal information." />
      <div className="legal-wrap">
        <div className="legal-hero">
          <div className="legal-hero-eyebrow">Privacy Policy</div>
          <h1>How we collect, use,<br/>and protect your data.</h1>
          <p>Your privacy matters. Here is exactly how we handle your personal information on Synthos.</p>
        </div>

        <div className="legal-grid">
          <div className="legal-card">
            <div className="legal-card-num">01</div>
            <h2>Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email, profile details, and project data. We also collect usage data to improve the platform.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">02</div>
            <h2>How We Use Your Data</h2>
            <p>Your data is used to provide and improve the Synthos service, facilitate AI-assisted workflows, communicate updates, and ensure platform security.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">03</div>
            <h2>Data Sharing</h2>
            <p>We do not sell your personal data. Data is shared with trusted service providers (e.g., hosting, authentication) and only when required by law.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">04</div>
            <h2>AI and Attribution</h2>
            <p>When AI contributes to your projects, attribution data is stored for transparency and traceability. This metadata is only accessible to authorized users involved in the project.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">05</div>
            <h2>Security</h2>
            <p>We implement industry-standard security measures to protect your data. However, no platform is 100% secure, and you are encouraged to use strong passwords and enable available security features.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">06</div>
            <h2>Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting <Link href="/contact">/contact</Link>.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">07</div>
            <h2>Changes to This Policy</h2>
            <p>We may update this policy periodically. Significant changes will be communicated through the platform or via email.</p>
          </div>
        </div>

        <div className="legal-footer">
          <span className="legal-footer-meta">Last updated: July 2026</span>
          <div className="legal-footer-links">
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}
