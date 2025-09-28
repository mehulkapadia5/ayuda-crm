import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/server"

const bodySchema = z.object({
  name: z.string().min(1),
  filters: z.record(z.string(), z.any()).default({}),
  template: z.object({ name: z.string() }).optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { name, filters, template } = parsed.data

  const baseUrl = process.env.GALLABOX_BASE_URL || "https://backend.gallabox.com"
  const apiKey = process.env.GALLABOX_API_KEY
  if (!apiKey) return NextResponse.json({ error: "Missing GALLABOX_API_KEY" }, { status: 500 })

  // Example: call a broadcast API (URL and payload simplified; adjust per Gallabox docs)
  const res = await fetch(`${baseUrl}/v1/api/campaigns/whatsapp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ name, filters, template }),
  })
  const gb = await res.json().catch(() => ({}))
  if (!res.ok) return NextResponse.json({ error: gb }, { status: 502 })

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ name, filters, gallabox_campaign_id: gb?.id || null })
    .select("*")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, gb })
}
