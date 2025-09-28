export const dynamic = "force-dynamic"
export const revalidate = 0
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServiceClient } from "@/lib/supabase/server"

export default async function AnalyticsPage() {
  const supabase = getServiceClient()
  // Simple counts as placeholders
  const { count: leadsCount } = await supabase.from("leads").select("id", { count: "exact", head: true })
  const { count: activitiesCount } = await supabase
    .from("activities")
    .select("id", { count: "exact", head: true })

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Analytics" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Leads Created</CardTitle></CardHeader>
              <CardContent className="text-3xl font-semibold">{leadsCount ?? 0}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Activities</CardTitle></CardHeader>
              <CardContent className="text-3xl font-semibold">{activitiesCount ?? 0}</CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Charts</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Hook up monthly bar + funnel with your data later.</CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

