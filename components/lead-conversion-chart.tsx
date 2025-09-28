"use client"

import * as React from "react"
import { NoSSR } from "@/components/no-ssr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const description = "Lead conversion and retention matrix"

interface RetentionData {
  [leadMonth: string]: {
    [conversionMonth: string]: number
  }
}

interface LeadConversionChartProps {
  data: RetentionData
  months: string[]
}

export function LeadConversionChart({ data, months }: LeadConversionChartProps) {
  const getCellColor = (value: number, maxValue: number) => {
    if (value === 0) return "bg-muted/20"
    const intensity = Math.min(value / maxValue, 1)
    const opacity = 0.2 + (intensity * 0.8)
    return `bg-primary/20` // You can customize this color
  }

  const getCellIntensity = (value: number, maxValue: number) => {
    if (value === 0) return 0.1
    return Math.min(value / maxValue, 1)
  }

  // Find max value for color scaling
  const maxValue = Math.max(
    ...Object.values(data).flatMap(monthData => Object.values(monthData))
  )

  return (
    <NoSSR>
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Lead Conversion Matrix</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Shows when leads created in each month converted to "Enrolled" stage
            </span>
            <span className="@[540px]/card:hidden">Lead Conversion Matrix</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `120px repeat(${months.length}, 1fr)` }}>
                <div className="text-sm font-medium text-muted-foreground p-2">Lead Month</div>
                {months.map(month => (
                  <div key={month} className="text-xs font-medium text-center p-2 text-muted-foreground">
                    {month}
                  </div>
                ))}
              </div>
              
              {/* Data rows */}
              {months.map(leadMonth => (
                <div key={leadMonth} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `120px repeat(${months.length}, 1fr)` }}>
                  <div className="text-sm font-medium p-2 border-r">
                    {leadMonth}
                  </div>
                  {months.map(conversionMonth => {
                    const value = data[leadMonth]?.[conversionMonth] || 0
                    const intensity = getCellIntensity(value, maxValue)
                    const isSameMonth = leadMonth === conversionMonth
                    
                    return (
                      <div
                        key={`${leadMonth}-${conversionMonth}`}
                        className={`
                          p-2 text-center text-xs border rounded-sm transition-all hover:scale-105
                          ${isSameMonth ? 'bg-primary/30 border-primary/50' : 'bg-muted/10'}
                          ${value > 0 ? 'font-semibold' : 'text-muted-foreground'}
                        `}
                        style={{
                          backgroundColor: value > 0 
                            ? `hsl(var(--primary) / ${0.1 + intensity * 0.4})` 
                            : undefined
                        }}
                        title={`${leadMonth} leads converted in ${conversionMonth}: ${value}`}
                      >
                        {value > 0 ? (
                          <Badge variant={isSameMonth ? "default" : "secondary"} className="text-xs">
                            {value}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/30 rounded border border-primary/50"></div>
              <span>Same month conversion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded"></div>
              <span>Later month conversion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted/20 rounded"></div>
              <span>No conversions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </NoSSR>
  )
}
