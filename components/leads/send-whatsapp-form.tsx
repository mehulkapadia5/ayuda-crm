"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function SendWhatsAppForm({ phone, leadId }: { phone: string; leadId?: string }) {
  const send = async (formData: FormData) => {
    const message = String(formData.get("message") || "")
    const res = await fetch("/api/gallabox/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone, message, leadId }),
    })
    if (!res.ok) alert("Failed to send message")
    else window.location.reload()
  }

  return (
    <form action={send} className="space-y-3">
      <Textarea name="message" placeholder={`Message to ${phone || 'phone not set'}`} />
      <div className="flex justify-end">
        <Button type="submit" disabled={!phone}>Send WhatsApp</Button>
      </div>
    </form>
  )
}
