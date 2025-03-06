"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CryptoConverterProps {
  coins: Array<{
    id: string
    symbol: string
    name: string
    current_price: number
    image: string
  }>
}

export default function CryptoConverter({ coins }: CryptoConverterProps) {
  const [fromCoin, setFromCoin] = useState(coins[0]?.id || "bitcoin")
  const [toCoin, setToCoin] = useState(coins[1]?.id || "ethereum")
  const [amount, setAmount] = useState("1")
  const [result, setResult] = useState<number | null>(null)

  const fromCoinData = coins.find((coin) => coin.id === fromCoin)
  const toCoinData = coins.find((coin) => coin.id === toCoin)

  useEffect(() => {
    if (fromCoinData && toCoinData && amount) {
      const fromPrice = fromCoinData.current_price
      const toPrice = toCoinData.current_price
      const convertedAmount = (Number.parseFloat(amount) * fromPrice) / toPrice
      setResult(convertedAmount)
    }
  }, [amount, fromCoinData, toCoinData])

  const handleSwap = () => {
    setFromCoin(toCoin)
    setToCoin(fromCoin)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Kriptovalyuta Konvertori</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Miqdor</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
                placeholder="Miqdorni kiriting"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Valyuta</label>
              <Select value={fromCoin} onValueChange={setFromCoin}>
                <SelectTrigger>
                  <SelectValue placeholder="Valyutani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {coins.map((coin) => (
                    <SelectItem key={`from-${coin.id}`} value={coin.id}>
                      <div className="flex items-center">
                        <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-4 h-4 mr-2" />
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="icon" onClick={handleSwap} className="mt-2">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Natija</label>
              <Input type="text" value={result ? result.toFixed(8) : ""} readOnly className="bg-muted" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Valyuta</label>
              <Select value={toCoin} onValueChange={setToCoin}>
                <SelectTrigger>
                  <SelectValue placeholder="Valyutani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {coins.map((coin) => (
                    <SelectItem key={`to-${coin.id}`} value={coin.id}>
                      <div className="flex items-center">
                        <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-4 h-4 mr-2" />
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1"></div>
          </div>

          {fromCoinData && toCoinData && (
            <div className="text-sm text-muted-foreground mt-2">
              1 {fromCoinData.symbol.toUpperCase()} ={" "}
              {(fromCoinData.current_price / toCoinData.current_price).toFixed(8)} {toCoinData.symbol.toUpperCase()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

