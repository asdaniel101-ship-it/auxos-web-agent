import { Report } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface ReportsSlice {
  reports: Report[]
  setReports: (reports: Report[]) => void
  addReport: (report: Omit<Report, 'id' | 'createdAt'>) => Report
  deleteReport: (id: string) => void
}

export const createReportsSlice: StateCreator<ReportsSlice> = (set) => ({
  reports: [],
  setReports: (reports) => set({ reports }),
  addReport: (data) => {
    const report: Report = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ reports: [...state.reports, report] }))
    return report
  },
  deleteReport: (id) =>
    set((state) => ({ reports: state.reports.filter((r) => r.id !== id) })),
})
