"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      Call: [
        { key: 'duration', label: 'Duration', type: 'text' },
        { key: 'outcome', label: 'Outcome', type: 'select', options: ['Interested', 'Not Interested', 'Follow-up Required', 'No Answer', 'Busy'] },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ],
      Email: [
        { key: 'subject', label: 'Subject', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Sent', 'Delivered', 'Opened', 'Replied', 'Bounced'] },
        { key: 'content', label: 'Content', type: 'textarea' }
      ],
      Meeting: [
        { key: 'duration', label: 'Duration', type: 'text' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'attendees', label: 'Attendees', type: 'text' },
        { key: 'agenda', label: 'Agenda', type: 'textarea' },
        { key: 'outcome', label: 'Outcome', type: 'textarea' }
      ],
      WhatsApp: [
        { key: 'message', label: 'Message', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: ['Sent', 'Delivered', 'Read', 'Replied'] },
        { key: 'response', label: 'Response', type: 'textarea' }
      ],
      Note: [
        { key: 'content', label: 'Note', type: 'textarea' }
      ],
      'Follow-up': [
        { key: 'date', label: 'Follow-up Date', type: 'text' },
        { key: 'type', label: 'Type', type: 'select', options: ['Call', 'Email', 'Meeting', 'WhatsApp'] },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ],
      Proposal: [
        { key: 'title', label: 'Proposal Title', type: 'text' },
        { key: 'value', label: 'Value', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Sent', 'Under Review', 'Accepted', 'Rejected'] },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ],
      Demo: [
        { key: 'duration', label: 'Duration', type: 'text' },
        { key: 'features', label: 'Features Shown', type: 'textarea' },
        { key: 'feedback', label: 'Feedback', type: 'textarea' },
        { key: 'next_steps', label: 'Next Steps', type: 'textarea' }
      ],
      Contract: [
        { key: 'title', label: 'Contract Title', type: 'text' },
        { key: 'value', label: 'Value', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Sent', 'Under Review', 'Signed', 'Rejected'] },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ],
      'Lead Stage Changed': [
        { key: 'from_stage', label: 'Previous Stage', type: 'select', options: ['Lead', 'Prospect', 'Enrolled', 'Rejected', 'Next Cohort'] },
        { key: 'to_stage', label: 'New Stage', type: 'select', options: ['Lead', 'Prospect', 'Enrolled', 'Rejected', 'Next Cohort'] },
        { key: 'change_time', label: 'Time of Change', type: 'text' },
        { key: 'reason', label: 'Reason for Change', type: 'textarea' }
      ],
      Other: [
        { key: 'description', label: 'Description', type: 'textarea' }
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
                <SelectItem value="Call">📞 Call</SelectItem>
                <SelectItem value="Email">📧 Email</SelectItem>
                <SelectItem value="Meeting">🤝 Meeting</SelectItem>
                <SelectItem value="WhatsApp">💬 WhatsApp</SelectItem>
                <SelectItem value="Note">📝 Note</SelectItem>
                <SelectItem value="Follow-up">⏰ Follow-up</SelectItem>
                <SelectItem value="Proposal">📋 Proposal</SelectItem>
                <SelectItem value="Demo">🎯 Demo</SelectItem>
                <SelectItem value="Contract">📄 Contract</SelectItem>
                <SelectItem value="Lead Stage Changed">🔄 Lead Stage Changed</SelectItem>
                <SelectItem value="Other">📌 Other</SelectItem>
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
