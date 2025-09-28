"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { IconCalendar } from "@tabler/icons-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { format, subMonths } from "date-fns"
import { cn } from "@/lib/utils"

interface FunnelData {
  leads: number
  prospects: number
  enrolled: number
}

export function LeadsFunnelChart() {
  const [funnelData, setFunnelData] = useState<FunnelData>({ leads: 0, prospects: 0, enrolled: 0 })
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const fetchFunnelData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/funnel?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`)
      if (res.ok) {
        const data = await res.json()
        setFunnelData(data)
      }
    } catch (error) {
      console.error('Failed to fetch funnel data:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchFunnelData()
  }, [startDate, endDate])

  const handleDateRangeChange = (range: { from?: Date, to?: Date }) => {
    if (range.from) setStartDate(range.from)
    if (range.to) setEndDate(range.to)
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
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lead Conversion Funnel
          <div className="ml-auto">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <IconCalendar className="mr-2 h-4 w-4" />
                  {startDate ? (
                    endDate ? (
                      `${format(startDate, "LLL dd, y")} - ${format(
                        endDate,
                        "LLL dd, y"
                      )}`
                    ) : (
                      format(startDate, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={startDate}
                  selected={{ from: startDate, to: endDate }}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  required
                />
                <div className="p-4 flex justify-end">
                  <Button onClick={() => setIsCalendarOpen(false)}>Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">Loading funnel data...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Conversion */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Overall Conversion</div>
              <div className="text-xl font-bold text-primary">{overallConversionRate}%</div>
            </div>

            {/* Funnel Bar Chart */}
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                width={undefined}
                height={200}
                margin={{
                  top: 20,
                  right: 10,
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
                  maxBarSize={80}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number, entry: { payload?: { conversion?: string } }) => {
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
              Showing data from {format(startDate, "MMM dd, yyyy")} to {format(endDate, "MMM dd, yyyy")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
