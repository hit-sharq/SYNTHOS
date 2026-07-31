"use client"

import { useEffect, useRef, useState } from "react"

export function useReveal(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? "0px 0px -40px 0px",
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options?.threshold, options?.rootMargin])

  return { ref, isVisible }
}

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  variant?: "up" | "left" | "right" | "scale"
}) {
  const { ref, isVisible } = useReveal()

  const baseClass =
    variant === "left"
      ? "reveal-left"
      : variant === "right"
      ? "reveal-right"
      : variant === "scale"
      ? "reveal-scale"
      : "reveal"

  return (
    <div
      ref={ref}
      className={`${baseClass} ${isVisible ? "is-visible" : ""} ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export function StaggerContainer({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const { ref, isVisible } = useReveal()

  return (
    <div
      ref={ref}
      className={`stagger-children ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  )
}
