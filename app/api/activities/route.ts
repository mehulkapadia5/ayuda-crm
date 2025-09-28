import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/server"

const createActivitySchema = z.object({
  lead_id: z.string().uuid(),
  type: z.string().min(1),
  details: z.any().optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    
    const parsed = createActivitySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    
    const payload = parsed.data
    const supabase = getServiceClient()
    
    const { data, error } = await supabase
      .from("activities")
      .insert({
        lead_id: payload.lead_id,
        type: payload.type,
        details: payload.details || {},
      })
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
    
    return NextResponse.json({ data })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ 
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
