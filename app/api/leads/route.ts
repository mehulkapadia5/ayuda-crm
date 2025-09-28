import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/server"

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  stage: z.enum(["Lead", "Prospect", "Enrolled", "Rejected", "Next Cohort"]).optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stage = searchParams.get("stage") || undefined
  const name = searchParams.get("name") || undefined
  const source = searchParams.get("source") || undefined
  const from = searchParams.get("from") || undefined
  const to = searchParams.get("to") || undefined

  const supabase = getServiceClient()
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false })

  if (stage) query = query.eq("stage", stage)
  if (name) query = query.ilike("name", `%${name}%`)
  if (source) query = query.ilike("source", `%${source}%`)
  if (from) query = query.gte("created_at", from)
  if (to) query = query.lte("created_at", to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = createLeadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const payload = parsed.data
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      source: payload.source || null,
      stage: payload.stage || "Lead",
    })
    .select("*")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

