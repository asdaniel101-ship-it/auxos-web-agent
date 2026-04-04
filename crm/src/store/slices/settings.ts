import { Settings, TeamMember } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

const defaultSettings: Settings = {
  notifications: {
    email: true,
    inApp: true,
    dailyDigest: false,
  },
  integrations: {
    slack: false,
    gmail: false,
    calendar: false,
  },
}

export interface SettingsSlice {
  settings: Settings
  teamMembers: TeamMember[]
  setSettings: (settings: Settings) => void
  updateSettings: (data: Partial<Settings>) => void
  setTeamMembers: (teamMembers: TeamMember[]) => void
  addTeamMember: (member: Omit<TeamMember, 'id'>) => TeamMember
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: defaultSettings,
  teamMembers: [],
  setSettings: (settings) => set({ settings }),
  updateSettings: (data) =>
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: data.notifications
          ? { ...state.settings.notifications, ...data.notifications }
          : state.settings.notifications,
        integrations: data.integrations
          ? { ...state.settings.integrations, ...data.integrations }
          : state.settings.integrations,
      },
    })),
  setTeamMembers: (teamMembers) => set({ teamMembers }),
  addTeamMember: (data) => {
    const member: TeamMember = { ...data, id: generateId() }
    set((state) => ({ teamMembers: [...state.teamMembers, member] }))
    return member
  },
})
