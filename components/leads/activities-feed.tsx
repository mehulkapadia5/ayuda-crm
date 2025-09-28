"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddActivityDialog } from "./add-activity-dialog"

interface Activity {
  id: string
  type: string
  details: any
  created_at: string
}

interface ActivitiesFeedProps {
  activities: Activity[]
  leadId: string
}

export function ActivitiesFeed({ activities, leadId }: ActivitiesFeedProps) {
  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      Call: "📞",
      Email: "📧",
      Meeting: "🤝",
      WhatsApp: "💬",
      Note: "📝",
      "Follow-up": "⏰",
      Proposal: "📋",
      Demo: "🎯",
      Contract: "📄",
      Other: "📌",
    }
    return icons[type] || "📌"
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatDetails = (details: any) => {
    if (!details || Object.keys(details).length === 0) return null
    
    if (typeof details === 'string') return details
    
    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="text-xs">
        <span className="font-medium capitalize">{key}:</span> {String(value)}
      </div>
    ))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">Activity Feed</CardTitle>
        <AddActivityDialog leadId={leadId} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm">No activities yet</div>
              <div className="text-xs">Add your first activity to get started</div>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-4 top-8 w-px h-8 bg-border" />
                  )}
                  
                  <div className="flex gap-3">
                    {/* Activity icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Activity content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.created_at)}
                        </span>
                      </div>
                      
                      {formatDetails(activity.details) && (
                        <div className="space-y-1 text-sm">
                          {formatDetails(activity.details)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
