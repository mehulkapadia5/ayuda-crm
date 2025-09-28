import { AppSidebar } from "@/components/app-sidebar"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { LeadConversionData } from "@/components/lead-conversion-data"
import { LeadsFunnelChart } from "@/components/leads-funnel-chart"
import { FollowUpsList } from "@/components/follow-ups-list"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const dynamic = 'force-dynamic' // Make the page dynamic
export const revalidate = 0 // Prevent prerendering

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DashboardMetrics />
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <LeadsFunnelChart />
                  </div>
                  <div className="lg:col-span-1">
                    <FollowUpsList />
                  </div>
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <LeadConversionData />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
