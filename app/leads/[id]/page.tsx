import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getServiceClient } from "@/lib/supabase/server"
import { SendWhatsAppForm } from "@/components/leads/send-whatsapp-form"
import { ActivitiesFeed } from "@/components/leads/activities-feed"
import { FollowUpDialog } from "@/components/leads/follow-up-dialog"
import { Suspense } from "react"

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const supabase = getServiceClient()
  const { data: lead } = await supabase.from("leads").select("*").eq("id", params.id).maybeSingle()
  const { data: activitiesData } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", params.id)
    .order("created_at", { ascending: false })
  const activities = activitiesData ?? []

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={lead?.name || "Lead"} />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div><span className="text-muted-foreground">Name:</span> {lead?.name || '-'}</div>
                <div><span className="text-muted-foreground">Email:</span> {lead?.email || '-'}</div>
                <div><span className="text-muted-foreground">Phone:</span> {lead?.phone || '-'}</div>
                <div><span className="text-muted-foreground">Source:</span> {lead?.source || '-'}</div>
                <div><span className="text-muted-foreground">Stage:</span> {lead?.stage || '-'}</div>
                <div><span className="text-muted-foreground">Created:</span> {lead?.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Send WhatsApp</h4>
                  <Suspense fallback={null}>
                    <SendWhatsAppForm phone={lead?.phone || ''} leadId={lead?.id} />
                  </Suspense>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Follow-up</h4>
                  <Suspense fallback={null}>
                    <FollowUpDialog 
                      leadId={lead?.id || ''} 
                      leadName={lead?.name || 'Unnamed Lead'}
                    />
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </div>

          <ActivitiesFeed activities={activities} leadId={params.id} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

