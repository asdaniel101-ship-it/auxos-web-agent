import { ActivityEntry } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface ActivitySlice {
  activities: ActivityEntry[]
  setActivities: (activities: ActivityEntry[]) => void
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => ActivityEntry
}

export const createActivitySlice: StateCreator<ActivitySlice> = (set) => ({
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (data) => {
    const activity: ActivityEntry = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
    }
    set((state) => ({ activities: [activity, ...state.activities] }))
    return activity
  },
})
