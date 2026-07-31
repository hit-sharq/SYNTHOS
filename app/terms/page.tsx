import { PageHead, PageWrap } from "@/components/app/Page"
import Link from "next/link"
import { Metadata } from "next"
import "@/components/app/legal.css"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Synthos.",
}

export default function TermsPage() {
  return (
    <PageWrap>
      <PageHead eyebrow="Legal" title="Terms of Service" desc="The rules and guidelines for using the Synthos platform." />
      <div className="legal-wrap">
        <div className="legal-hero">
          <div className="legal-hero-eyebrow">Terms of Service</div>
          <h1>Rules and guidelines<br/>for using Synthos.</h1>
          <p>These terms govern your use of the platform. By using Synthos, you agree to these terms.</p>
        </div>

        <div className="legal-grid">
          <div className="legal-card">
            <div className="legal-card-num">01</div>
            <h2>Acceptance of Terms</h2>
            <p>By accessing or using Synthos, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">02</div>
            <h2>Accounts and Roles</h2>
            <p>Synthos supports three account types: <strong>Talent</strong>, <strong>Client</strong>, and <strong>Company</strong>. Each email address may only be associated with one role. Attempting to register an email that already exists under a different role is prohibited.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">03</div>
            <h2>User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account, for all activities under your account, and for providing accurate information during registration.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">04</div>
            <h2>AI-Assisted Work</h2>
            <p>Synthos uses AI to assist in creative workflows. All AI-generated content is reviewed, edited, and approved by humans before delivery. Users retain ownership of their original work and are responsible for the final output.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">05</div>
            <h2>Payments and Estimates</h2>
            <p>Quotes and estimates are provided for informational purposes. Final pricing is subject to human approval and client agreement before work commences.</p>
          </div>

          <div className="legal-card">
            <div className="legal-card-num">06</div>
            <h2>Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.</p>
          </div>

          <div className="legal-card legal-card-full">
            <div className="legal-card-num">07</div>
            <h2>Contact</h2>
            <p>For questions about these terms, contact us at <Link href="/contact">/contact</Link>.</p>
          </div>
        </div>

        <div className="legal-footer">
          <span className="legal-footer-meta">Last updated: July 2026</span>
          <div className="legal-footer-links">
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </PageWrap>
  )
}
