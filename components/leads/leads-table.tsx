"use client"

import { useMemo, useState } from "react"
import { Lead } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react"
import Link from "next/link"
import { EditLeadDialog } from "./edit-lead-dialog"
import { DeleteLeadDialog } from "./delete-lead-dialog"

interface LeadsTableProps {
  data: Lead[] | null
  onLeadUpdated?: () => void
}

export function LeadsTable({ data, onLeadUpdated }: LeadsTableProps) {
  const [stage, setStage] = useState<string>("")
  const [name, setName] = useState("")
  const [source, setSource] = useState("")

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((l) => {
      const byStage = !stage || stage === "all" || l.stage === stage
      const byName = !name || (l.name || "").toLowerCase().includes(name.toLowerCase())
      const bySource = !source || (l.source || "").toLowerCase().includes(source.toLowerCase())
      return byStage && byName && bySource
    })
  }, [data, stage, name, source])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {['Lead','Prospect','Enrolled','Rejected','Next Cohort'].map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-[200px]" />
        <Input placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} className="w-[200px]" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((l) => (
            <TableRow key={l.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link href={`/leads/${l.id}`} className="block w-full">
                  {l.name || '-'}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/leads/${l.id}`} className="block w-full">
                  {l.email || '-'}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/leads/${l.id}`} className="block w-full">
                  {l.phone || '-'}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/leads/${l.id}`} className="block w-full">
                  {l.source || '-'}
                </Link>
              </TableCell>
              <TableCell>
                <Select 
                  value={l.stage} 
                  onValueChange={async (newStage) => {
                    try {
                      const res = await fetch(`/api/leads/${l.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stage: newStage }),
                      })
                      if (res.ok && onLeadUpdated) {
                        onLeadUpdated()
                      }
                    } catch (error) {
                      console.error('Failed to update stage:', error)
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Lead','Prospect','Enrolled','Rejected','Next Cohort'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Link href={`/leads/${l.id}`} className="block w-full">
                  {new Date(l.created_at).toLocaleString()}
                </Link>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <IconDots className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <EditLeadDialog lead={l} onLeadUpdated={onLeadUpdated}>
                        <div className="flex items-center">
                          <IconEdit className="mr-2 h-4 w-4" />
                          Edit
                        </div>
                      </EditLeadDialog>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <DeleteLeadDialog lead={l} onLeadDeleted={onLeadUpdated}>
                        <div className="flex items-center text-destructive">
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete
                        </div>
                      </DeleteLeadDialog>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground">No leads match filters.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

