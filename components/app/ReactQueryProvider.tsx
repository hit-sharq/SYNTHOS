"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { QueryClient } from "@tanstack/react-query"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
