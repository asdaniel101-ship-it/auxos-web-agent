import { Task } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface TasksSlice {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
}

export const createTasksSlice: StateCreator<TasksSlice> = (set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (data) => {
    const task: Task = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ tasks: [...state.tasks, task] }))
    return task
  },
  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: 'done' } : t)),
    })),
})
