import { SignIn } from "@clerk/nextjs"
import { AuthLayout } from "@/components/app/AuthLayout"

export default function SignInPage() {
  return (
    <AuthLayout>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-[var(--line)] bg-[var(--bg)]",
              headerTitle: "font-[family-name:var(--font-serif)] text-[var(--ink)]",
              headerSubtitle: "text-[var(--ink-3)]",
              socialButtonsBlockButton: "border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
              formButtonPrimary: "bg-[var(--signal)] text-white hover:bg-[var(--signal)]/90",
              input: "border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] focus:border-[var(--signal)]",
              footerActionLink: "text-[var(--signal)]",
            }
          }}
          redirectUrl="/dashboard/overview"
        />
      </div>
    </AuthLayout>
  )
}
