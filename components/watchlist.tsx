"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, StarOff, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCoins } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [watchlistData, setWatchlistData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem("cryptoWatchlist")
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist))
    }
  }, [])

  useEffect(() => {
    const loadWatchlistData = async () => {
      if (watchlist.length === 0) {
        setWatchlistData([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const allCoins = await fetchCoins()
        const filteredCoins = allCoins.filter((coin: any) => watchlist.includes(coin.id))
        setWatchlistData(filteredCoins)
      } catch (error) {
        console.error("Error loading watchlist data:", error)
        toast({
          title: "Xatolik",
          description: "Kuzatuv ro'yxati ma'lumotlarini yuklashda xatolik yuz berdi",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWatchlistData()
  }, [watchlist, toast])

  const removeFromWatchlist = (id: string) => {
    const newWatchlist = watchlist.filter((coinId) => coinId !== id)
    setWatchlist(newWatchlist)
    localStorage.setItem("cryptoWatchlist", JSON.stringify(newWatchlist))

    toast({
      title: "Kuzatuv ro'yxatidan olib tashlandi",
      description: "Kriptovalyuta kuzatuv ro'yxatidan muvaffaqiyatli olib tashlandi",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kuzatuv Ro'yxati</CardTitle>
          <CardDescription>Siz kuzatayotgan kriptovalyutalar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kuzatuv Ro'yxati</CardTitle>
          <CardDescription>Siz kuzatayotgan kriptovalyutalar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <StarOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Kuzatuv ro'yxati bo'sh</h3>
            <p className="text-muted-foreground mb-4">
              Kriptovalyutalarni kuzatish uchun ularni kuzatuv ro'yxatiga qo'shing
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kuzatuv Ro'yxati</CardTitle>
        <CardDescription>Siz kuzatayotgan kriptovalyutalar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {watchlistData.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Link href={`/crypto/${coin.id}`} className="flex items-center gap-2 flex-1">
                <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-6 h-6 rounded-full" />
                <div>
                  <div className="font-medium">{coin.name}</div>
                  <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                </div>
              </Link>
              <div className="text-right mr-4">
                <div className="font-medium">${coin.current_price.toLocaleString()}</div>
                <div
                  className={`text-xs flex items-center justify-end ${
                    coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {coin.price_change_percentage_24h > 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFromWatchlist(coin.id)}>
                <Star className="h-4 w-4 fill-primary text-primary" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

