"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Activity {
  id: string
  type: string
  details: Record<string, unknown>
  created_at: string
}

interface DeleteActivityDialogProps {
  activity: Activity
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivityDeleted?: () => void
}

export function DeleteActivityDialog({ activity, open, onOpenChange, onActivityDeleted }: DeleteActivityDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      onOpenChange(false)
      if (onActivityDeleted) {
        onActivityDeleted()
      }
    } catch (e) {
      console.error(e)
      alert(`Failed to delete activity: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Activity</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this {activity.type.toLowerCase()} activity? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
