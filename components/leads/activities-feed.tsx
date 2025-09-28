"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddActivityDialog } from "./add-activity-dialog"
import { EditActivityDialog } from "./edit-activity-dialog"
import { DeleteActivityDialog } from "./delete-activity-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IconEdit, IconTrash, IconClock, IconUser, IconRefresh, IconMessageCircle, IconPhone } from "@tabler/icons-react"

interface Activity {
  id: string
  type: string
  details: Record<string, unknown>
  created_at: string
}

interface ActivitiesFeedProps {
  activities: Activity[]
  leadId: string
  onActivityAdded?: () => void
}

export function ActivitiesFeed({ activities, leadId, onActivityAdded }: ActivitiesFeedProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null)

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      "Lead Created": <IconUser className="h-5 w-5" />,
      "Lead Stage Changed": <IconRefresh className="h-5 w-5" />,
      "WhatsApp Broadcast Sent": <IconMessageCircle className="h-5 w-5" />,
      "Called": <IconPhone className="h-5 w-5" />,
    }
    return icons[type] || <IconUser className="h-5 w-5" />
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

  const formatDetails = (details: Record<string, unknown>, type: string) => {
    if (!details || Object.keys(details).length === 0) return null
    
    if (typeof details === 'string') return details
    
    // Special formatting for Lead Stage Changed
    if (type === 'Lead Stage Changed') {
      return (
        <div className="space-y-2">
          {details.from_stage && details.to_stage && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
              <span className="text-sm font-medium text-primary">
                {String(details.from_stage)} → {String(details.to_stage)}
              </span>
            </div>
          )}
          {details.change_time && (
            <div className="flex items-start gap-2 py-1">
              <span className="font-medium text-sm text-muted-foreground min-w-[80px]">
                Time:
              </span>
              <span className="text-sm flex-1">
                {String(details.change_time)}
              </span>
            </div>
          )}
          {details.reason && (
            <div className="flex items-start gap-2 py-1">
              <span className="font-medium text-sm text-muted-foreground min-w-[80px]">
                Reason:
              </span>
              <span className="text-sm flex-1">
                {String(details.reason)}
              </span>
            </div>
          )}
        </div>
      )
    }
    
    return Object.entries(details).map(([key, value]) => {
      if (!value || value === '') return null
      
      return (
        <div key={key} className="flex items-start gap-2 py-1">
          <span className="font-medium text-sm text-muted-foreground capitalize min-w-[80px]">
            {key.replace(/_/g, ' ')}:
          </span>
          <span className="text-sm flex-1">
            {typeof value === 'string' && value.length > 100 
              ? `${value.substring(0, 100)}...` 
              : String(value)
            }
          </span>
        </div>
      )
    }).filter(Boolean) as React.ReactNode[]
  }

  const handleActivityUpdated = () => {
    if (onActivityAdded) {
      onActivityAdded()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">Activity Feed</CardTitle>
        <AddActivityDialog leadId={leadId} onActivityAdded={onActivityAdded} />
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
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
              
              <div className="space-y-6 py-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-md bg-background border-2 border-primary/20 flex items-center justify-center text-muted-foreground">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Activity content */}
                    <div className="flex-1 min-w-0 bg-muted/30 rounded-lg p-4 border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {activity.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconClock className="w-3 h-3" />
                            {formatTimestamp(activity.created_at)}
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingActivity(activity)}
                            className="h-6 w-6 p-0"
                          >
                            <IconEdit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingActivity(activity)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <IconTrash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Activity details */}
                      {formatDetails(activity.details, activity.type) && (
                        <div className="space-y-2">
                          {formatDetails(activity.details, activity.type)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Edit Activity Dialog */}
      {editingActivity && (
        <EditActivityDialog
          activity={editingActivity}
          open={!!editingActivity}
          onOpenChange={(open) => !open && setEditingActivity(null)}
          onActivityUpdated={handleActivityUpdated}
        />
      )}

      {/* Delete Activity Dialog */}
      {deletingActivity && (
        <DeleteActivityDialog
          activity={deletingActivity}
          open={!!deletingActivity}
          onOpenChange={(open) => !open && setDeletingActivity(null)}
          onActivityDeleted={handleActivityUpdated}
        />
      )}
    </Card>
  )
}
