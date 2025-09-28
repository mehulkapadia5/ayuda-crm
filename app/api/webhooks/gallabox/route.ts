import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  // Capture full body for logging, and try to associate to a lead by phone if available
  const body = await req.json().catch(() => ({} as Record<string, unknown>))
  const supabase = getServiceClient()

  let leadId: string | null = null
  const phone = body?.to || body?.from || body?.data?.phone || body?.payload?.phone

  if (phone) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", String(phone))
      .maybeSingle()
    if (lead?.id) leadId = lead.id
  }

  if (leadId) {
    await supabase.from("activities").insert({
      lead_id: leadId,
      type: body?.direction === "inbound" ? "WA Inbound" : "WA Event",
      details: body,
    })
  }

  return NextResponse.json({ ok: true })
}

