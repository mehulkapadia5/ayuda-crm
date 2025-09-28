import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getServiceClient } from "@/lib/supabase/server"
import { CreateCampaign } from "@/components/campaigns/create-campaign"

export default async function CampaignsPage() {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
  const campaigns = data ?? []

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Campaigns" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <CreateCampaign />
          <Card>
            <CardHeader>
              <CardTitle>Campaign List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {campaigns.length === 0 && <div className="text-muted-foreground">No campaigns yet.</div>}
              {campaigns.map((c: Record<string, unknown>) => (
                <div key={c.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-xs mt-1">Gallabox ID: {c.gallabox_campaign_id || '-'}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
