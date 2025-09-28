import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/server"

const createFollowUpSchema = z.object({
  lead_id: z.string().uuid(),
  follow_up_date: z.string(),
  notes: z.string().optional(),
})

const updateFollowUpSchema = z.object({
  id: z.string().uuid(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    
    const parsed = createFollowUpSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    
    const payload = parsed.data
    const supabase = getServiceClient()
    
    const { data, error } = await supabase
      .from("follow_ups")
      .insert({
        lead_id: payload.lead_id,
        follow_up_date: payload.follow_up_date,
        notes: payload.notes || "",
        completed: false,
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

export async function GET() {
  try {
    const supabase = getServiceClient()
    
    const { data, error } = await supabase
      .from("follow_ups")
      .select(`
        id,
        lead_id,
        follow_up_date,
        notes,
        completed,
        created_at,
        leads (
          id,
          name,
          email,
          phone,
          stage
        )
      `)
      .eq("completed", false)
      .order("follow_up_date", { ascending: true })
    
    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ 
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    
    const parsed = updateFollowUpSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    
    const payload = parsed.data
    const supabase = getServiceClient()
    
    const { data, error } = await supabase
      .from("follow_ups")
      .update({
        follow_up_date: payload.follow_up_date,
        notes: payload.notes,
        completed: payload.completed,
      })
      .eq("id", payload.id)
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
