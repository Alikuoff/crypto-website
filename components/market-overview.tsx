import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"

interface MarketOverviewProps {
  globalData: {
    data: {
      active_cryptocurrencies: number
      markets: number
      total_market_cap: { usd: number }
      total_volume: { usd: number }
      market_cap_percentage: { btc: number; eth: number }
      market_cap_change_percentage_24h_usd: number
    }
  }
}

export default function MarketOverview({ globalData }: MarketOverviewProps) {
  const { data } = globalData

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    }
    return `$${num.toLocaleString()}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Umumiy Bozor Kapitalizatsiyasi</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.total_market_cap.usd)}</div>
          <p className="text-xs text-muted-foreground">
            <span
              className={`inline-flex items-center ${data.market_cap_change_percentage_24h_usd > 0 ? "text-green-500" : "text-red-500"}`}
            >
              {data.market_cap_change_percentage_24h_usd > 0 ? (
                <ArrowUpIcon className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3 w-3" />
              )}
              {Math.abs(data.market_cap_change_percentage_24h_usd).toFixed(2)}%
            </span>{" "}
            so'nggi 24 soat ichida
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">24 Soatlik Savdo Hajmi</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.total_volume.usd)}</div>
          <p className="text-xs text-muted-foreground">
            {((data.total_volume.usd / data.total_market_cap.usd) * 100).toFixed(2)}% bozor kapitalizatsiyasidan
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BTC Dominantligi</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.market_cap_percentage.btc.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">ETH: {data.market_cap_percentage.eth.toFixed(2)}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faol Kriptovalyutalar</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.active_cryptocurrencies.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{data.markets.toLocaleString()} bozorlar</p>
        </CardContent>
      </Card>
    </div>
  )
}

