"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconUser, IconRefresh, IconMessageCircle, IconPhone } from "@tabler/icons-react"

interface Activity {
  id: string
  type: string
  details: Record<string, unknown>
  created_at: string
}

interface EditActivityDialogProps {
  activity: Activity
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivityUpdated?: () => void
}

export function EditActivityDialog({ activity, open, onOpenChange, onActivityUpdated }: EditActivityDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: activity.type,
    details: activity.details || {}
  })

  const getActivityFields = (type: string) => {
    const fields: Record<string, Array<{ key: string, label: string, type: 'text' | 'textarea' | 'select', options?: string[] }>> = {
      'Lead Created': [
        { key: 'source', label: 'Source', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ],
      'Lead Stage Changed': [
        { key: 'from_stage', label: 'Previous Stage', type: 'select', options: ['Lead', 'Prospect', 'Enrolled', 'Rejected', 'Next Cohort'] },
        { key: 'to_stage', label: 'New Stage', type: 'select', options: ['Lead', 'Prospect', 'Enrolled', 'Rejected', 'Next Cohort'] },
        { key: 'change_time', label: 'Time of Change', type: 'text' },
        { key: 'reason', label: 'Reason for Change', type: 'textarea' }
      ],
      'WhatsApp Broadcast Sent': [
        { key: 'message', label: 'Message Sent', type: 'textarea' },
        { key: 'response', label: 'Response', type: 'select', options: ['Replied', 'Yes', 'No', 'No Response'] },
        { key: 'response_text', label: 'Response Text', type: 'textarea' }
      ],
      'Called': [
        { key: 'duration', label: 'Duration', type: 'text' },
        { key: 'outcome', label: 'Outcome', type: 'select', options: ['Interested', 'Not Interested', 'Follow-up Required', 'No Answer', 'Busy'] },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ]
    }
    return fields[type] || [{ key: 'note', label: 'Note', type: 'textarea' }]
  }

  const updateField = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value
      }
    }))
  }

  const getFieldValue = (key: string) => {
    return (form.details as Record<string, unknown>)[key] as string || ""
  }

  async function submit() {
    setLoading(true)
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          details: form.details,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      onOpenChange(false)
      if (onActivityUpdated) {
        onActivityUpdated()
      }
    } catch (e) {
      console.error(e)
      alert(`Failed to update activity: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const activityFields = getActivityFields(form.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Activity Type</Label>
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
          </div>

          {activityFields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={getFieldValue(field.key)}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={getFieldValue(field.key)}
                  onValueChange={(value) => updateField(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={getFieldValue(field.key)}
                  onChange={(e) => updateField(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
