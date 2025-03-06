"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { fetchCoins } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpIcon, ArrowDownIcon, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import CryptoPagination from "@/components/crypto-pagination"
import { useToast } from "@/components/ui/use-toast"

export default function CryptoTable() {
  const [coins, setCoins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCoins, setTotalCoins] = useState(100)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem("cryptoWatchlist")
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist))
    }
  }, [])

  useEffect(() => {
    const loadCoins = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCoins(currentPage, pageSize)
        setCoins(data)
        // In a real app, we would get the total count from the API
        setTotalCoins(5000)
      } catch (error) {
        console.error("Error loading coins:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCoins()
  }, [currentPage, pageSize])

  const toggleWatchlist = (coinId: string) => {
    let newWatchlist
    if (watchlist.includes(coinId)) {
      newWatchlist = watchlist.filter((id) => id !== coinId)
      toast({
        title: "Kuzatuv ro'yxatidan olib tashlandi",
        description: "Kriptovalyuta kuzatuv ro'yxatidan muvaffaqiyatli olib tashlandi",
      })
    } else {
      newWatchlist = [...watchlist, coinId]
      toast({
        title: "Kuzatuv ro'yxatiga qo'shildi",
        description: "Kriptovalyuta kuzatuv ro'yxatiga muvaffaqiyatli qo'shildi",
      })
    }
    setWatchlist(newWatchlist)
    localStorage.setItem("cryptoWatchlist", JSON.stringify(newWatchlist))
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nomi</TableHead>
              <TableHead className="text-right">Narxi</TableHead>
              <TableHead className="text-right">24s</TableHead>
              <TableHead className="text-right">Bozor kapitalizatsiyasi</TableHead>
              <TableHead className="text-right">Savdo hajmi (24s)</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coins.map((coin) => (
              <TableRow key={coin.id}>
                <TableCell>{coin.market_cap_rank}</TableCell>
                <TableCell>
                  <Link href={`/crypto/${coin.id}`} className="flex items-center gap-2 hover:text-primary">
                    <img
                      src={coin.image || "/placeholder.svg?height=24&width=24"}
                      alt={coin.name}
                      className="w-6 h-6"
                    />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-muted-foreground text-xs uppercase">{coin.symbol}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-medium">${coin.current_price.toLocaleString()}</TableCell>
                <TableCell
                  className={`text-right ${coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  <div className="flex items-center justify-end gap-1">
                    {coin.price_change_percentage_24h > 0 ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="text-right">${coin.market_cap.toLocaleString()}</TableCell>
                <TableCell className="text-right">${coin.total_volume.toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleWatchlist(coin.id)}
                    title={
                      watchlist.includes(coin.id) ? "Kuzatuv ro'yxatidan olib tashlash" : "Kuzatuv ro'yxatiga qo'shish"
                    }
                  >
                    <Star
                      className={`h-4 w-4 ${
                        watchlist.includes(coin.id) ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CryptoPagination
        totalItems={totalCoins}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}

