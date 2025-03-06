import { Suspense } from "react"
import CryptoTable from "@/components/crypto-table"
import MarketOverview from "@/components/market-overview"
import NewsSection from "@/components/news-section"
import Watchlist from "@/components/watchlist"
import CryptoConverter from "@/components/crypto-converter"
import { fetchTrendingCoins, fetchGlobalData, fetchCoins } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function Home() {
  const globalData = await fetchGlobalData()
  const trendingCoins = await fetchTrendingCoins()
  const topCoins = await fetchCoins(1, 10)

  return (
    <main className="min-h-screen p-4 md:p-8">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Kriptovalyuta Bozori</h1>
        <p className="text-muted-foreground">Eng so'nggi kriptovalyuta narxlari va bozor ma'lumotlari</p>
      </section>

      <Suspense fallback={<div className="h-40 w-full bg-muted animate-pulse rounded-lg"></div>}>
        <MarketOverview globalData={globalData} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Kriptovalyutalar</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <Suspense fallback={<div className="h-96 w-full bg-muted animate-pulse rounded-lg"></div>}>
                <CryptoTable />
              </Suspense>
            </TabsContent>
            <TabsContent value="trending">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingCoins.coins.map((item) => (
                  <div key={item.item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={item.item.small || "/placeholder.svg?height=32&width=32"}
                        alt={item.item.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <h3 className="font-semibold">{item.item.name}</h3>
                      <span className="text-sm text-muted-foreground">{item.item.symbol}</span>
                    </div>
                    <p className="text-sm">Rank: #{item.item.market_cap_rank}</p>
                    <p className="text-sm">Price (BTC): {item.item.price_btc.toFixed(8)}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Watchlist />
          <CryptoConverter coins={topCoins} />
        </div>
      </div>

      <Suspense fallback={<div className="h-60 w-full bg-muted animate-pulse rounded-lg"></div>}>
        <NewsSection />
      </Suspense>
    </main>
  )
}

