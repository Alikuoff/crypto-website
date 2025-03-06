"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchCoins } from "@/lib/api"

export default function CryptoSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        setIsLoading(true)
        try {
          const data = await searchCoins(query)
          setResults(data.coins.slice(0, 5))
          setIsOpen(true)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSelect = (id: string) => {
    router.push(`/crypto/${id}`)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div className="relative w-full md:w-64" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Kriptovalyuta qidirish..."
          className="pl-8 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {results.map((coin) => (
              <li key={coin.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-left"
                  onClick={() => handleSelect(coin.id)}
                >
                  <div className="flex items-center">
                    <img
                      src={coin.thumb || "/placeholder.svg?height=20&width=20"}
                      alt={coin.name}
                      className="w-5 h-5 mr-2 rounded-full"
                    />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">{coin.symbol}</span>
                    {coin.market_cap_rank && (
                      <span className="ml-auto text-xs text-muted-foreground">#{coin.market_cap_rank}</span>
                    )}
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

