"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface AddToWatchlistButtonProps {
  coinId: string
}

export default function AddToWatchlistButton({ coinId }: AddToWatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if the coin is already in the watchlist
    const savedWatchlist = localStorage.getItem("cryptoWatchlist")
    if (savedWatchlist) {
      const watchlist = JSON.parse(savedWatchlist)
      setIsInWatchlist(watchlist.includes(coinId))
    }
  }, [coinId])

  const toggleWatchlist = () => {
    // Get current watchlist
    const savedWatchlist = localStorage.getItem("cryptoWatchlist")
    let watchlist = savedWatchlist ? JSON.parse(savedWatchlist) : []

    if (isInWatchlist) {
      // Remove from watchlist
      watchlist = watchlist.filter((id: string) => id !== coinId)
      toast({
        title: "Kuzatuv ro'yxatidan olib tashlandi",
        description: "Kriptovalyuta kuzatuv ro'yxatidan muvaffaqiyatli olib tashlandi",
      })
    } else {
      // Add to watchlist
      watchlist.push(coinId)
      toast({
        title: "Kuzatuv ro'yxatiga qo'shildi",
        description: "Kriptovalyuta kuzatuv ro'yxatiga muvaffaqiyatli qo'shildi",
      })
    }

    // Save updated watchlist
    localStorage.setItem("cryptoWatchlist", JSON.stringify(watchlist))
    setIsInWatchlist(!isInWatchlist)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleWatchlist}
      title={isInWatchlist ? "Kuzatuv ro'yxatidan olib tashlash" : "Kuzatuv ro'yxatiga qo'shish"}
    >
      <Star className={`h-5 w-5 ${isInWatchlist ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    </Button>
  )
}

