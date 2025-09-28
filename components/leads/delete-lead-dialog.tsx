"use client"

import { useState } from "react"
import { Lead } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface DeleteLeadDialogProps {
  lead: Lead
  onLeadDeleted?: () => void
  children: React.ReactNode
}

export function DeleteLeadDialog({ lead, onLeadDeleted, children }: DeleteLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function deleteLead() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      setOpen(false)
      if (onLeadDeleted) {
        onLeadDeleted()
      } else {
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
      alert(`Failed to delete lead: ${e instanceof Error ? e.message : 'Unknown error'}`)
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
          <DialogTitle>Delete Lead</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{lead.name || 'this lead'}</strong>? 
            This action cannot be undone and will also delete all associated activities and follow-ups.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={deleteLead} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
