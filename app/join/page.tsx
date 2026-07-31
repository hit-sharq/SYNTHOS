"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrandMark } from "@/components/app/Header"

export default function JoinPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace("/talent/signup")
    } else {
      const role = user.publicMetadata.role
      if (role === "client") {
        router.replace("/client/dashboard")
      } else if (role === "talent") {
        router.replace("/dashboard/talent")
      } else if (role === "company") {
        router.replace("/company/jobs")
      } else {
        router.replace("/dashboard/overview")
      }
    }
  }, [user, isLoaded, router])

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <p className="muted tiny">Redirecting…</p>
      </main>
    </div>
  )
}
