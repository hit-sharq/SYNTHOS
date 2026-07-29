import { SignUp } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default function SignUpPage({ searchParams }: { searchParams: { redirect?: string; role?: string } }) {
  if (searchParams.role === "client") {
    redirect("/client/signup")
  }
  const redirectUrl = searchParams.redirect || "/talents/profile"
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <SignUp redirectUrl={redirectUrl} />
    </div>
  )
}
