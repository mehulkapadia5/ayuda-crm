import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getServiceClient } from "@/lib/supabase/server"
import { LeadsTable } from "@/components/leads/leads-table"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"

export default async function LeadsPage() {
  const supabase = getServiceClient()
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Leads" />
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-4">
          <div className="flex items-center justify-between">
            <div></div>
            <AddLeadDialog />
          </div>
          <LeadsTable data={leads} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

