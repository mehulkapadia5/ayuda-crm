import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateActivitySchema = z.object({
  type: z.string().optional(),
  details: z.any().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const validatedData = updateActivitySchema.parse(body)
    
    const supabase = getServiceClient()
    
    const { data, error } = await supabase
      .from("activities")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Database error updating activity:", error)
      return NextResponse.json({
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = getServiceClient()
    
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id)
    
    if (error) {
      console.error("Database error deleting activity:", error)
      return NextResponse.json({
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
