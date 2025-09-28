"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WhatsAppChatDrawer } from "./whatsapp-chat-drawer"
import { FollowUpDialog } from "./follow-up-dialog"
import { EditLeadDialog } from "./edit-lead-dialog"
import { IconPhone, IconEdit } from "@tabler/icons-react"
import { Lead } from "@/lib/supabase/server"

interface LeadActionsProps {
  lead: Lead
  onActionCompleted?: () => void
}

export function LeadActions({ lead, onActionCompleted }: LeadActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconPhone className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Edit Lead */}
        <EditLeadDialog lead={lead} onLeadUpdated={onActionCompleted}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <IconEdit className="h-4 w-4" />
            Edit Lead Details
          </Button>
        </EditLeadDialog>

        {/* WhatsApp Chat */}
        {lead.phone && (
          <WhatsAppChatDrawer
            phone={lead.phone}
            leadId={lead.id}
            leadName={lead.name || 'Unnamed Lead'}
          />
        )}

        {/* Follow-up */}
        <FollowUpDialog
          leadId={lead.id}
          leadName={lead.name || 'Unnamed Lead'}
        />

        {/* Contact Info */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Contact Information</h4>
          <div className="space-y-2 text-sm">
            {lead.email && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{lead.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium">{lead.source || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
