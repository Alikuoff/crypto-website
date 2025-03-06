import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kriptovalyuta Bozori | Real Vaqt Narxlari va Ma'lumotlar",
  description: "Eng so'nggi kriptovalyuta narxlari, grafiklar va bozor ma'lumotlari",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          {children}
          <footer className="border-t py-6 md:py-8">
            <div className="container flex flex-col items-center justify-center gap-4 md:flex-row">
              <p className="text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Kriptovalyuta Bozori. Barcha huquqlar himoyalangan.
              </p>
            </div>
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'