"use client"

import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LeadsTable } from "@/components/leads/leads-table"
import { AddLeadDialog } from "@/components/leads/add-lead-dialog"
import { Lead } from "@/lib/supabase/server"
import { useEffect, useState } from "react"

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads')
      if (res.ok) {
        const data = await res.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

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
            <AddLeadDialog onLeadAdded={fetchLeads} />
          </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">Loading leads...</div>
            </div>
          ) : (
            <LeadsTable data={leads} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

