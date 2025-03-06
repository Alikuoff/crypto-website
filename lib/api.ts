const API_BASE_URL = "https://api.coingecko.com/api/v3"

export async function fetchCoins(page = 1, perPage = 50) {
  const response = await fetch(
    `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&locale=en`,
    { next: { revalidate: 60 } },
  )

  if (!response.ok) {
    throw new Error("Failed to fetch coins")
  }

  return response.json()
}

export async function fetchGlobalData() {
  const response = await fetch(`${API_BASE_URL}/global`, {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch global data")
  }

  return response.json()
}

export async function fetchTrendingCoins() {
  const response = await fetch(`${API_BASE_URL}/search/trending`, {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch trending coins")
  }

  return response.json()
}

export async function fetchCoinDetails(id: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/${id}?localization=true&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      { next: { revalidate: 60 } },
    )

    if (!response.ok) {
      console.error(`Failed to fetch details for ${id}: ${response.status}`)
      throw new Error(`Failed to fetch details for ${id}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching coin details for ${id}:`, error)
    throw error // Re-throw to be handled by the page component
  }
}

// Update the fetchCoinMarketChart function to handle rate limiting and provide mock data
export async function fetchCoinMarketChart(id: string, days: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`, {
      next: { revalidate: 60 },
    })

    if (response.status === 429) {
      console.warn(`Rate limit exceeded for market chart data for ${id}. Using mock data.`)
      return { prices: generateMockPriceData(days), _isRealData: false }
    }

    if (!response.ok) {
      console.error(`Failed to fetch market chart for ${id}: ${response.status}`)
      // Return mock data structure instead of throwing error
      return { prices: generateMockPriceData(days), _isRealData: false }
    }

    const data = await response.json()
    data._isRealData = true
    return data
  } catch (error) {
    console.error(`Error fetching market chart for ${id}:`, error)
    // Return mock data structure on error
    return { prices: generateMockPriceData(days), _isRealData: false }
  }
}

// Add a function to generate mock price data
function generateMockPriceData(days: string) {
  const now = Date.now()
  const data: [number, number][] = []
  const daysNum = Number.parseInt(days, 10)

  // Generate realistic-looking price data
  let basePrice = 30000 // Starting price

  if (daysNum <= 1) {
    // For 1 day, generate hourly data
    for (let i = 0; i < 24; i++) {
      const timestamp = now - (23 - i) * 3600000 // hourly timestamps
      const volatility = 0.005 // 0.5% volatility per hour
      const changePercent = (Math.random() - 0.5) * 2 * volatility
      basePrice = basePrice * (1 + changePercent)
      data.push([timestamp, basePrice])
    }
  } else {
    // For multiple days, generate daily data
    const dataPoints = daysNum === 7 ? 7 * 4 : daysNum === 30 ? 30 : daysNum // More data points for shorter timeframes
    const timeStep = (daysNum * 86400000) / dataPoints

    for (let i = 0; i < dataPoints; i++) {
      const timestamp = now - (dataPoints - 1 - i) * timeStep
      const volatility = 0.02 // 2% volatility per data point
      const changePercent = (Math.random() - 0.5) * 2 * volatility
      basePrice = basePrice * (1 + changePercent)
      data.push([timestamp, basePrice])
    }
  }

  return data
}

export async function searchCoins(query: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${query}`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error("Failed to search coins")
    }

    return response.json()
  } catch (error) {
    console.error("Error searching coins:", error)
    return { coins: [] }
  }
}

// Update the fetchCoinOHLC function to handle rate limiting and provide mock data
export async function fetchCoinOHLC(id: string, days: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/${id}/ohlc?vs_currency=usd&days=${days}`, {
      next: { revalidate: 60 },
    })

    if (response.status === 429) {
      console.warn(`Rate limit exceeded for OHLC data for ${id}. Using mock data.`)
      return generateMockOHLCData(days)
    }

    if (!response.ok) {
      console.error(`Failed to fetch OHLC data for ${id}: ${response.status}`)
      return generateMockOHLCData(days)
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching OHLC data for ${id}:`, error)
    return generateMockOHLCData(days)
  }
}

// Add a function to generate mock OHLC data
function generateMockOHLCData(days: number) {
  const now = Date.now()
  const data: [number, number, number, number, number][] = []

  // Generate realistic-looking price data with appropriate time spacing
  let basePrice = 30000 // Starting price

  if (days === 1) {
    // For 1 day, generate hourly data with proper spacing
    const hoursToGenerate = 24
    const hourInMs = 3600000

    for (let i = 0; i < hoursToGenerate; i++) {
      const timestamp = now - (hoursToGenerate - 1 - i) * hourInMs
      const volatility = 0.005 // 0.5% volatility per hour
      const changePercent = (Math.random() - 0.5) * 2 * volatility
      basePrice = basePrice * (1 + changePercent)

      const open = basePrice
      const high = open * (1 + Math.random() * 0.01)
      const low = open * (1 - Math.random() * 0.01)
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * (high - low)

      data.push([timestamp, open, high, low, close])
    }
  } else {
    // For multiple days, ensure one data point per day to prevent crowding
    for (let i = 0; i < days; i++) {
      const timestamp = now - (days - 1 - i) * 86400000 // daily timestamps
      const volatility = 0.02 // 2% daily volatility
      const changePercent = (Math.random() - 0.5) * 2 * volatility
      basePrice = basePrice * (1 + changePercent)

      const open = basePrice
      const high = open * (1 + Math.random() * 0.03)
      const low = open * (1 - Math.random() * 0.03)
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * (high - low)

      data.push([timestamp, open, high, low, close])
    }
  }

  return data
}

// Mock data for categories in case the API fails
function getMockCategories() {
  return [
    {
      id: "cryptocurrency",
      name: "Kriptovalyutalar",
      market_cap: 1500000000000,
      market_cap_change_percentage_24h: 2.5,
      volume_24h: 75000000000,
    },
    {
      id: "defi",
      name: "DeFi",
      market_cap: 45000000000,
      market_cap_change_percentage_24h: -1.2,
      volume_24h: 5000000000,
    },
    {
      id: "non-fungible-tokens-nft",
      name: "NFT",
      market_cap: 25000000000,
      market_cap_change_percentage_24h: 0.8,
      volume_24h: 2000000000,
    },
    {
      id: "metaverse",
      name: "Metaverse",
      market_cap: 18000000000,
      market_cap_change_percentage_24h: 3.2,
      volume_24h: 1500000000,
    },
    {
      id: "layer-1",
      name: "Layer 1",
      market_cap: 350000000000,
      market_cap_change_percentage_24h: 1.5,
      volume_24h: 20000000000,
    },
    {
      id: "layer-2",
      name: "Layer 2",
      market_cap: 50000000000,
      market_cap_change_percentage_24h: 4.2,
      volume_24h: 8000000000,
    },
  ]
}

// Update the fetchCategories function to use mock data as fallback
export async function fetchCategories() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/categories`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      console.warn("Failed to fetch categories, using mock data")
      return getMockCategories()
    }

    const data = await response.json()

    // If the API returns empty data or unexpected format, use mock data
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("API returned invalid categories data, using mock data")
      return getMockCategories()
    }

    return data
  } catch (error) {
    console.error("Error fetching categories:", error)
    return getMockCategories()
  }
}

export async function fetchCoinsByCategory(category: string, page = 1, perPage = 50) {
  try {
    // For real implementation, you would use a proper endpoint
    // This is a mock implementation since CoinGecko API doesn't have a direct endpoint for this
    const allCoins = await fetchCoins(page, perPage)

    // In a real implementation, you would filter by category from the API
    // Here we're just returning all coins as if they were in the category
    return allCoins
  } catch (error) {
    console.error(`Error fetching coins for category ${category}:`, error)
    return []
  }
}

export async function fetchCryptoNews() {
  // Bu yerda haqiqiy yangiliklar API-si bo'lmagani uchun,
  // namuna ma'lumotlarni qaytaramiz
  return [
    {
      id: "1",
      title: "Bitcoin yangi rekord darajaga ko'tarildi",
      description: "Bitcoin narxi so'nggi 24 soat ichida 5% ga oshib, yangi rekord darajaga erishdi.",
      url: "https://example.com/news/1",
      image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=600",
      published_at: "2023-05-15T09:30:00Z",
    },
    {
      id: "2",
      title: "Ethereum 2.0 yangilanishi haqida yangi ma'lumotlar",
      description:
        "Ethereum 2.0 yangilanishi bo'yicha yangi ma'lumotlar e'lon qilindi. Yangilanish qachon amalga oshiriladi?",
      url: "https://example.com/news/2",
      image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&h=600",
      published_at: "2023-05-14T14:45:00Z",
    },
    {
      id: "3",
      title: "Kriptovalyuta bozorida yangi tendensiyalar",
      description: "Kriptovalyuta bozorida yangi tendensiyalar paydo bo'lmoqda. Ekspertlar fikri qanday?",
      url: "https://example.com/news/3",
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=600",
      published_at: "2023-05-13T11:20:00Z",
    },
    {
      id: "4",
      title: "Kriptovalyuta sohasida yangi qonunchilik",
      description: "Bir qator davlatlar kriptovalyuta sohasida yangi qonunchilik hujjatlarini qabul qilmoqda.",
      url: "https://example.com/news/4",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=600",
      published_at: "2023-05-12T16:10:00Z",
    },
    {
      id: "5",
      title: "NFT bozori: yangi imkoniyatlar va muammolar",
      description: "NFT bozori rivojlanishda davom etmoqda. Yangi imkoniyatlar va muammolar nimalardan iborat?",
      url: "https://example.com/news/5",
      image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&h=600",
      published_at: "2023-05-11T08:55:00Z",
    },
    {
      id: "6",
      title: "DeFi loyihalar: kelajak istiqbollari",
      description: "Markazlashmagan moliya (DeFi) loyihalari kriptovalyuta sohasida muhim o'rin tutmoqda.",
      url: "https://example.com/news/6",
      image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=800&h=600",
      published_at: "2023-05-10T13:40:00Z",
    },
  ]
}

