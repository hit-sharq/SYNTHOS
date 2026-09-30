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
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  /**
   * Use "contents" when the children need to participate in a parent CSS grid
   * (for example .blog-grid). A wrapper element would otherwise become the
   * single grid item and stack all children into one column.
   */
  as?: "div" | "contents"
}) {
  const { ref, isVisible } = useReveal()

  if (as === "contents") {
    // `display: contents` removes the wrapper from the layout tree, so the
    // children become direct grid items. The class list is kept for any
    // styles that target .stagger-children.
    return (
      <>
        {children}
      </>
    )
  }

  return (
    <div
      ref={ref}
      className={`stagger-children ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  )
}
