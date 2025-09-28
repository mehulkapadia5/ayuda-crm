"use client"

import { ThemeProvider } from "next-themes"
import { NoSSR } from "@/components/no-ssr"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NoSSR>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </NoSSR>
  )
}

