"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { IconSend } from "@tabler/icons-react"

interface SendWhatsAppFormProps {
  phone: string
  leadId?: string
  onMessageSent?: (message: string) => void
  compact?: boolean
}

export function SendWhatsAppForm({ phone, leadId, onMessageSent, compact = false }: SendWhatsAppFormProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !phone) return

    setLoading(true)
    try {
      const res = await fetch("/api/gallabox/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message, leadId }),
      })
      if (!res.ok) {
        alert("Failed to send message")
        return
      }
      
      onMessageSent?.(message)
      setMessage("")
      if (!compact) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <form onSubmit={send} className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button type="submit" disabled={!message.trim() || !phone || loading} size="sm">
          <IconSend className="h-4 w-4" />
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={send} className="space-y-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Message to ${phone || 'phone not set'}`}
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!message.trim() || !phone || loading}>
          {loading ? "Sending..." : "Send WhatsApp"}
        </Button>
      </div>
    </form>
  )
}
