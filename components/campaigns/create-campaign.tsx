"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CreateCampaign() {
  async function action(formData: FormData) {
    const name = String(formData.get("name") || "")
    const res = await fetch("/api/gallabox/campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters: {}, template: { name: "template_name" } }),
    })
    if (!res.ok) alert("Failed to create campaign")
    else window.location.reload()
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex items-center gap-2">
          <Input name="name" placeholder="Campaign name" className="max-w-xs" />
          <Button type="submit">Create</Button>
        </form>
      </CardContent>
    </Card>
  )
}
