import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = getServiceClient()
    
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

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