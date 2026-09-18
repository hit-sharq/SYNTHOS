"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PageHead, PageWrap } from "@/components/app/Page"
import LevelBadge from "@/components/app/LevelBadge"
import { cn } from "@/lib/utils"

async function fetchPortfolios() {
  const res = await fetch("/api/portfolios")
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

async function createPortfolio(data: { title: string; description?: string; slug: string }) {
  const res = await fetch("/api/portfolios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

async function createPortfolioItem(portfolioId: string, data: { title: string; description?: string; imageUrl?: string; projectUrl?: string; type?: string }) {
  const res = await fetch(`/api/portfolios/${portfolioId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function PortfolioPage() {
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState({ title: "", description: "", imageUrl: "", projectUrl: "", type: "project" })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({ queryKey: ["portfolios"], queryFn: fetchPortfolios })

  const createMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] })
      setShowForm(false)
      setNewTitle("")
      setNewDesc("")
      setNewSlug("")
    },
  })

  const addItemMutation = useMutation({
    mutationFn: ({ portfolioId, data }: { portfolioId: string; data: any }) => createPortfolioItem(portfolioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] })
      setItemForm({ title: "", description: "", imageUrl: "", projectUrl: "", type: "project" })
    },
  })

  const portfolios = data?.portfolios || []

  return (
    <PageWrap>
      <PageHead
        eyebrow="// Portfolio Builder"
        title="Showcase your work"
        desc="Build a professional portfolio to attract clients and collaborators."
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "New Portfolio"}
          </button>
        }
      />

      {showForm && (
        <div className="panel p-5 mb-6" style={{ borderRadius: 0 }}>
          <div className="stack gap-3">
            <input
              placeholder="Portfolio title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="input"
            />
            <textarea
              placeholder="Description"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="textarea"
            />
            <input
              placeholder="Slug (URL)"
              value={newSlug}
              onChange={e => setNewSlug(e.target.value)}
              className="input"
            />
            <button
              className="btn btn-primary"
              disabled={!newTitle || !newSlug}
              onClick={() => createMutation.mutate({ title: newTitle, description: newDesc, slug: newSlug })}
            >
              Create Portfolio
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="muted">Loading portfolios...</p>}
      {error && <p style={{ color: "var(--rejected)" }}>Failed to load</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {portfolios.map((p: any) => (
          <div key={p.id} className="panel p-5" style={{ borderRadius: 0 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--ink)" }}>{p.title}</h3>
              <LevelBadge level={3} levelXP={500} size="sm" />
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-3)", marginBottom: 12 }}>{p.description || "No description"}</p>
            <div className="row gap-2" style={{ marginBottom: 12 }}>
              <span className="chip">{p.items?.length || 0} items</span>
              <span className="chip">{p.isPublic ? "Public" : "Private"}</span>
            </div>
            <div className="row gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedPortfolio(selectedPortfolio === p.id ? null : p.id)}
              >
                {selectedPortfolio === p.id ? "Hide" : "Add Item"}
              </button>
              <a
                href={`/portfolio/${p.slug}`}
                className="btn btn-signal btn-sm"
                target="_blank"
              >
                View
              </a>
            </div>

            {selectedPortfolio === p.id && (
              <div className="stack gap-2" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                <input
                  placeholder="Item title"
                  value={itemForm.title}
                  onChange={e => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                />
                <input
                  placeholder="Image URL"
                  value={itemForm.imageUrl}
                  onChange={e => setItemForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="input"
                />
                <input
                  placeholder="Project URL"
                  value={itemForm.projectUrl}
                  onChange={e => setItemForm(prev => ({ ...prev, projectUrl: e.target.value }))}
                  className="input"
                />
                <textarea
                  placeholder="Description"
                  value={itemForm.description}
                  onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea"
                />
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!itemForm.title}
                  onClick={() => {
                    addItemMutation.mutate({ portfolioId: p.id, data: itemForm })
                  }}
                >
                  Add Item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {portfolios.length === 0 && (
        <div className="panel p-8 text-center mt-6">
          <p className="muted">No portfolios yet. Create your first one above!</p>
        </div>
      )}
    </PageWrap>
  )
}
