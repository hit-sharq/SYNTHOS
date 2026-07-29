import { SignUp } from "@clerk/nextjs"

export default function SignUpPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const redirectUrl = searchParams.redirect || "/talents/profile"
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <SignUp redirectUrl={redirectUrl} />
    </div>
  )
}
