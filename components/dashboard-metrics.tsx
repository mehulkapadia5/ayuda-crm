import { IconTrendingDown, IconTrendingUp, IconUsers, IconUserPlus, IconTarget } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServiceClient } from "@/lib/supabase/server"

export async function DashboardMetrics() {
  const supabase = getServiceClient()
  
  // Get current date info
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  
  // Get all leads
  const { data: allLeads } = await supabase
    .from("leads")
    .select("created_at, stage")
    .order("created_at", { ascending: false })

  // Calculate metrics
  const totalLeads = allLeads?.length || 0
  
  // Leads created this month
  const leadsThisMonth = allLeads?.filter(lead => {
    const leadDate = new Date(lead.created_at)
    return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear
  }).length || 0
  
  // Enrollments this month
  const enrollmentsThisMonth = allLeads?.filter(lead => {
    const leadDate = new Date(lead.created_at)
    return lead.stage === "Enrolled" && 
           leadDate.getMonth() === currentMonth && 
           leadDate.getFullYear() === currentYear
  }).length || 0
  
  // Growth rate calculation
  const leadsLastMonth = allLeads?.filter(lead => {
    const leadDate = new Date(lead.created_at)
    return leadDate.getMonth() === lastMonth && leadDate.getFullYear() === lastMonthYear
  }).length || 0
  
  const growthRate = leadsLastMonth > 0 
    ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth * 100)
    : leadsThisMonth > 0 ? 100 : 0

  const isGrowthPositive = growthRate >= 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Leads Created This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {leadsThisMonth}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUserPlus className="size-4" />
              {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New leads this month <IconUserPlus className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {leadsThisMonth > 0 ? 'Active lead generation' : 'No leads this month'}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Enrollments This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {enrollmentsThisMonth}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTarget className="size-4" />
              {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Successful enrollments <IconTarget className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {enrollmentsThisMonth > 0 ? 'Great conversion rate' : 'Focus on conversions'}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Leads</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalLeads}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-4" />
              All Time
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total lead database <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Complete lead history
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {Math.abs(growthRate).toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isGrowthPositive ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
              {isGrowthPositive ? '+' : ''}{growthRate.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isGrowthPositive ? 'Growing lead pipeline' : 'Lead generation down'} 
            {isGrowthPositive ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {isGrowthPositive ? 'Month-over-month growth' : 'Needs attention'}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
