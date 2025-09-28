import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/server"

const bodySchema = z.object({
  leadId: z.string().uuid().optional(),
  to: z.string(),
  message: z.string().optional(),
  template: z
    .object({
      name: z.string(),
      language: z.string().default("en"),
      components: z.array(z.any()).optional(),
    })
    .optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { leadId, to, message, template } = parsed.data

  const baseUrl = process.env.GALLABOX_BASE_URL || "https://backend.gallabox.com"
  const apiKey = process.env.GALLABOX_API_KEY
  if (!apiKey) return NextResponse.json({ error: "Missing GALLABOX_API_KEY" }, { status: 500 })

  // Prepare Gallabox payloads (simplified)
  const url = template
    ? `${baseUrl}/v1/api/messages/whatsapp/template`
    : `${baseUrl}/v1/api/messages/whatsapp/text`

  const payload = template
    ? { to, template }
    : { to, message: message || "" }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  })

  const gb = await res.json().catch(() => ({}))
  if (!res.ok) return NextResponse.json({ error: gb }, { status: 502 })

  // Log activity
  try {
    const supabase = getServiceClient()
    let finalLeadId = leadId
    if (!finalLeadId && to) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", to)
        .limit(1)
        .maybeSingle()
      if (lead?.id) finalLeadId = lead.id
    }
    if (finalLeadId) {
      await supabase.from("activities").insert({
        lead_id: finalLeadId,
        type: "WA Message",
        details: gb,
      })
    }
  } catch (e) {
    // Non-fatal
  }

  return NextResponse.json({ data: gb })
}

