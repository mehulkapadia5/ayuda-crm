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
            {/* Horizontal Funnel Steps */}
            <div className="space-y-6">
              {/* Overall Conversion */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Overall Conversion</div>
                <div className="text-2xl font-bold text-primary">{overallConversionRate}%</div>
              </div>

              {/* Horizontal Funnel */}
              <div className="flex items-center justify-center space-x-4">
                {/* Step 1: Leads */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">1</div>
                  <div className="text-center">
                    <div className="font-medium text-sm">Leads</div>
                    <div className="text-xs text-muted-foreground">{funnelData.leads.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">100%</div>
                  </div>
                </div>

                {/* Arrow 1 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-muted-foreground">{leadsToProspectsRate}%</div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>

                {/* Step 2: Prospects */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-lg font-bold">2</div>
                  <div className="text-center">
                    <div className="font-medium text-sm">Prospects</div>
                    <div className="text-xs text-muted-foreground">{funnelData.prospects.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{leadsToProspectsRate}%</div>
                  </div>
                </div>

                {/* Arrow 2 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-muted-foreground">{prospectsToEnrolledRate}%</div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>

                {/* Step 3: Enrolled */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold">3</div>
                  <div className="text-center">
                    <div className="font-medium text-sm">Enrolled</div>
                    <div className="text-xs text-muted-foreground">{funnelData.enrolled.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{prospectsToEnrolledRate}%</div>
                  </div>
                </div>
              </div>

              {/* Step Descriptions */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                <div>Initial inquiries</div>
                <div>Qualified leads</div>
                <div>Converted customers</div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold">{funnelData.leads - funnelData.prospects}</div>
                <div className="text-xs text-muted-foreground">Lost at Qualification</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{funnelData.prospects - funnelData.enrolled}</div>
                <div className="text-xs text-muted-foreground">Lost at Enrollment</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{funnelData.enrolled}</div>
                <div className="text-xs text-muted-foreground">Total Enrolled</div>
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
