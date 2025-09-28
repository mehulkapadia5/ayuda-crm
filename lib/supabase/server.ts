import { createClient, SupabaseClient } from "@supabase/supabase-js"

let serviceClient: SupabaseClient | null = null

export function getServiceClient() {
  if (serviceClient) return serviceClient
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  serviceClient = createClient(url, key, {
    auth: { persistSession: false },
  })
  return serviceClient
}

export type LeadStage = "Lead" | "Prospect" | "Enrolled" | "Rejected" | "Next Cohort"

export type Lead = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  source: string | null
  stage: LeadStage
  created_at: string
}

export type Activity = {
  id: string
  lead_id: string
  type: string
  details: Record<string, unknown>
  created_at: string
}

export type Campaign = {
  id: string
  name: string
  filters: Record<string, unknown>
  gallabox_campaign_id: string | null
  created_at: string
}

export type CRMUser = {
  id: string
  email: string
  role: "admin" | "sales" | "ops"
  created_at: string
}

