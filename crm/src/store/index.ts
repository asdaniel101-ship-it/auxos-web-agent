'use client'

import { create } from 'zustand'
import { ContactsSlice, createContactsSlice } from './slices/contacts'
import { CompaniesSlice, createCompaniesSlice } from './slices/companies'
import { DealsSlice, createDealsSlice } from './slices/deals'
import { TasksSlice, createTasksSlice } from './slices/tasks'
import { EmailsSlice, createEmailsSlice } from './slices/emails'
import { ReportsSlice, createReportsSlice } from './slices/reports'
import { SettingsSlice, createSettingsSlice } from './slices/settings'
import { ActivitySlice, createActivitySlice } from './slices/activity'
import { generateSeedData } from '@/data/seed'

export type CrmStore = ContactsSlice &
  CompaniesSlice &
  DealsSlice &
  TasksSlice &
  EmailsSlice &
  ReportsSlice &
  SettingsSlice &
  ActivitySlice & {
    initialized: boolean
    initialize: () => void
  }

export const useStore = create<CrmStore>((set, get, api) => ({
  ...createContactsSlice(set, get, api),
  ...createCompaniesSlice(set, get, api),
  ...createDealsSlice(set, get, api),
  ...createTasksSlice(set, get, api),
  ...createEmailsSlice(set, get, api),
  ...createReportsSlice(set, get, api),
  ...createSettingsSlice(set, get, api),
  ...createActivitySlice(set, get, api),
  initialized: false,
  initialize: () => {
    if (get().initialized) return
    const seed = generateSeedData()
    set({
      contacts: seed.contacts,
      companies: seed.companies,
      deals: seed.deals,
      tasks: seed.tasks,
      emailThreads: seed.emailThreads,
      reports: seed.reports,
      settings: seed.settings,
      teamMembers: seed.teamMembers,
      activities: seed.activities,
      initialized: true,
    })
  },
}))
