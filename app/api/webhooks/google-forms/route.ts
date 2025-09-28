import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/server"

// Flexible schema: allow common alternate keys and sanitize later
const googleFormsWebhookSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  whatsapp: z.string().optional(),
  // Allow raw payload; we will try mapping if required fields missing
}).passthrough()

function coalesceString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v)
}

function extractFields(body: Record<string, unknown>) {
  // Normalize keys to ease matching
  const entries = Object.entries(body).map(([k, v]) => [k.toLowerCase(), v] as const)
  const lookup = Object.fromEntries(entries)

  // Common Google Forms titles → our keys
  const email = coalesceString(
    lookup["email"] ?? lookup["your email"] ?? lookup["e-mail"] ?? lookup["mail"]
  )
  const name = coalesceString(
    lookup["name"] ?? lookup["your name"] ?? lookup["full name"]
  )
  const whatsapp = coalesceString(
    lookup["whatsapp"] ?? lookup["your whatsapp number"] ?? lookup["phone"] ?? lookup["mobile"]
  )

  return { email, name, whatsapp }
}

export async function POST(request: Request) {
  try {
    const json = (await request.json().catch(() => null)) as Record<string, unknown> | null
    if (!json) {
      console.error("[google-forms] Invalid JSON body")
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    console.log("[google-forms] Incoming payload:", JSON.stringify(json))

    // First pass: parse
    const parsed = googleFormsWebhookSchema.safeParse(json)
    if (!parsed.success) {
      console.warn("[google-forms] Validation warning:", parsed.error.flatten())
    }

    // Extract resiliently
    const { email, name, whatsapp } = {
      ...extractFields(json),
      // Prefer explicit fields if present
      email: coalesceString((json as any).email ?? extractFields(json).email),
      name: coalesceString((json as any).name ?? extractFields(json).name),
      whatsapp: coalesceString((json as any).whatsapp ?? extractFields(json).whatsapp),
    }

    if (!email || !name || !whatsapp) {
      console.error("[google-forms] Missing required fields", { email, name, whatsapp })
      return NextResponse.json({
        error: "Missing required fields",
        received: { email, name, whatsapp },
      }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Deduplicate by email
    const { data: existingLead, error: existingErr } = await supabase
      .from("leads")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingErr) {
      console.error("[google-forms] Supabase select error:", existingErr)
    }

    if (existingLead?.id) {
      console.log(`[google-forms] Lead exists for ${email} → ${existingLead.id}`)
      return NextResponse.json({ message: "Lead already exists", lead_id: existingLead.id })
    }

    // Create lead
    const { data: newLead, error: insertErr } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone: whatsapp,
        source: "Google Forms",
        stage: "Lead",
      })
      .select("*")
      .single()

    if (insertErr || !newLead) {
      console.error("[google-forms] Insert error:", insertErr)
      return NextResponse.json({
        error: `Database error: ${insertErr?.message ?? "unknown"}`,
        code: insertErr?.code,
        details: insertErr?.details,
      }, { status: 500 })
    }

    // Log activity
    await supabase
      .from("activities")
      .insert({
        lead_id: newLead.id,
        type: "Form Submission",
        details: {
          source: "Google Forms",
        },
      })

    console.log(`[google-forms] Lead created ${newLead.id} for ${email}`)

    return NextResponse.json({ message: "Lead created", lead_id: newLead.id, lead: newLead }, { status: 201 })
  } catch (err) {
    console.error("[google-forms] Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", at: new Date().toISOString() })
}
