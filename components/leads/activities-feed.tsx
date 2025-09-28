"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddActivityDialog } from "./add-activity-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Activity {
  id: string
  type: string
  details: Record<string, unknown>
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

  const formatDetails = (details: Record<string, unknown>) => {
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
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground px-6">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm">No activities yet</div>
            <div className="text-xs">Add your first activity to get started</div>
          </div>
        ) : (
          <ScrollArea className="h-[500px] px-6">
            <div className="space-y-4 py-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Activity icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      {/* Activity content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
