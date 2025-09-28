import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getServiceClient } from "@/lib/supabase/server"
import { LeadProfile } from "@/components/leads/lead-profile"
import { LeadActions } from "@/components/leads/lead-actions"
import { ActivitiesFeed } from "@/components/leads/activities-feed"
import { Suspense } from "react"
import { LeadDetailClient } from "@/components/leads/lead-detail-client"

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const supabase = getServiceClient()
  const { data: lead } = await supabase.from("leads").select("*").eq("id", params.id).maybeSingle()
  const { data: activitiesData } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", params.id)
    .order("created_at", { ascending: false })
  const activities = activitiesData ?? []

  if (!lead) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Lead Not Found" />
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-lg">Lead not found</div>
              <div className="text-sm">The lead you're looking for doesn't exist or has been deleted.</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={lead.name || "Lead"} />
        <LeadDetailClient 
          lead={lead} 
          activities={activities} 
          leadId={params.id} 
        />
      </SidebarInset>
    </SidebarProvider>
  )
}

