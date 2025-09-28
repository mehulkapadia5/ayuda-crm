"use client"

import { useState } from "react"
import { LeadProfile } from "./lead-profile"
import { LeadActions } from "./lead-actions"
import { ActivitiesFeed } from "./activities-feed"
import { Lead } from "@/lib/supabase/server"

interface Activity {
  id: string
  type: string
  details: Record<string, unknown>
  created_at: string
}

interface LeadDetailClientProps {
  lead: Lead
  activities: Activity[]
  leadId: string
}

export function LeadDetailClient({ lead, activities, leadId }: LeadDetailClientProps) {
  const [currentLead, setCurrentLead] = useState(lead)
  const [currentActivities, setCurrentActivities] = useState(activities)

  const handleLeadUpdated = async () => {
    // Refresh the lead data
    try {
      const res = await fetch(`/api/leads/${leadId}`)
      if (res.ok) {
        const updatedLead = await res.json()
        setCurrentLead(updatedLead)
      }
    } catch (error) {
      console.error('Failed to refresh lead data:', error)
    }
  }

  const handleActivityAdded = async () => {
    // Refresh the activities data
    try {
      const res = await fetch(`/api/activities?leadId=${leadId}`)
      if (res.ok) {
        const updatedActivities = await res.json()
        setCurrentActivities(updatedActivities)
      }
    } catch (error) {
      console.error('Failed to refresh activities:', error)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      {/* Lead Profile Section */}
      <LeadProfile 
        lead={currentLead} 
        onStageChange={handleLeadUpdated}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <LeadActions 
            lead={currentLead} 
            onActionCompleted={handleLeadUpdated}
          />
        </div>

        {/* Activities Feed */}
        <div className="lg:col-span-2">
          <ActivitiesFeed 
            activities={currentActivities} 
            leadId={leadId}
            onActivityAdded={handleActivityAdded}
          />
        </div>
      </div>
    </div>
  )
}
