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

    // Get leads created in the date range
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, stage, created_at")
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

    // Count leads by stage
    const leadsCount = leads?.filter(lead => lead.stage === "Lead").length || 0
    const prospectsCount = leads?.filter(lead => lead.stage === "Prospect").length || 0
    const enrolledCount = leads?.filter(lead => lead.stage === "Enrolled").length || 0

    // Also check for leads that were created before the date range but converted during it
    // This gives us a more accurate picture of the funnel
    const { data: convertedLeads, error: convertedError } = await supabase
      .from("activities")
      .select("lead_id, created_at, details")
      .eq("type", "Lead Stage Changed")
      .gte("created_at", `${startDate}T00:00:00.000Z`)
      .lte("created_at", `${endDate}T23:59:59.999Z`)

    if (convertedError) {
      console.error("Database error fetching conversions:", convertedError)
      // Continue without conversion data rather than failing
    }

    // Get current stage of leads that converted during the period
    let additionalEnrolled = 0
    let additionalProspects = 0

    if (convertedLeads && convertedLeads.length > 0) {
      const leadIds = convertedLeads.map(activity => activity.lead_id)
      const { data: currentStages } = await supabase
        .from("leads")
        .select("id, stage")
        .in("id", leadIds)

      if (currentStages) {
        additionalEnrolled = currentStages.filter(lead => lead.stage === "Enrolled").length
        additionalProspects = currentStages.filter(lead => lead.stage === "Prospect").length
      }
    }

    const funnelData = {
      leads: leadsCount,
      prospects: prospectsCount + additionalProspects,
      enrolled: enrolledCount + additionalEnrolled
    }

    return NextResponse.json(funnelData)
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
