"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="admin-content" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--rejected-soft)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <AlertTriangle size={28} style={{ color: "var(--rejected)" }} />
            </div>
            <h3 style={{ color: "var(--ink)", fontFamily: "var(--font-serif)", fontSize: "1.25rem", marginBottom: 8 }}>Something went wrong</h3>
            <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.6 }}>
              {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="admin-btn-primary" onClick={() => window.location.reload()}>
                <RefreshCw size={14} /> Refresh page
              </button>
              <button className="admin-btn" onClick={() => this.setState({ hasError: false, error: undefined })}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
