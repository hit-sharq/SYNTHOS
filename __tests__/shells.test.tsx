import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AdminShell } from "@/components/app/AdminShell"
import { DashboardShell } from "@/components/app/DashboardShell"
import { ClientShell } from "@/components/app/ClientShell"
import { NotificationBell } from "@/components/app/NotificationBell"

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe("Shell Components", () => {
  it("should render AdminShell without crashing", () => {
    render(<AdminShell><div>Admin content</div></AdminShell>)
    expect(screen.getByText("Synthos")).toBeDefined()
  })

  it("should render DashboardShell with admin role", () => {
    render(<DashboardShell role="admin"><div>Dashboard content</div></DashboardShell>)
    expect(screen.getByText("Synthos")).toBeDefined()
  })

  it("should render DashboardShell with talent role", () => {
    render(<DashboardShell role="talent"><div>Talent content</div></DashboardShell>)
    expect(screen.getByText("Synthos")).toBeDefined()
  })

  it("should render ClientShell without crashing", () => {
    render(<ClientShell><div>Client content</div></ClientShell>)
    expect(screen.getByText("Synthos")).toBeDefined()
  })

  it("should render NotificationBell without crashing", () => {
    render(<NotificationBell />)
    expect(screen.getByLabelText("Notifications")).toBeDefined()
  })
})
