"use client"

import { useState, useEffect } from "react"
import { PageHead } from "@/components/app/Page"
import { ErrorState } from "@/components/app/ui"
import { logAuditAction } from "@/app/actions/audit"
import { AdminShell } from "@/components/app/AdminShell"

type Settings = Record<string, any>

const DEFAULTS: Settings = {
  siteName: "Synthos",
  siteDescription: "Creative Intelligence Platform",
  contactEmail: "hello@synthos.co.ke",
  maxProjectsPerClient: "10",
  allowPublicJobPostings: true,
  requireEmailVerification: true,
  defaultProjectType: "Brand & Campaign",
  aiAutoWorkflowEnabled: true,
  aiConfidenceThreshold: "75",
  emailNotificationsEnabled: true,
  maintenanceMode: false,
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    try {
      const res = await fetch("/api/settings")
      if (!res.ok) throw new Error("Failed to load settings")
      const data = await res.json()
      setSettings({ ...DEFAULTS, ...data.settings })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      await logAuditAction({ action: "settings.update", targetType: "SiteSettings", changes: settings })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="admin-content">
          <PageHead eyebrow="Admin" title="Settings" desc="System configuration and preferences." />
          <p style={{ color: "#8e8e93" }}>Loading settings…</p>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="admin-content">
        <PageHead
          eyebrow="Admin"
          title="Settings"
          desc="System configuration and preferences."
          actions={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ color: "var(--approved)", fontSize: "0.82rem", fontWeight: 600 }}>Saved!</span>}
              <button className="admin-btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          }
        />

        {error && <ErrorState title="Could not load settings" message={error} onRetry={load} style={{ marginBottom: 20 }} />}

        <div style={{ display: "grid", gap: 24 }}>
          <div className="admin-section" style={{ padding: 24 }}>
            <h3 className="admin-section-title" style={{ marginTop: 0 }}>General</h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div className="field">
                <label>Site Name</label>
                <input className="admin-input" value={settings.siteName || ""} onChange={(e) => update("siteName", e.target.value)} />
              </div>
              <div className="field">
                <label>Site Description</label>
                <input className="admin-input" value={settings.siteDescription || ""} onChange={(e) => update("siteDescription", e.target.value)} />
              </div>
              <div className="field">
                <label>Contact Email</label>
                <input className="admin-input" type="email" value={settings.contactEmail || ""} onChange={(e) => update("contactEmail", e.target.value)} />
              </div>
              <div className="field">
                <label>Max Projects Per Client</label>
                <input className="admin-input" type="number" value={settings.maxProjectsPerClient || ""} onChange={(e) => update("maxProjectsPerClient", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ padding: 24 }}>
            <h3 className="admin-section-title" style={{ marginTop: 0 }}>Features</h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div className="field">
                <label>Default Project Type</label>
                <select className="admin-input" value={settings.defaultProjectType || "Brand & Campaign"} onChange={(e) => update("defaultProjectType", e.target.value)}>
                  <option value="Brand & Campaign">Brand & Campaign</option>
                  <option value="Film & Motion">Film & Motion</option>
                  <option value="Web & Product">Web & Product</option>
                  <option value="Strategy & Campaign">Strategy & Campaign</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" id="aiAutoWorkflow" checked={settings.aiAutoWorkflowEnabled || false} onChange={(e) => update("aiAutoWorkflowEnabled", e.target.checked)} />
                <label htmlFor="aiAutoWorkflow" style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Enable AI Auto-Workflow</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" id="publicJobs" checked={settings.allowPublicJobPostings || false} onChange={(e) => update("allowPublicJobPostings", e.target.checked)} />
                <label htmlFor="publicJobs" style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Allow Public Job Postings</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" id="emailNotif" checked={settings.emailNotificationsEnabled || false} onChange={(e) => update("emailNotificationsEnabled", e.target.checked)} />
                <label htmlFor="emailNotif" style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Enable Email Notifications</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" id="emailVerify" checked={settings.requireEmailVerification || false} onChange={(e) => update("requireEmailVerification", e.target.checked)} />
                <label htmlFor="emailVerify" style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Require Email Verification</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" id="maintenance" checked={settings.maintenanceMode || false} onChange={(e) => update("maintenanceMode", e.target.checked)} />
                <label htmlFor="maintenance" style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Maintenance Mode</label>
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ padding: 24 }}>
            <h3 className="admin-section-title" style={{ marginTop: 0 }}>AI Configuration</h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div className="field">
                <label>AI Confidence Threshold (%)</label>
                <input className="admin-input" type="number" min="0" max="100" value={settings.aiConfidenceThreshold || "75"} onChange={(e) => update("aiConfidenceThreshold", e.target.value)} />
                <p className="tiny muted" style={{ marginTop: 4 }}>Minimum confidence level for AI-generated content to be considered reliable.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}