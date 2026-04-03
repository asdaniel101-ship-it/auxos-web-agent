'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { TaskPriority, TaskStatus } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  name: string
  assignee: string
  priority: TaskPriority
  dueDate: string
  linkedDealId: string
  linkedContactId: string
  notes: string
}

const initialData: FormData = {
  name: '',
  assignee: '',
  priority: 'medium',
  dueDate: '',
  linkedDealId: '',
  linkedContactId: '',
  notes: '',
}

export function TaskForm({ open, onOpenChange }: TaskFormProps) {
  const teamMembers = useStore((s) => s.teamMembers)
  const deals = useStore((s) => s.deals)
  const contacts = useStore((s) => s.contacts)
  const addTask = useStore((s) => s.addTask)
  const addActivity = useStore((s) => s.addActivity)
  const { toast } = useToast()

  const [data, setData] = useState<FormData>(initialData)

  function reset() {
    setData(initialData)
  }

  function handleClose(open: boolean) {
    if (!open) reset()
    onOpenChange(open)
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return

    const task = addTask({
      name: data.name.trim(),
      assignee: data.assignee,
      priority: data.priority,
      dueDate: data.dueDate || new Date().toISOString(),
      status: 'todo' as TaskStatus,
      linkedDealId: data.linkedDealId || null,
      linkedContactId: data.linkedContactId || null,
      notes: data.notes,
    })

    addActivity({
      type: 'task_created',
      description: `Created task "${data.name.trim()}"`,
      entityType: 'task',
      entityId: task.id,
      userId: data.assignee,
    })

    toast({
      title: 'Task created',
      description: `"${data.name.trim()}" was added successfully.`,
    })

    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Task Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-name">
              Task Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tf-name"
              value={data.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Enter task name…"
              required
              aria-label="Task name"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-assignee">Assignee</Label>
            <Select
              value={data.assignee || 'none'}
              onValueChange={(v) => setField('assignee', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="tf-assignee" aria-label="Select assignee">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {teamMembers.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-priority">Priority</Label>
            <Select
              value={data.priority}
              onValueChange={(v) => setField('priority', v as TaskPriority)}
            >
              <SelectTrigger id="tf-priority" aria-label="Select priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-dueDate">Due Date</Label>
            <Input
              id="tf-dueDate"
              type="date"
              value={data.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
              aria-label="Due date"
            />
          </div>

          {/* Link to Deal */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-deal">Link to Deal (optional)</Label>
            <Select
              value={data.linkedDealId || 'none'}
              onValueChange={(v) => setField('linkedDealId', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="tf-deal" aria-label="Link to deal">
                <SelectValue placeholder="Select a deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {deals.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link to Contact */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-contact">Link to Contact (optional)</Label>
            <Select
              value={data.linkedContactId || 'none'}
              onValueChange={(v) => setField('linkedContactId', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="tf-contact" aria-label="Link to contact">
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-notes">Notes</Label>
            <Textarea
              id="tf-notes"
              value={data.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Any additional notes…"
              className="min-h-[80px]"
              aria-label="Task notes"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              aria-label="Cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!data.name.trim()} aria-label="Create task">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
