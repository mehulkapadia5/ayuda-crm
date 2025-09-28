import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  stage: z.enum(["Lead", "Prospect", "Enrolled", "Rejected", "Next Cohort"]).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = updateLeadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const supabase = getServiceClient()
    const leadId = params.id

    // Get current lead to check for stage changes
    const { data: currentLead, error: fetchError } = await supabase
      .from("leads")
      .select("stage")
      .eq("id", leadId)
      .single()

    if (fetchError) {
      console.error("Error fetching current lead:", fetchError)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Update the lead
    const { data, error } = await supabase
      .from("leads")
      .update(parsed.data)
      .eq("id", leadId)
      .select("*")
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    // Log activity if stage changed
    if (parsed.data.stage && parsed.data.stage !== currentLead.stage) {
      await supabase.from("activities").insert({
        lead_id: leadId,
        type: "Lead Stage Changed",
        details: {
          from_stage: currentLead.stage,
          to_stage: parsed.data.stage,
          changed_at: new Date().toISOString(),
          message: `Lead stage changed from ${currentLead.stage} to ${parsed.data.stage}`
        },
      })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient()
    const leadId = params.id

    // Delete the lead (activities and follow-ups will be deleted automatically due to foreign key constraints)
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadId)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    return NextResponse.json({ message: "Lead deleted successfully" })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
