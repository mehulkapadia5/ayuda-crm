"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { IconCalendar } from "@tabler/icons-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface FunnelData {
  leads: number
  prospects: number
  enrolled: number
}

interface LeadsFunnelChartProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void
}

export function LeadsFunnelChart({ onDateRangeChange }: LeadsFunnelChartProps) {
  const [funnelData, setFunnelData] = useState<FunnelData>({ leads: 0, prospects: 0, enrolled: 0 })
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1) // Default to last month
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const fetchFunnelData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/funnel?startDate=${startDate}&endDate=${endDate}`)
      if (res.ok) {
        const data = await res.json()
        setFunnelData(data)
      }
    } catch (error) {
      console.error('Failed to fetch funnel data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFunnelData()
  }, [startDate, endDate])

  const handleDateRangeUpdate = () => {
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate)
    }
    fetchFunnelData()
  }

  const calculateConversionRate = (from: number, to: number) => {
    if (from === 0) return 0
    return ((to / from) * 100).toFixed(1)
  }

  const leadsToProspectsRate = calculateConversionRate(funnelData.leads, funnelData.prospects)
  const prospectsToEnrolledRate = calculateConversionRate(funnelData.prospects, funnelData.enrolled)
  const overallConversionRate = calculateConversionRate(funnelData.leads, funnelData.enrolled)

  // Prepare chart data
  const chartData = [
    { 
      step: "Leads", 
      count: funnelData.leads, 
      conversion: "100%",
      color: "var(--chart-1)"
    },
    { 
      step: "Prospects", 
      count: funnelData.prospects, 
      conversion: `${leadsToProspectsRate}%`,
      color: "var(--chart-2)"
    },
    { 
      step: "Enrolled", 
      count: funnelData.enrolled, 
      conversion: `${prospectsToEnrolledRate}%`,
      color: "var(--chart-3)"
    },
  ]

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendar className="h-5 w-5" />
          Lead Conversion Funnel
        </CardTitle>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate" className="text-sm">From:</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[140px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate" className="text-sm">To:</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[140px]"
            />
          </div>
          <Button onClick={handleDateRangeUpdate} size="sm">
            Update
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">Loading funnel data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Conversion */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Overall Conversion</div>
              <div className="text-2xl font-bold text-primary">{overallConversionRate}%</div>
            </div>

            {/* Funnel Bar Chart */}
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="step"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--color-count)" 
                  radius={8}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number, entry: any) => {
                      const conversion = entry?.payload?.conversion || "0%"
                      return [
                        `${value.toLocaleString()} (${conversion})`,
                        ""
                      ]
                    }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>


            {/* Date Range Info */}
            <div className="text-center text-xs text-muted-foreground">
              Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
