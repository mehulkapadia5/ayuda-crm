import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Get all leads that were created in the date range
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, created_at")
      .gte("created_at", `${startDate}T00:00:00.000Z`)
      .lte("created_at", `${endDate}T23:59:59.999Z`)

    if (leadsError) {
      console.error("Database error fetching leads:", leadsError)
      return NextResponse.json({
        error: `Database error: ${leadsError.message}`,
        code: leadsError.code,
        details: leadsError.details
      }, { status: 500 })
    }

    const leadIds = leads?.map(lead => lead.id) || []
    const totalLeads = leadIds.length

    if (totalLeads === 0) {
      return NextResponse.json({
        leads: 0,
        prospects: 0,
        enrolled: 0
      })
    }

    // Get all stage change activities for these leads
    const { data: stageChanges, error: stageError } = await supabase
      .from("activities")
      .select("lead_id, created_at, details")
      .eq("type", "Lead Stage Changed")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: true })

    if (stageError) {
      console.error("Database error fetching stage changes:", stageError)
      // Continue with basic counts if stage changes fail
      return NextResponse.json({
        leads: totalLeads,
        prospects: 0,
        enrolled: 0
      })
    }

    // Build historical funnel by tracking each lead's journey
    const leadJourneys: { [leadId: string]: string[] } = {}
    
    // Initialize all leads as starting with "Lead" stage
    leadIds.forEach(leadId => {
      leadJourneys[leadId] = ["Lead"]
    })

    // Process stage changes chronologically
    stageChanges?.forEach(change => {
      const leadId = change.lead_id
      const details = change.details as any
      
      if (details && details.from_stage && details.to_stage) {
        if (!leadJourneys[leadId]) {
          leadJourneys[leadId] = ["Lead"]
        }
        
        // Add the new stage to the journey
        if (!leadJourneys[leadId].includes(details.to_stage)) {
          leadJourneys[leadId].push(details.to_stage)
        }
      }
    })

    // Count leads that have reached each stage
    let prospectsCount = 0
    let enrolledCount = 0

    Object.values(leadJourneys).forEach(journey => {
      if (journey.includes("Prospect")) {
        prospectsCount++
      }
      if (journey.includes("Enrolled")) {
        enrolledCount++
      }
    })

    const funnelData = {
      leads: totalLeads,
      prospects: prospectsCount,
      enrolled: enrolledCount
    }

    return NextResponse.json(funnelData)
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
