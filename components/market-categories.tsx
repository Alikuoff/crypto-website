"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { fetchCategories } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function MarketCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCategories()
        setCategories(data)
        setFilteredCategories(data)
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Xatolik",
          description: "Kategoriyalarni yuklashda xatolik yuz berdi",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [toast])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = categories.filter((category) => category.name.toLowerCase().includes(query))
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [categories, searchQuery])

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
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Kategoriya qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Kategoriyalar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/market?category=${category.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    {category.market_cap_change_percentage_24h !== null &&
                    category.market_cap_change_percentage_24h !== undefined ? (
                      <div
                        className={`text-sm flex items-center ${
                          category.market_cap_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {category.market_cap_change_percentage_24h > 0 ? (
                          <ArrowUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(category.market_cap_change_percentage_24h).toFixed(2)}%
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">O'zgarish: Ma'lumot mavjud emas</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Bozor kapitalizatsiyasi: $
                    {category.market_cap ? category.market_cap.toLocaleString() : "Ma'lumot mavjud emas"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Savdo hajmi (24s): $
                    {category.volume_24h ? category.volume_24h.toLocaleString() : "Ma'lumot mavjud emas"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

