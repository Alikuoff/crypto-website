"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpIcon, ArrowDownIcon, Star, ArrowUp, ArrowDown, SlidersHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CryptoPagination from "@/components/crypto-pagination"
import { useToast } from "@/components/ui/use-toast"
import { fetchCoins, fetchCoinsByCategory } from "@/lib/api"

interface MarketTableProps {
  category?: string
}

export default function MarketTable({ category }: MarketTableProps) {
  const [coins, setCoins] = useState<any[]>([])
  const [filteredCoins, setFilteredCoins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalCoins, setTotalCoins] = useState(250)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({
    key: "market_cap_rank",
    direction: "ascending",
  })
  const [priceChangeFilter, setPriceChangeFilter] = useState("all")
  const [marketCapFilter, setMarketCapFilter] = useState("all")
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
        let data
        if (category) {
          data = await fetchCoinsByCategory(category, currentPage, pageSize)
        } else {
          data = await fetchCoins(currentPage, pageSize)
        }
        setCoins(data)
        setFilteredCoins(data)
        // In a real app, we would get the total count from the API
        setTotalCoins(5000)
      } catch (error) {
        console.error("Error loading coins:", error)
        toast({
          title: "Xatolik",
          description: "Kriptovalyutalarni yuklashda xatolik yuz berdi",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCoins()
  }, [currentPage, pageSize, category, toast])

  useEffect(() => {
    // Apply filters and search
    let result = [...coins]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (coin) => coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query),
      )
    }

    // Apply price change filter
    if (priceChangeFilter !== "all") {
      if (priceChangeFilter === "positive") {
        result = result.filter((coin) => coin.price_change_percentage_24h > 0)
      } else if (priceChangeFilter === "negative") {
        result = result.filter((coin) => coin.price_change_percentage_24h < 0)
      }
    }

    // Apply market cap filter
    if (marketCapFilter !== "all") {
      if (marketCapFilter === "large") {
        result = result.filter((coin) => coin.market_cap > 10000000000) // > $10B
      } else if (marketCapFilter === "medium") {
        result = result.filter((coin) => coin.market_cap <= 10000000000 && coin.market_cap > 1000000000) // $1B - $10B
      } else if (marketCapFilter === "small") {
        result = result.filter((coin) => coin.market_cap <= 1000000000) // < $1B
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredCoins(result)
  }, [coins, searchQuery, priceChangeFilter, marketCapFilter, sortConfig])

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

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

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  const resetFilters = () => {
    setSearchQuery("")
    setPriceChangeFilter("all")
    setMarketCapFilter("all")
    setSortConfig({
      key: "market_cap_rank",
      direction: "ascending",
    })
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
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Kriptovalyuta qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtrlar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtrlar</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="p-2">
                <label className="text-sm font-medium mb-1 block">Narx o'zgarishi (24s)</label>
                <Select value={priceChangeFilter} onValueChange={setPriceChangeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Barcha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha</SelectItem>
                    <SelectItem value="positive">Ijobiy</SelectItem>
                    <SelectItem value="negative">Salbiy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-2">
                <label className="text-sm font-medium mb-1 block">Bozor kapitalizatsiyasi</label>
                <Select value={marketCapFilter} onValueChange={setMarketCapFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Barcha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha</SelectItem>
                    <SelectItem value="large">Katta ($10B+)</SelectItem>
                    <SelectItem value="medium">O'rta ($1B-$10B)</SelectItem>
                    <SelectItem value="small">Kichik ($1B-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button variant="ghost" className="w-full justify-center" onClick={resetFilters}>
                  Filtrlarni tozalash
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground whitespace-nowrap">Ko'rsatilmoqda: {filteredCoins.length} ta</p>
        </div>
      </div>

      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <button className="flex items-center" onClick={() => requestSort("market_cap_rank")}>
                  # {getSortIcon("market_cap_rank")}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center" onClick={() => requestSort("name")}>
                  Nomi {getSortIcon("name")}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end w-full" onClick={() => requestSort("current_price")}>
                  Narxi {getSortIcon("current_price")}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  className="flex items-center justify-end w-full"
                  onClick={() => requestSort("price_change_percentage_24h")}
                >
                  24s {getSortIcon("price_change_percentage_24h")}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end w-full" onClick={() => requestSort("market_cap")}>
                  Bozor kapitalizatsiyasi {getSortIcon("market_cap")}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center justify-end w-full" onClick={() => requestSort("total_volume")}>
                  Savdo hajmi (24s) {getSortIcon("total_volume")}
                </button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">Kriptovalyutalar topilmadi</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCoins.map((coin) => (
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
                        watchlist.includes(coin.id)
                          ? "Kuzatuv ro'yxatidan olib tashlash"
                          : "Kuzatuv ro'yxatiga qo'shish"
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
              ))
            )}
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

