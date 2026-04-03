'use client'
import { TasksTable } from '@/components/tasks/TasksTable'
export default function TasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
      <TasksTable />
    </div>
  )
}
