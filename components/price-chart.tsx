"use client"

import { useTheme } from "next-themes"
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale } from "chart.js"
import { Line } from "react-chartjs-2"
import "chartjs-adapter-date-fns"

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale)

interface PriceChartProps {
  data: [number, number][]
  days: string
}

export default function PriceChart({ data, days }: PriceChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Check if data is empty or undefined
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ma'lumotlar mavjud emas</p>
      </div>
    )
  }

  // Calculate price range for better scaling
  const prices = data.map((item) => item[1])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const yAxisMin = minPrice - priceRange * 0.05 // Add 5% padding
  const yAxisMax = maxPrice + priceRange * 0.05

  const chartData = {
    labels: data.map((item) => new Date(item[0])),
    datasets: [
      {
        label: "Narx",
        data: data.map((item) => item[1]),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: days === "1" ? "hour" : days === "7" ? "day" : "month",
        },
        grid: {
          display: false,
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
      y: {
        min: yAxisMin,
        max: yAxisMax,
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `Narx: $${context.raw.toLocaleString()}`,
        },
        backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
        bodyColor: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
        borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
      },
    },
  }

  return <Line data={chartData} options={options} />
}

