"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { IconCalendar } from "@tabler/icons-react"

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
            {/* Funnel Steps */}
            <div className="space-y-4">
              {/* Leads */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Leads</div>
                    <div className="text-sm text-muted-foreground">Initial inquiries</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{funnelData.leads}</div>
                  <div className="text-sm text-muted-foreground">100%</div>
                </div>
              </div>

              {/* Prospects */}
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Prospects</div>
                    <div className="text-sm text-muted-foreground">Qualified leads</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{funnelData.prospects}</div>
                  <div className="text-sm text-muted-foreground">
                    {leadsToProspectsRate}% conversion
                  </div>
                </div>
              </div>

              {/* Enrolled */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Enrolled</div>
                    <div className="text-sm text-muted-foreground">Converted customers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{funnelData.enrolled}</div>
                  <div className="text-sm text-muted-foreground">
                    {prospectsToEnrolledRate}% conversion
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold">{overallConversionRate}%</div>
                <div className="text-xs text-muted-foreground">Overall Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{funnelData.leads - funnelData.prospects}</div>
                <div className="text-xs text-muted-foreground">Lost at Qualification</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{funnelData.prospects - funnelData.enrolled}</div>
                <div className="text-xs text-muted-foreground">Lost at Enrollment</div>
              </div>
            </div>

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
