"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconMail, IconPhone, IconCalendar, IconUser } from "@tabler/icons-react"
import { Lead } from "@/lib/supabase/server"

interface LeadProfileProps {
  lead: Lead
  onStageChange?: (newStage: string) => void
}

const stageColors = {
  "Lead": "bg-blue-100 text-blue-800",
  "Prospect": "bg-yellow-100 text-yellow-800", 
  "Enrolled": "bg-green-100 text-green-800",
  "Rejected": "bg-red-100 text-red-800",
  "Next Cohort": "bg-purple-100 text-purple-800"
}

const stageIcons = {
  "Lead": "👤",
  "Prospect": "🎯",
  "Enrolled": "✅",
  "Rejected": "❌",
  "Next Cohort": "📅"
}

export function LeadProfile({ lead, onStageChange }: LeadProfileProps) {
  const [stage, setStage] = useState(lead.stage)

  const handleStageChange = async (newStage: string) => {
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })
      if (res.ok) {
        setStage(newStage)
        onStageChange?.(newStage)
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(lead.name || lead.email || 'L')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{lead.name || 'Unnamed Lead'}</h1>
              <Badge className={`${stageColors[stage as keyof typeof stageColors]} border-0`}>
                {stageIcons[stage as keyof typeof stageIcons]} {stage}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <IconCalendar className="h-4 w-4" />
                Joined {new Date(lead.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <IconUser className="h-4 w-4" />
                {lead.source || 'Unknown Source'}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h3>
            <div className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <IconMail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{lead.email}</div>
                  </div>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <IconPhone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">{lead.phone}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stage Management */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Lead Stage</h3>
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Current Stage</div>
                <Select value={stage} onValueChange={handleStageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stageIcons).map(([stageValue, icon]) => (
                      <SelectItem key={stageValue} value={stageValue}>
                        <div className="flex items-center gap-2">
                          <span>{icon}</span>
                          <span>{stageValue}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Changing the stage will create an activity record
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
