import { getServiceClient } from "@/lib/supabase/server"
import { LeadConversionChart } from "./lead-conversion-chart"


export async function LeadConversionData() {
  const supabase = getServiceClient()
  
  // Get all leads with their creation dates and stages
  const { data: leads } = await supabase
    .from("leads")
    .select("id, created_at, stage")
    .order("created_at", { ascending: true })

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-2xl mb-2">📊</div>
        <div className="text-sm">No lead data available</div>
        <div className="text-xs">Add some leads to see conversion metrics</div>
      </div>
    )
  }

  // Get all activities to track when leads converted to "Enrolled"
  const { data: activities } = await supabase
    .from("activities")
    .select("lead_id, created_at, type, details")
    .eq("type", "Enrolled")
    .order("created_at", { ascending: true })

  // Create a map of lead_id to conversion date
  const conversionDates: { [leadId: string]: string } = {}
  activities?.forEach(activity => {
    if (activity.details && typeof activity.details === 'object' && 'stage' in activity.details && activity.details.stage === 'Enrolled') {
      conversionDates[activity.lead_id] = activity.created_at
    }
  })

  // Also check current stage for leads that are already enrolled
  leads.forEach(lead => {
    if (lead.stage === "Enrolled" && !conversionDates[lead.id]) {
      conversionDates[lead.id] = lead.created_at // Use creation date as fallback
    }
  })

  // Build the retention matrix with conversion percentages
  const retentionData: { [leadMonth: string]: { [conversionMonth: string]: number } } = {}
  const leadCounts: { [leadMonth: string]: number } = {}
  const monthSet = new Set<string>()

  // First pass: count total leads per month
  leads.forEach(lead => {
    const leadDate = new Date(lead.created_at)
    const leadMonthName = leadDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    monthSet.add(leadMonthName)
    leadCounts[leadMonthName] = (leadCounts[leadMonthName] || 0) + 1
  })

  // Second pass: count conversions per month
  leads.forEach(lead => {
    const leadDate = new Date(lead.created_at)
    const leadMonthName = leadDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    // Initialize lead month if not exists
    if (!retentionData[leadMonthName]) {
      retentionData[leadMonthName] = {}
    }

    // If lead converted, find the conversion month
    if (conversionDates[lead.id]) {
      const conversionDate = new Date(conversionDates[lead.id])
      const conversionMonthName = conversionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      monthSet.add(conversionMonthName)
      
      // Initialize conversion month if not exists
      if (!retentionData[leadMonthName][conversionMonthName]) {
        retentionData[leadMonthName][conversionMonthName] = 0
      }
      
      retentionData[leadMonthName][conversionMonthName]++
    }
  })

  // Convert counts to percentages
  Object.keys(retentionData).forEach(leadMonth => {
    const totalLeads = leadCounts[leadMonth] || 1
    Object.keys(retentionData[leadMonth]).forEach(conversionMonth => {
      retentionData[leadMonth][conversionMonth] = Math.round((retentionData[leadMonth][conversionMonth] / totalLeads) * 100)
    })
  })

  // Sort months chronologically
  const months = Array.from(monthSet).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA.getTime() - dateB.getTime()
  })

  // Initialize all possible combinations with 0
  months.forEach(leadMonth => {
    months.forEach(conversionMonth => {
      if (!retentionData[leadMonth]) {
        retentionData[leadMonth] = {}
      }
      if (!retentionData[leadMonth][conversionMonth]) {
        retentionData[leadMonth][conversionMonth] = 0
      }
    })
  })

  return <LeadConversionChart data={retentionData} months={months} />
}
