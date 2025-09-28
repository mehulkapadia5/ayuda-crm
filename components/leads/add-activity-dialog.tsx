"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconUser, IconRefresh, IconMessageCircle, IconPhone } from "@tabler/icons-react"

export function AddActivityDialog({ leadId, onActivityAdded }: { leadId: string, onActivityAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ type: "", details: "" })

  async function submit() {
    setLoading(true)
    try {
      let details = {}
      if (form.details.trim()) {
        try {
          details = JSON.parse(form.details)
        } catch {
          // If not valid JSON, store as a simple text field
          details = { note: form.details }
        }
      }

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          type: form.type,
          details,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      setOpen(false)
      setForm({ type: "", details: "" })
      if (onActivityAdded) {
        onActivityAdded()
      } else {
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
      alert(`Failed to add activity: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lead Created">
                <div className="flex items-center gap-2">
                  <IconUser className="h-4 w-4" />
                  Lead Created
                </div>
              </SelectItem>
              <SelectItem value="Lead Stage Changed">
                <div className="flex items-center gap-2">
                  <IconRefresh className="h-4 w-4" />
                  Lead Stage Changed
                </div>
              </SelectItem>
              <SelectItem value="WhatsApp Broadcast Sent">
                <div className="flex items-center gap-2">
                  <IconMessageCircle className="h-4 w-4" />
                  WhatsApp Broadcast Sent
                </div>
              </SelectItem>
              <SelectItem value="Called">
                <div className="flex items-center gap-2">
                  <IconPhone className="h-4 w-4" />
                  Called
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Textarea 
            placeholder="Details (JSON format or simple text)" 
            value={form.details} 
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            rows={4}
          />
          <div className="text-xs text-muted-foreground">
            You can enter simple text or JSON format like: {`{"duration": "30 minutes", "outcome": "interested"}`}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !form.type}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
