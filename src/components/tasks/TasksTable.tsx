'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/store'
import { TaskPriority, TaskStatus } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TaskForm } from './TaskForm'
import { Search, Plus } from 'lucide-react'

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 border-slate-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  done: 'bg-green-100 text-green-700 border-green-200',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export function TasksTable() {
  const tasks = useStore((s) => s.tasks)
  const deals = useStore((s) => s.deals)
  const contacts = useStore((s) => s.contacts)
  const teamMembers = useStore((s) => s.teamMembers)
  const completeTask = useStore((s) => s.completeTask)
  const updateTask = useStore((s) => s.updateTask)
  const addActivity = useStore((s) => s.addActivity)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)

  if (!initialized) initialize()

  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formOpen, setFormOpen] = useState(false)

  const dealMap = new Map(deals.map((d) => [d.id, d]))
  const contactMap = new Map(contacts.map((c) => [c.id, c]))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = tasks.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
    const matchesAssignee = assigneeFilter === 'all' || t.assignee === assigneeFilter
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesAssignee && matchesPriority && matchesStatus
  })

  function isOverdue(task: { dueDate: string; status: TaskStatus }): boolean {
    if (task.status === 'done') return false
    const due = new Date(task.dueDate)
    due.setHours(0, 0, 0, 0)
    return due < today
  }

  function handleToggleDone(taskId: string, currentStatus: TaskStatus) {
    if (currentStatus === 'done') {
      // Toggle back to todo
      updateTask(taskId, { status: 'todo' })
      addActivity({
        type: 'task_created',
        description: `Reopened task`,
        entityType: 'task',
        entityId: taskId,
        userId: '',
      })
    } else {
      completeTask(taskId)
      addActivity({
        type: 'task_completed',
        description: `Completed task`,
        entityType: 'task',
        entityId: taskId,
        userId: '',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
          />
        </div>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-44" aria-label="Filter by assignee">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.name}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => setFormOpen(true)}
          aria-label="Add new task"
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" aria-label="Done">
                <span className="sr-only">Done</span>
              </TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Linked To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-10">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((task) => {
                const overdue = isOverdue(task)
                const deal = task.linkedDealId ? dealMap.get(task.linkedDealId) : null
                const contact = task.linkedContactId ? contactMap.get(task.linkedContactId) : null
                const isDone = task.status === 'done'

                return (
                  <TableRow
                    key={task.id}
                    data-task-id={task.id}
                    data-id={task.id}
                    className={cn(overdue && 'bg-red-50')}
                  >
                    {/* Done checkbox */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isDone}
                        onCheckedChange={() => handleToggleDone(task.id, task.status)}
                        aria-label={isDone ? `Reopen task: ${task.name}` : `Complete task: ${task.name}`}
                      />
                    </TableCell>

                    {/* Task Name */}
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        )}
                      >
                        {task.name}
                      </span>
                    </TableCell>

                    {/* Assignee */}
                    <TableCell className="text-slate-600">
                      {task.assignee || '—'}
                    </TableCell>

                    {/* Due Date */}
                    <TableCell
                      className={cn(
                        overdue ? 'text-red-600 font-medium' : 'text-slate-600'
                      )}
                    >
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                      {overdue && (
                        <span className="ml-1.5 text-xs font-semibold text-red-500">
                          Overdue
                        </span>
                      )}
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <Badge className={PRIORITY_COLORS[task.priority]}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={STATUS_COLORS[task.status]}>
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </TableCell>

                    {/* Linked Entity */}
                    <TableCell className="text-slate-600">
                      {deal ? (
                        <Link
                          href={`/deals`}
                          className="text-blue-600 hover:underline"
                          aria-label={`Linked deal: ${deal.name}`}
                        >
                          {deal.name}
                        </Link>
                      ) : contact ? (
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="text-blue-600 hover:underline"
                          aria-label={`Linked contact: ${contact.firstName} ${contact.lastName}`}
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TaskForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
