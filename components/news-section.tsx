import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCryptoNews } from "@/lib/api"

export default async function NewsSection() {
  const news = await fetchCryptoNews()

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4">Kripto Yangiliklari</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col h-full">
            {item.image && (
              <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
            )}
            <CardHeader>
              <CardTitle className="line-clamp-2">{item.title}</CardTitle>
              <CardDescription>{new Date(item.published_at).toLocaleDateString("uz-UZ")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm line-clamp-3">{item.description}</p>
            </CardContent>
            <CardFooter>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Batafsil o'qish
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

