"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { PageHead, PageWrap } from "@/components/app/Page"
import { CreatorProfile } from "@/components/app/CreatorProfile"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/sign-in"); return }
  }, [user, isLoaded, router])

  if (!isLoaded) {
    return (
      <PageWrap><div style={{ padding: 40, textAlign: "center" }}><p className="muted tiny">Loading…</p></div></PageWrap>
    )
  }

  if (!user) return null

  return (
    <PageWrap>
      <PageHead
        eyebrow="Creator"
        title="Your Profile"
        desc="Showcase your work, level, and achievements."
      />

      <CreatorProfile />
    </PageWrap>
  )
}