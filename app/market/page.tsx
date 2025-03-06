import { Suspense } from "react"
import { fetchGlobalData } from "@/lib/api"
import MarketOverview from "@/components/market-overview"
import MarketTable from "@/components/market-table"
import MarketCategories from "@/components/market-categories"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Kriptovalyuta Bozori | Barcha Kriptovalyutalar",
  description: "Eng so'nggi kriptovalyuta narxlari, bozor kapitalizatsiyasi va savdo hajmi ma'lumotlari",
}

export default async function MarketPage() {
  const globalData = await fetchGlobalData()

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Kriptovalyuta Bozori</h1>
        <p className="text-muted-foreground">Eng so'nggi kriptovalyuta narxlari va bozor ma'lumotlari</p>
      </section>

      <Suspense fallback={<div className="h-40 w-full bg-muted animate-pulse rounded-lg"></div>}>
        <MarketOverview globalData={globalData} />
      </Suspense>

      <section className="my-8">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all">Barcha Kriptovalyutalar</TabsTrigger>
              <TabsTrigger value="categories">Kategoriyalar</TabsTrigger>
              <TabsTrigger value="defi">DeFi</TabsTrigger>
              <TabsTrigger value="nft">NFT</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <Suspense fallback={<div className="h-96 w-full bg-muted animate-pulse rounded-lg"></div>}>
              <MarketTable />
            </Suspense>
          </TabsContent>

          <TabsContent value="categories">
            <Suspense fallback={<div className="h-96 w-full bg-muted animate-pulse rounded-lg"></div>}>
              <MarketCategories />
            </Suspense>
          </TabsContent>

          <TabsContent value="defi">
            <Suspense fallback={<div className="h-96 w-full bg-muted animate-pulse rounded-lg"></div>}>
              <MarketTable category="defi" />
            </Suspense>
          </TabsContent>

          <TabsContent value="nft">
            <Suspense fallback={<div className="h-96 w-full bg-muted animate-pulse rounded-lg"></div>}>
              <MarketTable category="non-fungible-tokens-nft" />
            </Suspense>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

