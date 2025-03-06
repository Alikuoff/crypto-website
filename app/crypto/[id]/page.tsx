import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { fetchCoinDetails, fetchCoinMarketChart, fetchCoinOHLC } from "@/lib/api"
import PriceChart from "@/components/price-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import CandlestickChart from "@/components/candlestick-chart"
import AddToWatchlistButton from "@/components/add-to-watchlist-button"

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const coin = await fetchCoinDetails(params.id)

    return {
      title: `${coin.name} (${coin.symbol.toUpperCase()}) Narxi va Grafigi | KriptoBozor`,
      description: `${coin.name} real vaqt narxi, grafigi, bozor kapitalizatsiyasi va boshqa ma'lumotlar.`,
    }
  } catch (error) {
    return {
      title: "Kriptovalyuta ma'lumotlari | KriptoBozor",
      description: "Kriptovalyuta narxlari, grafiklar va bozor ma'lumotlari",
    }
  }
}

export default async function CryptoPage({ params }: { params: { id: string } }) {
  try {
    const coin = await fetchCoinDetails(params.id)

    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm mb-6 hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Orqaga
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <img
              src={coin.image?.large || "/placeholder.svg?height=48&width=48"}
              alt={coin.name}
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{coin.name}</h1>
              <p className="text-muted-foreground">{coin.symbol?.toUpperCase()}</p>
            </div>
            {coin.market_cap_rank && (
              <div className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">Rank #{coin.market_cap_rank}</div>
            )}
          </div>

          <div className="flex flex-col md:items-end">
            <div className="flex items-center gap-2">
              <div className="text-2xl md:text-3xl font-bold">
                ${coin.market_data?.current_price?.usd?.toLocaleString() || "Ma'lumot mavjud emas"}
              </div>
              <AddToWatchlistButton coinId={params.id} />
            </div>
            {coin.market_data?.price_change_percentage_24h && (
              <div
                className={`flex items-center ${coin.market_data.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
              >
                {coin.market_data.price_change_percentage_24h > 0 ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4" />
                )}
                {Math.abs(coin.market_data.price_change_percentage_24h).toFixed(2)}% (24s)
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Bozor Kapitalizatsiyasi</p>
            <p className="font-bold">
              ${coin.market_data?.market_cap?.usd?.toLocaleString() || "Ma'lumot mavjud emas"}
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">24s Savdo Hajmi</p>
            <p className="font-bold">
              ${coin.market_data?.total_volume?.usd?.toLocaleString() || "Ma'lumot mavjud emas"}
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Aylanma Taklifi</p>
            <p className="font-bold">
              {coin.market_data?.circulating_supply?.toLocaleString() || "Ma'lumot mavjud emas"}
              {coin.symbol?.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <Tabs defaultValue="candle">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Narx Grafigi</h2>
              <div className="flex items-center gap-4">
                <TabsList>
                  <TabsTrigger value="line">Chiziqli</TabsTrigger>
                  <TabsTrigger value="candle">Sham</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="line">
              <Tabs defaultValue="7d">
                <TabsList className="mb-4">
                  <TabsTrigger value="1d">1 kun</TabsTrigger>
                  <TabsTrigger value="7d">7 kun</TabsTrigger>
                  <TabsTrigger value="30d">30 kun</TabsTrigger>
                  <TabsTrigger value="1y">1 yil</TabsTrigger>
                </TabsList>

                <Suspense fallback={<div className="h-80 w-full bg-muted animate-pulse rounded-lg"></div>}>
                  <TabsContent value="1d">
                    <LineChartContainer coinId={params.id} days="1" />
                  </TabsContent>
                  <TabsContent value="7d">
                    <LineChartContainer coinId={params.id} days="7" />
                  </TabsContent>
                  <TabsContent value="30d">
                    <LineChartContainer coinId={params.id} days="30" />
                  </TabsContent>
                  <TabsContent value="1y">
                    <LineChartContainer coinId={params.id} days="365" />
                  </TabsContent>
                </Suspense>
              </Tabs>
            </TabsContent>

            <TabsContent value="candle">
              <Tabs defaultValue="7d">
                <TabsList className="mb-4">
                  <TabsTrigger value="1d">1 kun</TabsTrigger>
                  <TabsTrigger value="7d">7 kun</TabsTrigger>
                  <TabsTrigger value="30d">30 kun</TabsTrigger>
                  <TabsTrigger value="1y">1 yil</TabsTrigger>
                </TabsList>

                <Suspense fallback={<div className="h-80 w-full bg-muted animate-pulse rounded-lg"></div>}>
                  <TabsContent value="1d">
                    <CandleChartContainer coinId={params.id} days={1} />
                  </TabsContent>
                  <TabsContent value="7d">
                    <CandleChartContainer coinId={params.id} days={7} />
                  </TabsContent>
                  <TabsContent value="30d">
                    <CandleChartContainer coinId={params.id} days={30} />
                  </TabsContent>
                  <TabsContent value="1y">
                    <CandleChartContainer coinId={params.id} days={365} />
                  </TabsContent>
                </Suspense>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Haqida</h2>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: coin.description?.uz || coin.description?.en || "Ma'lumot mavjud emas",
              }}
            />
          </div>
        </div>
      </main>
    )
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm mb-6 hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Orqaga
        </Link>

        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Kriptovalyuta topilmadi</h1>
          <p className="text-muted-foreground mb-6">
            Kechirasiz, siz qidirayotgan kriptovalyuta ma'lumotlari mavjud emas.
          </p>
          <Button asChild>
            <Link href="/">Bosh sahifaga qaytish</Link>
          </Button>
        </div>
      </main>
    )
  }
}

async function LineChartContainer({ coinId, days }: { coinId: string; days: string }) {
  try {
    const chartData = await fetchCoinMarketChart(coinId, days)
    const isMockData = chartData.prices.length > 0 && !chartData._isRealData

    return (
      <div className="bg-card p-4 rounded-lg shadow-sm h-[600px]">
        <PriceChart data={chartData.prices} days={days} />
        {isMockData && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            API so'rovlar cheklovi tufayli namunali ma'lumotlar ko'rsatilmoqda
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error(`Error rendering chart for ${coinId}:`, error)
    return (
      <div className="bg-card p-4 rounded-lg shadow-sm h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Grafik ma'lumotlarini yuklashda xatolik yuz berdi</p>
      </div>
    )
  }
}

async function CandleChartContainer({ coinId, days }: { coinId: string; days: number }) {
  try {
    const ohlcData = await fetchCoinOHLC(coinId, days)

    // Check if we got valid data
    if (!ohlcData || ohlcData.length === 0) {
      return (
        <div className="bg-card p-4 rounded-lg shadow-sm h-[600px] flex items-center justify-center flex-col">
          <p className="text-muted-foreground mb-2">Sham grafigi ma'lumotlarini yuklashda xatolik yuz berdi</p>
          <p className="text-xs text-muted-foreground">
            API so'rovlar cheklovi tufayli namunali ma'lumotlar ko'rsatilmoqda
          </p>
        </div>
      )
    }

    return (
      <div className="bg-card p-4 rounded-lg shadow-sm h-[600px]">
        <CandlestickChart data={ohlcData} />
      </div>
    )
  } catch (error) {
    console.error(`Error rendering candlestick chart for ${coinId}:`, error)
    return (
      <div className="bg-card p-4 rounded-lg shadow-sm h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Sham grafigini yuklashda xatolik yuz berdi</p>
      </div>
    )
  }
}

