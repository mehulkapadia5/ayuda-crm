"use client"

import { useState } from "react"
import { Lead } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditLeadDialogProps {
  lead: Lead
  onLeadUpdated?: () => void
  children: React.ReactNode
}

export function EditLeadDialog({ lead, onLeadUpdated, children }: EditLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    source: lead.source || "",
    stage: lead.stage
  })

  async function submit() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      setOpen(false)
      if (onLeadUpdated) {
        onLeadUpdated()
      } else {
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
      alert(`Failed to update lead: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Input 
            placeholder="Name" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
          <Input 
            placeholder="Email" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
          />
          <Input 
            placeholder="Phone Number" 
            value={form.phone} 
            onChange={(e) => setForm({ ...form, phone: e.target.value })} 
          />
          <Input 
            placeholder="Source" 
            value={form.source} 
            onChange={(e) => setForm({ ...form, source: e.target.value })} 
          />
          <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as any })}>
            <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              {['Lead','Prospect','Enrolled','Rejected','Next Cohort'].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? 'Updating...' : 'Update'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
