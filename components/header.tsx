"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import CryptoSearch from "@/components/crypto-search"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Kripto<span className="text-primary">Bozor</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-primary transition-colors">
                  Bozor
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-primary transition-colors">
                  Yangiliklar
                </Link>
              </li>
            </ul>
          </nav>

          <CryptoSearch />

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden p-4 border-t">
          <nav className="mb-4">
            <ul className="space-y-3">
              <li>
                <Link href="/" className="block hover:text-primary transition-colors" onClick={toggleMenu}>
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/market" className="block hover:text-primary transition-colors" onClick={toggleMenu}>
                  Bozor
                </Link>
              </li>
              <li>
                <Link href="/news" className="block hover:text-primary transition-colors" onClick={toggleMenu}>
                  Yangiliklar
                </Link>
              </li>
            </ul>
          </nav>

          <CryptoSearch />

          <div className="mt-4 flex justify-center">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

