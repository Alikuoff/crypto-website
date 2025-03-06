"use client"

import { useState, useRef } from "react"
import { useTheme } from "next-themes"
import { Chart, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale } from "chart.js"
import { Chart as ChartJS } from "react-chartjs-2"
import "chartjs-adapter-date-fns"
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from "chartjs-chart-financial"
import { Filler, LineElement, BarElement } from "chart.js"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RefreshCwIcon,
  LineChart,
  BarChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Register the required components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
  Filler,
  LineElement,
  BarElement,
)

interface CandlestickChartProps {
  data: [number, number, number, number, number][] // [timestamp, open, high, low, close]
  isMockData?: boolean
}

export default function CandlestickChart({ data, isMockData = false }: CandlestickChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const chartRef = useRef<any>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showVolume, setShowVolume] = useState(true)
  const [showMA, setShowMA] = useState(true)
  const [maPeriod, setMAPeriod] = useState("20")
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick")

  // Check if data is empty or undefined
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ma'lumotlar mavjud emas</p>
      </div>
    )
  }

  // Calculate price range for better scaling
  const prices = data.flatMap((item) => [item[1], item[2], item[3], item[4]])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const yAxisMin = minPrice - priceRange * 0.1 // Add 10% padding
  const yAxisMax = maxPrice + priceRange * 0.1

  // Calculate moving average
  const calculateMA = (period: number) => {
    const closes = data.map((item) => item[4])
    const result = []

    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        result.push(null) // Not enough data for MA yet
      } else {
        const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
        result.push(sum / period)
      }
    }

    return result
  }

  const maData = calculateMA(Number.parseInt(maPeriod))

  // Calculate volume data with minimal scaling and extremely subtle appearance
  const volumeData = data.map((item, index) => {
    const [timestamp, open, , , close] = item
    const isUp = close >= open
    const color = isUp
      ? isDark
        ? "rgba(34, 197, 94, 0.04)"
        : "rgba(34, 197, 94, 0.03)"
      : isDark
        ? "rgba(239, 68, 68, 0.04)"
        : "rgba(239, 68, 68, 0.03)"

    // Scale down the volume values dramatically
    const volume = Math.abs(close - open) * 10

    return {
      x: new Date(timestamp),
      y: volume,
      color,
    }
  })

  // Determine if we're looking at intraday data
  const isIntraday = data.length > 0 && new Date(data[data.length - 1][0]).getDate() === new Date(data[0][0]).getDate()

  // Calculate optimal bar settings based on data density
  const calculateBarSettings = () => {
    if (isIntraday) {
      return {
        barPercentage: 0.05, // Much smaller bars for intraday (reduced from 0.1)
        categoryPercentage: 0.05, // Much more spacing for intraday (reduced from 0.1)
        candleWidth: 0.5, // Thinner candles for intraday (reduced from 1)
        capWidth: 0.5, // Thinner caps for intraday (reduced from 1)
        wickWidth: 0.3, // Thinner wicks for intraday (reduced from 0.5)
      }
    }
    return {
      barPercentage: 0.1, // Reduced from 0.2
      categoryPercentage: 0.1, // Reduced from 0.2
      candleWidth: 1, // Reduced from 2
      capWidth: 1, // Reduced from 2
      wickWidth: 0.5, // Reduced from 1
    }
  }

  // Calculate dynamic spacing based on number of data points
  const getDynamicSpacing = () => {
    const dataCount = data.length
    if (dataCount > 100) {
      return {
        barPercentage: 0.03,
        categoryPercentage: 0.03,
      }
    } else if (dataCount > 50) {
      return {
        barPercentage: 0.06,
        categoryPercentage: 0.06,
      }
    } else if (dataCount > 20) {
      return {
        barPercentage: 0.1,
        categoryPercentage: 0.1,
      }
    } else {
      return {
        barPercentage: 0.15,
        categoryPercentage: 0.15,
      }
    }
  }

  const dynamicSpacing = getDynamicSpacing()
  const barSettings = {
    ...calculateBarSettings(),
    ...dynamicSpacing,
  }

  // Format data for candlestick chart
  const chartData = {
    datasets: [
      {
        label: "OHLC",
        type: chartType,
        data: data.map((item) => ({
          x: new Date(item[0]),
          o: item[1],
          h: item[2],
          l: item[3],
          c: item[4],
          y: chartType === "line" ? item[4] : undefined,
        })),
        barPercentage: barSettings.barPercentage,
        categoryPercentage: barSettings.categoryPercentage,
        maxBarThickness: 8, // Add maximum bar thickness to prevent bars from getting too wide
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: chartType === "line" ? 2 : 1,
        pointRadius: chartType === "line" ? 0 : undefined,
        tension: chartType === "line" ? 0.1 : undefined,
        color: {
          up: isDark ? "rgba(34, 197, 94, 0.9)" : "rgba(22, 163, 74, 0.9)",
          down: isDark ? "rgba(239, 68, 68, 0.9)" : "rgba(220, 38, 38, 0.9)",
          unchanged: "#888888",
        },
        borderColor: {
          up: isDark ? "#22c55e" : "#16a34a",
          down: isDark ? "#ef4444" : "#dc2626",
          unchanged: "#888888",
        },
        borderWidth: 1,
        order: 1,
      },
      // Moving Average dataset remains the same
      ...(showMA
        ? [
            {
              label: `${maPeriod} kunlik o'rtacha (MA)`,
              type: "line",
              data: maData.map((ma, index) => ({
                x: new Date(data[index][0]),
                y: ma,
              })),
              borderColor: isDark ? "#f59e0b" : "#d97706",
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
              order: 0,
              yAxisID: "y",
            },
          ]
        : []),
      // Updated Volume dataset
      ...(showVolume
        ? [
            {
              label: "Savdo hajmi",
              type: "bar",
              data: volumeData,
              backgroundColor: volumeData.map((d) => d.color),
              yAxisID: "volume",
              order: 2,
              barThickness: 1, // Make bars extremely thin
              maxBarThickness: 1,
              barPercentage: 0.1, // Extremely small percentage of available width
              categoryPercentage: 0.1, // Extremely small percentage of available width
              borderWidth: 0,
              borderSkipped: false,
            },
          ]
        : []),
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 50,
        bottom: showVolume ? 30 : 20,
        left: 50,
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: isIntraday ? ("hour" as const) : ("day" as const),
          displayFormats: {
            hour: "HH:mm",
            day: "dd MMM",
          },
          stepSize: isIntraday ? 2 : 1, // Show every 2 hours for intraday
        },
        grid: {
          display: true,
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isIntraday ? 12 : 8,
          padding: 10,
          source: "auto",
        },
        border: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        offset: true,
        stacked: false,
        distribution: "linear",
      },
      y: {
        type: "linear" as const,
        position: "right" as const,
        min: yAxisMin,
        max: yAxisMax,
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          callback: (value: any) => `$${value.toLocaleString()}`,
          padding: 10,
        },
        border: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      volume: {
        type: "linear" as const,
        position: "left" as const,
        display: showVolume,
        min: 0,
        max: Math.max(...volumeData.map((d) => d.y)) * 1.1, // Just slightly above max
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
        weight: 1,
        beginAtZero: true,
        offset: true,
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || ""

            if (datasetLabel === "OHLC" && context.raw && context.raw.o !== undefined) {
              const point = context.raw
              return [
                `Ochilish: $${point.o.toLocaleString()}`,
                `Yuqori: $${point.h.toLocaleString()}`,
                `Past: $${point.l.toLocaleString()}`,
                `Yopilish: $${point.c.toLocaleString()}`,
              ]
            } else if (datasetLabel === "Savdo hajmi") {
              return `Savdo hajmi: ${context.raw.y.toLocaleString()}`
            } else if (datasetLabel.includes("o'rtacha")) {
              return `${datasetLabel}: $${context.raw.y.toLocaleString()}`
            }

            return `${datasetLabel}: $${context.raw.toLocaleString()}`
          },
          title: (tooltipItems: any) => {
            const date = new Date(tooltipItems[0].parsed.x)
            return date.toLocaleDateString("uz-UZ", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          },
        },
        backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
        bodyColor: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
        borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      },
    },
    animation: {
      duration: 0, // Disable animation for better performance
    },
    elements: {
      candlestick: {
        capWidth: barSettings.capWidth,
        width: barSettings.candleWidth,
        maxBarThickness: 8, // Limit the maximum thickness of bars
        wick: {
          width: barSettings.wickWidth,
        },
      },
    },
  }

  const handleZoomIn = () => {
    if (chartRef.current) {
      setZoomLevel((prev) => prev + 0.5)
      const chart = chartRef.current
      const newVisibleRange = Math.max(10, Math.floor(data.length / (zoomLevel + 0.5)))
      const startIndex = Math.max(0, data.length - newVisibleRange)

      chart.options.scales.x.min = new Date(data[startIndex][0])
      chart.options.scales.x.max = new Date(data[data.length - 1][0])
      chart.update()
      if (chartRef.current) {
        chartRef.current.update("none") // Use 'none' mode to prevent animation during update
      }
    }
  }

  const handleZoomOut = () => {
    if (chartRef.current) {
      if (zoomLevel > 1) {
        setZoomLevel((prev) => prev - 0.5)
        const chart = chartRef.current
        const newVisibleRange = Math.max(10, Math.floor(data.length / (zoomLevel - 0.5)))
        const startIndex = Math.max(0, data.length - newVisibleRange)

        chart.options.scales.x.min = new Date(data[startIndex][0])
        chart.options.scales.x.max = new Date(data[data.length - 1][0])
        chart.update()
        if (chartRef.current) {
          chartRef.current.update("none") // Use 'none' mode to prevent animation during update
        }
      } else {
        // Reset to show all data
        const chart = chartRef.current
        chart.options.scales.x.min = new Date(data[0][0])
        chart.options.scales.x.max = new Date(data[data.length - 1][0])
        chart.update()
        if (chartRef.current) {
          chartRef.current.update("none") // Use 'none' mode to prevent animation during update
        }
      }
    }
  }

  const handlePanLeft = () => {
    if (chartRef.current) {
      const chart = chartRef.current
      const currentMin = new Date(chart.options.scales.x.min).getTime()
      const currentMax = new Date(chart.options.scales.x.max).getTime()
      const range = currentMax - currentMin
      const newMin = Math.max(data[0][0], currentMin - range * 0.2)
      const newMax = newMin + range

      chart.options.scales.x.min = new Date(newMin)
      chart.options.scales.x.max = new Date(newMax)
      chart.update()
      if (chartRef.current) {
        chartRef.current.update("none") // Use 'none' mode to prevent animation during update
      }
    }
  }

  const handlePanRight = () => {
    if (chartRef.current) {
      const chart = chartRef.current
      const currentMin = new Date(chart.options.scales.x.min).getTime()
      const currentMax = new Date(chart.options.scales.x.max).getTime()
      const range = currentMax - currentMin
      const newMax = Math.min(data[data.length - 1][0], currentMax + range * 0.2)
      const newMin = newMax - range

      chart.options.scales.x.min = new Date(newMin)
      chart.options.scales.x.max = new Date(newMax)
      chart.update()
      if (chartRef.current) {
        chartRef.current.update("none") // Use 'none' mode to prevent animation during update
      }
    }
  }

  const handleReset = () => {
    if (chartRef.current) {
      setZoomLevel(1)
      const chart = chartRef.current
      chart.options.scales.x.min = new Date(data[0][0])
      chart.options.scales.x.max = new Date(data[data.length - 1][0])
      chart.update()
      if (chartRef.current) {
        chartRef.current.update("none") // Use 'none' mode to prevent animation during update
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setChartType(chartType === "candlestick" ? "line" : "candlestick")}
                >
                  {chartType === "candlestick" ? <LineChart className="h-4 w-4" /> : <BarChart className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{chartType === "candlestick" ? "Chiziqli grafik" : "Sham grafigi"}</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>

          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowVolume(!showVolume)}
                  className={showVolume ? "bg-primary/10" : ""}
                >
                  <BarChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Savdo hajmini {showVolume ? "yashirish" : "ko'rsatish"}</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMA(!showMA)}
              className={showMA ? "bg-primary/10" : ""}
            >
              MA
            </Button>

            {showMA && (
              <Select value={maPeriod} onValueChange={setMAPeriod}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue placeholder="Davr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 kun</SelectItem>
                  <SelectItem value="14">14 kun</SelectItem>
                  <SelectItem value="20">20 kun</SelectItem>
                  <SelectItem value="50">50 kun</SelectItem>
                  <SelectItem value="100">100 kun</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handlePanLeft}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePanRight}>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-grow relative bg-card rounded-lg p-4 min-h-[500px]">
        <ChartJS
          ref={chartRef}
          type={chartType === "candlestick" ? "candlestick" : "line"}
          data={chartData}
          options={options}
        />
      </div>

      <div className="mt-2 text-xs text-muted-foreground text-center">
        {isMockData
          ? "API so'rovlar cheklovi tufayli namunali ma'lumotlar ko'rsatilmoqda"
          : "Grafik ustida sichqonchani harakatlantiring yoki tugmalardan foydalaning"}
      </div>
    </div>
  )
}

