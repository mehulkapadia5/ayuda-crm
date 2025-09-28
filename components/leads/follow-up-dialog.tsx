"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { IconCalendar } from "@tabler/icons-react"

interface FollowUpDialogProps {
  leadId: string
  leadName: string
}

export function FollowUpDialog({ leadId, leadName }: FollowUpDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ 
    follow_up_date: "", 
    notes: "" 
  })

  async function submit() {
    setLoading(true)
    try {
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          follow_up_date: form.follow_up_date,
          notes: form.notes,
        }),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      
      setOpen(false)
      setForm({ follow_up_date: "", notes: "" })
      window.location.reload()
    } catch (e) {
      console.error(e)
      alert(`Failed to schedule follow-up: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Set default date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconCalendar className="w-4 h-4 mr-2" />
          Schedule Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow-up for {leadName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Follow-up Date & Time</label>
            <Input
              type="datetime-local"
              value={form.follow_up_date || defaultDate + "T09:00"}
              onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
            <Textarea 
              placeholder="What should you follow up about?" 
              value={form.notes} 
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !form.follow_up_date}>
            {loading ? 'Scheduling...' : 'Schedule Follow-up'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
