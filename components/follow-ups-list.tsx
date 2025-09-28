"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconCheck, IconClock, IconCalendar } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface FollowUp {
  id: string
  lead_id: string
  follow_up_date: string
  notes: string
  completed: boolean
  created_at: string
  leads: {
    id: string
    name: string
    email: string
    phone: string
    stage: string
  }
}

export function FollowUpsList() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFollowUps() {
      try {
        const res = await fetch('/api/follow-ups')
        if (res.ok) {
          const data = await res.json()
          setFollowUps(data)
        }
      } catch (error) {
        console.error('Failed to fetch follow-ups:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFollowUps()
  }, [])

  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-sm">Loading follow-ups...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!followUps || followUps.length === 0) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <IconCalendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div className="text-sm">No follow-ups scheduled</div>
            <div className="text-xs">Schedule follow-ups from individual lead pages</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Separate follow-ups by status
  const overdue = followUps.filter(fu => new Date(fu.follow_up_date) < today)
  const todayFollowUps = followUps.filter(fu => {
    const fuDate = new Date(fu.follow_up_date)
    return fuDate.toDateString() === today.toDateString()
  })
  const upcoming = followUps.filter(fu => new Date(fu.follow_up_date) > today)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusBadge = (followUp: FollowUp) => {
    const fuDate = new Date(followUp.follow_up_date)
    
    if (fuDate < today) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (fuDate.toDateString() === today.toDateString()) {
      return <Badge variant="default">Today</Badge>
    } else {
      return <Badge variant="secondary">Upcoming</Badge>
    }
  }

  const renderFollowUpItem = (followUp: FollowUp) => (
    <div key={followUp.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link 
            href={`/leads/${followUp.lead_id}`}
            className="font-medium hover:underline"
          >
            {followUp.leads.name || 'Unnamed Lead'}
          </Link>
          {getStatusBadge(followUp)}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <IconClock className="w-3 h-3" />
            {formatDateTime(followUp.follow_up_date)}
          </div>
          {followUp.notes && (
            <div className="text-xs">{followUp.notes}</div>
          )}
          <div className="text-xs">
            {followUp.leads.email} • {followUp.leads.phone} • Stage: {followUp.leads.stage}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            // Mark as completed
            const res = await fetch("/api/follow-ups", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: followUp.id,
                completed: true,
              }),
            })
            if (res.ok) {
              // Remove from local state
              setFollowUps(prev => prev.filter(fu => fu.id !== followUp.id))
            }
          }}
        >
          <IconCheck className="w-4 h-4 mr-1" />
          Complete
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Follow-ups</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] overflow-y-auto space-y-4">
        {overdue.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2">Overdue ({overdue.length})</h4>
            <div className="space-y-2">
              {overdue.map(renderFollowUpItem)}
            </div>
          </div>
        )}
        
        {todayFollowUps.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-primary mb-2">Today ({todayFollowUps.length})</h4>
            <div className="space-y-2">
              {todayFollowUps.map(renderFollowUpItem)}
            </div>
          </div>
        )}
        
        {upcoming.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Upcoming ({upcoming.length})</h4>
            <div className="space-y-2">
              {upcoming.slice(0, 5).map(renderFollowUpItem)}
              {upcoming.length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  +{upcoming.length - 5} more upcoming follow-ups
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
