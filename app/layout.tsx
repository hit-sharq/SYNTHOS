import type { Metadata } from "next"
import type React from "react"
import "./globals.css"
import "@/components/app/animations.css"
import { StoreProvider } from "@/lib/store"
import { ClerkProvider } from "@clerk/nextjs"
import Header from "@/components/app/Header"
import Footer from "@/components/app/Footer"

export const metadata: Metadata = {
  metadataBase: new URL("https://synthos.co.ke"),
  title: {
    default: "Synthos — Kenya's Creative Job Board & Talent Marketplace",
    template: "%s · Synthos",
  },
  description:
    "Kenya's marketplace for creative talent and verified employers. Post jobs, find work, and run projects with AI-assisted precision.",
  openGraph: {
    title: "Synthos — Kenya's Creative Job Board & Talent Marketplace",
    description: "Post jobs, find creative work, and hire verified talent in Kenya.",
    url: "https://synthos.co.ke",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <StoreProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
