"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { IconMessageCircle, IconSend, IconX } from "@tabler/icons-react"
import { SendWhatsAppForm } from "./send-whatsapp-form"

interface WhatsAppChatDrawerProps {
  phone: string
  leadId: string
  leadName: string
}

export function WhatsAppChatDrawer({ phone, leadId, leadName }: WhatsAppChatDrawerProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ id: string; text: string; timestamp: Date; sent: boolean }>>([])

  // Mock conversation history - in real implementation, this would come from your chat system
  const mockMessages = [
    { id: "1", text: "Hello! I'm interested in your services.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), sent: false },
    { id: "2", text: "Hi! Thanks for reaching out. What specific services are you looking for?", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000), sent: true },
    { id: "3", text: "I need help with lead generation and CRM setup.", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), sent: false },
  ]

  const handleSendMessage = (message: string) => {
    // Add the new message to the conversation
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      sent: true
    }
    setMessages(prev => [...prev, newMessage])
  }

  const allMessages = [...mockMessages, ...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  const ChatContent = ({ onClose }: { onClose: () => void }) => (
    <>
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <IconMessageCircle className="h-5 w-5" />
          <div>
            <div className="font-semibold">WhatsApp Chat - {leadName}</div>
            <div className="text-sm text-muted-foreground">
              {phone} • Last seen recently
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <IconX className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {allMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${message.sent ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <CardContent className="p-3">
                  <div className="text-sm">{message.text}</div>
                  <div className={`text-xs mt-1 ${message.sent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <SendWhatsAppForm 
            phone={phone} 
            leadId={leadId}
            onMessageSent={handleSendMessage}
            compact={true}
          />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <div className="md:hidden">
        <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <IconMessageCircle className="h-4 w-4" />
              Chat with {leadName}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">
            <ChatContent onClose={() => setMobileOpen(false)} />
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Sheet */}
      <div className="hidden md:block">
        <Sheet open={desktopOpen} onOpenChange={setDesktopOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <IconMessageCircle className="h-4 w-4" />
              Chat with {leadName}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
            <div className="flex flex-col h-full">
              <ChatContent onClose={() => setDesktopOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
