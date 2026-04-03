# Auxos CRM MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complex CRM web application with an embedded Auxos AI chat agent that can perform any CRM action via natural language.

**Architecture:** Next.js 14 App Router with client-side Zustand store for all data (no backend DB). Mock data seeded on load. Eight CRM pages (dashboard, contacts, companies, deals, tasks, emails, reports, settings) with full CRUD. Floating chat agent powered by Claude API with tool-calling to manipulate the Zustand store. All state changes reflect immediately in the UI.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, Recharts (charts), Claude API (agent), @dnd-kit (kanban drag-and-drop)

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout: sidebar + agent overlay
│   ├── page.tsx                      # Redirect to /dashboard
│   ├── globals.css                   # Tailwind + custom styles
│   ├── dashboard/page.tsx
│   ├── contacts/page.tsx
│   ├── contacts/[id]/page.tsx
│   ├── companies/page.tsx
│   ├── companies/[id]/page.tsx
│   ├── deals/page.tsx
│   ├── deals/[id]/page.tsx
│   ├── tasks/page.tsx
│   ├── emails/page.tsx
│   ├── reports/page.tsx
│   ├── settings/page.tsx
│   └── api/agent/route.ts           # Claude API proxy
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── ui/                          # shadcn/ui primitives (installed via CLI)
│   ├── dashboard/
│   │   ├── KpiCards.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── DealsByStageChart.tsx
│   │   └── ActivityFeed.tsx
│   ├── contacts/
│   │   ├── ContactsTable.tsx
│   │   ├── ContactDetail.tsx
│   │   └── ContactForm.tsx
│   ├── companies/
│   │   ├── CompaniesTable.tsx
│   │   ├── CompanyDetail.tsx
│   │   └── CompanyForm.tsx
│   ├── deals/
│   │   ├── DealsKanban.tsx
│   │   ├── DealsList.tsx
│   │   ├── DealDetail.tsx
│   │   └── DealForm.tsx
│   ├── tasks/
│   │   ├── TasksTable.tsx
│   │   └── TaskForm.tsx
│   ├── emails/
│   │   ├── EmailList.tsx
│   │   ├── EmailThread.tsx
│   │   └── ComposeEmail.tsx
│   ├── reports/
│   │   ├── ReportChart.tsx
│   │   ├── ReportFilters.tsx
│   │   └── ReportBuilder.tsx
│   ├── settings/
│   │   ├── ProfileTab.tsx
│   │   ├── TeamTab.tsx
│   │   ├── NotificationsTab.tsx
│   │   ├── IntegrationsTab.tsx
│   │   └── DataTab.tsx
│   └── agent/
│       ├── AgentButton.tsx
│       ├── AgentPanel.tsx
│       └── AgentMessage.tsx
├── store/
│   ├── index.ts                     # Combined Zustand store
│   ├── slices/contacts.ts
│   ├── slices/companies.ts
│   ├── slices/deals.ts
│   ├── slices/tasks.ts
│   ├── slices/emails.ts
│   ├── slices/reports.ts
│   ├── slices/settings.ts
│   └── slices/activity.ts
├── data/
│   └── seed.ts                      # Deterministic mock data generator
├── agent/
│   ├── system-prompt.ts
│   ├── tools.ts                     # Tool schemas for Claude
│   └── executor.ts                  # Maps tool calls → store actions
├── lib/
│   └── utils.ts                     # cn() helper + misc utilities
└── types/
    └── index.ts                     # All entity types
```

---

## Phase 1: CRM Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/utils.ts`

- [ ] **Step 1: Create Next.js project with TypeScript and Tailwind**

```bash
cd /Users/ashtondaniel/auxos-web-agent
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

When prompted, accept defaults. This creates the full Next.js scaffold.

- [ ] **Step 2: Install core dependencies**

```bash
npm install zustand recharts @anthropic-ai/sdk lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-avatar @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities date-fns seed-random
```

- [ ] **Step 3: Set up the cn() utility**

Write `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn-ui@latest init
```

Choose: New York style, Slate base color, CSS variables = yes.

Then install commonly needed components:

```bash
npx shadcn-ui@latest add button card input label select table tabs dialog badge toast dropdown-menu avatar tooltip checkbox switch popover separator sheet textarea command
```

- [ ] **Step 5: Update globals.css with custom styles**

Update `src/app/globals.css` — keep the Tailwind directives and shadcn CSS variables that were generated, and add at the end:

```css
/* Add after existing content */
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
  }
}
```

- [ ] **Step 6: Create .env.local template**

Create `.env.example`:
```
ANTHROPIC_API_KEY=your-api-key-here
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=
```

Add `.env.local` to `.gitignore` if not already there.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with Tailwind, shadcn/ui, and dependencies"
```

---

### Task 2: Define TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write all entity types**

```typescript
// src/types/index.ts

export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'churned'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  companyId: string | null
  status: ContactStatus
  owner: string
  title: string
  lastContacted: string // ISO date
  createdAt: string
  notes: string
}

export type DealStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost'

export interface Deal {
  id: string
  name: string
  companyId: string | null
  contactIds: string[]
  value: number
  stage: DealStage
  owner: string
  closeDate: string
  probability: number
  createdAt: string
  notes: string
}

export interface Company {
  id: string
  name: string
  industry: string
  size: string
  revenue: number
  website: string
  address: string
  createdAt: string
  notes: string
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  name: string
  assignee: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  linkedDealId: string | null
  linkedContactId: string | null
  createdAt: string
  notes: string
}

export interface EmailMessage {
  id: string
  from: string
  to: string
  body: string
  timestamp: string
}

export interface EmailThread {
  id: string
  subject: string
  participants: string[]
  messages: EmailMessage[]
  linkedContactId: string | null
  linkedDealId: string | null
  createdAt: string
}

export type ChartType = 'bar' | 'line' | 'pie'

export interface Report {
  id: string
  name: string
  type: 'revenue-by-month' | 'deals-by-stage' | 'contacts-by-source' | 'tasks-by-owner' | 'pipeline-forecast' | 'custom'
  chartType: ChartType
  filters: Record<string, string>
  dateRange: { start: string; end: string }
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'member'
  avatar: string
}

export interface ActivityEntry {
  id: string
  type: 'contact_created' | 'deal_created' | 'deal_stage_changed' | 'task_completed' | 'email_sent' | 'note_added' | 'contact_updated' | 'deal_updated' | 'task_created' | 'company_created'
  description: string
  entityType: 'contact' | 'company' | 'deal' | 'task' | 'email'
  entityId: string
  userId: string
  timestamp: string
}

export interface Settings {
  notifications: {
    email: boolean
    inApp: boolean
    dailyDigest: boolean
  }
  integrations: {
    slack: boolean
    gmail: boolean
    calendar: boolean
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: define TypeScript types for all CRM entities"
```

---

### Task 3: Build Mock Data Seed Generator

**Files:**
- Create: `src/data/seed.ts`

- [ ] **Step 1: Write the seed data generator**

Create `src/data/seed.ts` with deterministic mock data. Use `seed-random` for reproducibility. Generate:
- 4 team members (Sarah Chen, Marcus Johnson, Priya Patel, Alex Rivera)
- 15 companies with realistic names/industries
- 50 contacts distributed across companies
- 25 deals across pipeline stages ($5k-$500k)
- 40 tasks with varied priorities/statuses
- 30 email threads with 2-5 messages each
- 100+ activity log entries over last 30 days

Key implementation details:
- Use a seeded PRNG (`seed-random('auxos-crm')`) so data is identical across loads
- Company names: use an array of realistic names like "Meridian Corp", "Northwind Industries", "Brightpath Labs", "Quantum Dynamics", "Atlas Ventures", "Pinnacle Systems", "Horizon Digital", "Vertex Solutions", "Nova Analytics", "Summit Partners", "Cascade AI", "Evergreen Tech", "Sapphire Data", "TerraFirma Inc", "Ironclad Security"
- Contact names: use arrays of realistic first/last names, generate emails as firstname@companyname.com
- Deals named after companies: e.g., "Meridian Corp - Enterprise License"
- Tasks: mix of "Follow up with {contact}", "Prepare proposal for {company}", "Schedule demo with {contact}", etc.
- Activity timestamps distributed across last 30 days
- Each generator function returns typed arrays

The file should export a single function `generateSeedData()` that returns:
```typescript
export interface SeedData {
  teamMembers: TeamMember[]
  companies: Company[]
  contacts: Contact[]
  deals: Deal[]
  tasks: Task[]
  emailThreads: EmailThread[]
  activities: ActivityEntry[]
  reports: Report[]
  settings: Settings
}

export function generateSeedData(): SeedData { ... }
```

Use the `date-fns` library for date manipulation (subDays, addDays, format).

- [ ] **Step 2: Commit**

```bash
git add src/data/seed.ts
git commit -m "feat: add deterministic mock data seed generator"
```

---

### Task 4: Create Zustand Store

**Files:**
- Create: `src/store/slices/contacts.ts`, `src/store/slices/companies.ts`, `src/store/slices/deals.ts`, `src/store/slices/tasks.ts`, `src/store/slices/emails.ts`, `src/store/slices/reports.ts`, `src/store/slices/settings.ts`, `src/store/slices/activity.ts`, `src/store/index.ts`

- [ ] **Step 1: Create the contacts slice**

```typescript
// src/store/slices/contacts.ts
import { Contact } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface ContactsSlice {
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact
  updateContact: (id: string, data: Partial<Contact>) => void
  deleteContact: (id: string) => void
  bulkUpdateContacts: (ids: string[], data: Partial<Contact>) => void
}

export const createContactsSlice: StateCreator<ContactsSlice> = (set, get) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (data) => {
    const contact: Contact = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ contacts: [...state.contacts, contact] }))
    return contact
  },
  updateContact: (id, data) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteContact: (id) =>
    set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
  bulkUpdateContacts: (ids, data) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (ids.includes(c.id) ? { ...c, ...data } : c)),
    })),
})
```

- [ ] **Step 2: Create the companies slice**

Same pattern as contacts. Actions: `setCompanies`, `addCompany`, `updateCompany`, `deleteCompany`.

```typescript
// src/store/slices/companies.ts
import { Company } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface CompaniesSlice {
  companies: Company[]
  setCompanies: (companies: Company[]) => void
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Company
  updateCompany: (id: string, data: Partial<Company>) => void
  deleteCompany: (id: string) => void
}

export const createCompaniesSlice: StateCreator<CompaniesSlice> = (set) => ({
  companies: [],
  setCompanies: (companies) => set({ companies }),
  addCompany: (data) => {
    const company: Company = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ companies: [...state.companies, company] }))
    return company
  },
  updateCompany: (id, data) =>
    set((state) => ({
      companies: state.companies.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteCompany: (id) =>
    set((state) => ({ companies: state.companies.filter((c) => c.id !== id) })),
})
```

- [ ] **Step 3: Create the deals slice**

```typescript
// src/store/slices/deals.ts
import { Deal, DealStage } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface DealsSlice {
  deals: Deal[]
  setDeals: (deals: Deal[]) => void
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Deal
  updateDeal: (id: string, data: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  moveDealStage: (id: string, stage: DealStage) => void
}

export const createDealsSlice: StateCreator<DealsSlice> = (set) => ({
  deals: [],
  setDeals: (deals) => set({ deals }),
  addDeal: (data) => {
    const deal: Deal = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ deals: [...state.deals, deal] }))
    return deal
  },
  updateDeal: (id, data) =>
    set((state) => ({
      deals: state.deals.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),
  deleteDeal: (id) =>
    set((state) => ({ deals: state.deals.filter((d) => d.id !== id) })),
  moveDealStage: (id, stage) =>
    set((state) => ({
      deals: state.deals.map((d) => (d.id === id ? { ...d, stage } : d)),
    })),
})
```

- [ ] **Step 4: Create the tasks slice**

```typescript
// src/store/slices/tasks.ts
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
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: 'done' as const } : t)),
    })),
})
```

- [ ] **Step 5: Create the emails slice**

```typescript
// src/store/slices/emails.ts
import { EmailThread, EmailMessage } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface EmailsSlice {
  emailThreads: EmailThread[]
  setEmailThreads: (threads: EmailThread[]) => void
  addEmailThread: (thread: Omit<EmailThread, 'id' | 'createdAt'>) => EmailThread
  replyToThread: (threadId: string, message: Omit<EmailMessage, 'id' | 'timestamp'>) => void
}

export const createEmailsSlice: StateCreator<EmailsSlice> = (set) => ({
  emailThreads: [],
  setEmailThreads: (emailThreads) => set({ emailThreads }),
  addEmailThread: (data) => {
    const thread: EmailThread = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ emailThreads: [...state.emailThreads, thread] }))
    return thread
  },
  replyToThread: (threadId, message) =>
    set((state) => ({
      emailThreads: state.emailThreads.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, { ...message, id: generateId(), timestamp: new Date().toISOString() }] }
          : t
      ),
    })),
})
```

- [ ] **Step 6: Create the reports, settings, and activity slices**

```typescript
// src/store/slices/reports.ts
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
```

```typescript
// src/store/slices/settings.ts
import { Settings, TeamMember } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface SettingsSlice {
  settings: Settings
  teamMembers: TeamMember[]
  setSettings: (settings: Settings) => void
  updateSettings: (data: Partial<Settings>) => void
  setTeamMembers: (members: TeamMember[]) => void
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: {
    notifications: { email: true, inApp: true, dailyDigest: false },
    integrations: { slack: false, gmail: false, calendar: false },
  },
  teamMembers: [],
  setSettings: (settings) => set({ settings }),
  updateSettings: (data) =>
    set((state) => ({ settings: { ...state.settings, ...data } })),
  setTeamMembers: (teamMembers) => set({ teamMembers }),
  addTeamMember: (member) =>
    set((state) => ({ teamMembers: [...state.teamMembers, { ...member, id: generateId() }] })),
})
```

```typescript
// src/store/slices/activity.ts
import { ActivityEntry } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface ActivitySlice {
  activities: ActivityEntry[]
  setActivities: (activities: ActivityEntry[]) => void
  addActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void
}

export const createActivitySlice: StateCreator<ActivitySlice> = (set) => ({
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (entry) =>
    set((state) => ({
      activities: [
        { ...entry, id: generateId(), timestamp: new Date().toISOString() },
        ...state.activities,
      ],
    })),
})
```

- [ ] **Step 7: Create the combined store with seed initialization**

```typescript
// src/store/index.ts
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
```

- [ ] **Step 8: Commit**

```bash
git add src/store/ 
git commit -m "feat: add Zustand store with all CRM entity slices and seed initialization"
```

---

### Task 5: Build Sidebar Layout and Navigation

**Files:**
- Create: `src/components/layout/Sidebar.tsx`, `src/components/layout/Breadcrumbs.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create the Sidebar component**

```typescript
// src/components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  Mail,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/deals', label: 'Deals', icon: Handshake },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r bg-white" aria-label="Main navigation">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-xl font-bold text-slate-900">CRM</span>
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`Navigate to ${item.label}`}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create the Breadcrumbs component**

```typescript
// src/components/layout/Breadcrumbs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-slate-500">
      {segments.map((segment, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)

        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {isLast ? (
              <span className="text-slate-900 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-slate-900">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Create a StoreInitializer client component and update root layout**

Create `src/components/StoreInitializer.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { useStore } from '@/store'

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
```

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { StoreInitializer } from '@/components/StoreInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRM - Auxos Demo',
  description: 'CRM application with embedded Auxos AI agent',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreInitializer>
          <Sidebar />
          <main className="ml-60 min-h-screen bg-slate-50 p-6">
            {children}
          </main>
        </StoreInitializer>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Update the root page to redirect to dashboard**

```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 5: Create placeholder pages for all routes**

Create each of these files with a simple placeholder component so navigation works:

`src/app/dashboard/page.tsx`, `src/app/contacts/page.tsx`, `src/app/contacts/[id]/page.tsx`, `src/app/companies/page.tsx`, `src/app/companies/[id]/page.tsx`, `src/app/deals/page.tsx`, `src/app/deals/[id]/page.tsx`, `src/app/tasks/page.tsx`, `src/app/emails/page.tsx`, `src/app/reports/page.tsx`, `src/app/settings/page.tsx`

Each placeholder:
```typescript
export default function PageName() {
  return <div><h1 className="text-2xl font-bold">Page Name</h1></div>
}
```

- [ ] **Step 6: Verify the app builds and runs**

```bash
npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add sidebar layout, navigation, breadcrumbs, and page stubs"
```

---

### Task 6: Build Dashboard Page

**Files:**
- Create: `src/components/dashboard/KpiCards.tsx`, `src/components/dashboard/RevenueChart.tsx`, `src/components/dashboard/DealsByStageChart.tsx`, `src/components/dashboard/ActivityFeed.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create KpiCards component**

```typescript
// src/components/dashboard/KpiCards.tsx
'use client'

import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Handshake, CheckSquare, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function KpiCards() {
  const deals = useStore((s) => s.deals)
  const tasks = useStore((s) => s.tasks)
  const contacts = useStore((s) => s.contacts)

  const totalRevenue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.value, 0)
  const openDeals = deals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length
  const today = new Date().toISOString().split('T')[0]
  const tasksDueToday = tasks.filter((t) => t.dueDate.startsWith(today) && t.status !== 'done').length
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const newContactsThisWeek = contacts.filter((c) => c.createdAt > oneWeekAgo).length

  const kpis = [
    { title: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign },
    { title: 'Open Deals', value: openDeals.toString(), icon: Handshake },
    { title: 'Tasks Due Today', value: tasksDueToday.toString(), icon: CheckSquare },
    { title: 'New Contacts (7d)', value: newContactsThisWeek.toString(), icon: Users },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create RevenueChart component**

```typescript
// src/components/dashboard/RevenueChart.tsx
'use client'

import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function RevenueChart() {
  const deals = useStore((s) => s.deals)

  // Generate last 12 months of revenue data from closed-won deals
  const months: { month: string; revenue: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthKey = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    const revenue = deals
      .filter((deal) => deal.stage === 'Closed Won' && deal.closeDate.startsWith(monthKey))
      .reduce((sum, deal) => sum + deal.value, 0)
    months.push({ month: label, revenue })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue (12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={months}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create DealsByStageChart component**

```typescript
// src/components/dashboard/DealsByStageChart.tsx
'use client'

import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DealStage } from '@/types'

const stageOrder: DealStage[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

export function DealsByStageChart() {
  const deals = useStore((s) => s.deals)

  const data = stageOrder.map((stage) => ({
    stage: stage.replace('Closed ', 'C. '),
    count: deals.filter((d) => d.stage === stage).length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Create ActivityFeed component**

```typescript
// src/components/dashboard/ActivityFeed.tsx
'use client'

import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export function ActivityFeed() {
  const activities = useStore((s) => s.activities)
  const recent = activities.slice(0, 20)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recent.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 text-sm">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1">
                <p className="text-slate-700">{activity.description}</p>
                <p className="text-xs text-slate-400">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Assemble the dashboard page**

```typescript
// src/app/dashboard/page.tsx
'use client'

import { KpiCards } from '@/components/dashboard/KpiCards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { DealsByStageChart } from '@/components/dashboard/DealsByStageChart'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <KpiCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <DealsByStageChart />
      </div>
      <ActivityFeed />
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/ src/app/dashboard/page.tsx
git commit -m "feat: build dashboard page with KPI cards, charts, and activity feed"
```

---

## Phase 2: CRM Pages

### Task 7: Contacts List Page

**Files:**
- Create: `src/components/contacts/ContactsTable.tsx`
- Modify: `src/app/contacts/page.tsx`

- [ ] **Step 1: Create ContactsTable component**

Build a searchable, filterable table using shadcn Table. Include:
- Search input filtering by name/email/company
- Filter dropdowns: status (lead/prospect/customer/churned), owner (team members)
- Table columns: name (first + last), email, phone, company name (resolve companyId), status badge, last contacted, owner
- Each row is clickable → links to `/contacts/[id]`
- "Add Contact" button in header
- Bulk select with checkboxes → bulk actions dropdown (assign owner, change status)

- [ ] **Step 2: Wire up the contacts page**

```typescript
// src/app/contacts/page.tsx
'use client'
import { ContactsTable } from '@/components/contacts/ContactsTable'

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
      <ContactsTable />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/contacts/ContactsTable.tsx src/app/contacts/page.tsx
git commit -m "feat: build contacts list page with search, filters, and table"
```

---

### Task 8: Contact Detail Page

**Files:**
- Create: `src/components/contacts/ContactDetail.tsx`
- Modify: `src/app/contacts/[id]/page.tsx`

- [ ] **Step 1: Build ContactDetail component**

Sections:
- Profile header: name, title, email, phone, status badge, owner, edit button
- Associated company (linked, clickable)
- Associated deals (list from store filtered by contactId)
- Associated tasks (list from store filtered by linkedContactId)
- Activity timeline (filtered from activities store)
- Notes section with editable textarea
- Delete button with confirmation

- [ ] **Step 2: Wire up the detail page**

```typescript
// src/app/contacts/[id]/page.tsx
'use client'
import { useStore } from '@/store'
import { ContactDetail } from '@/components/contacts/ContactDetail'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { notFound } from 'next/navigation'

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Breadcrumbs />
      <ContactDetail id={params.id} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/contacts/ContactDetail.tsx src/app/contacts/\\[id\\]/page.tsx
git commit -m "feat: build contact detail page with associated entities and timeline"
```

---

### Task 9: Contact Creation Form

**Files:**
- Create: `src/components/contacts/ContactForm.tsx`

- [ ] **Step 1: Build multi-step ContactForm**

A Dialog/Sheet form with steps:
1. Basic info: first name, last name, email, phone, title
2. Company association: select from existing companies or "None"
3. Initial notes: textarea
4. Assign owner: select from team members

Each step has Next/Back buttons. Final step has "Create Contact" button.
On submit: calls `addContact()` and `addActivity()` from store. Shows toast on success.

- [ ] **Step 2: Integrate form into contacts page** 

The "Add Contact" button in ContactsTable opens this dialog.

- [ ] **Step 3: Commit**

```bash
git add src/components/contacts/ContactForm.tsx src/components/contacts/ContactsTable.tsx
git commit -m "feat: add multi-step contact creation form"
```

---

### Task 10: Companies Pages

**Files:**
- Create: `src/components/companies/CompaniesTable.tsx`, `src/components/companies/CompanyDetail.tsx`, `src/components/companies/CompanyForm.tsx`
- Modify: `src/app/companies/page.tsx`, `src/app/companies/[id]/page.tsx`

- [ ] **Step 1: Build CompaniesTable**

Table columns: name, industry, size, revenue, number of contacts (count from contacts store), number of open deals.
Search by name. Clickable rows → `/companies/[id]`. "Add Company" button.

- [ ] **Step 2: Build CompanyDetail**

Company info card, contacts list (filtered from store), deals list (filtered), activity timeline, notes. Edit and delete functionality.

- [ ] **Step 3: Build CompanyForm**

Dialog form: name, industry, size (dropdown: 1-10, 11-50, 51-200, 201-500, 500+), website, address, notes.
On submit: `addCompany()` + `addActivity()`.

- [ ] **Step 4: Wire up pages**

- [ ] **Step 5: Commit**

```bash
git add src/components/companies/ src/app/companies/
git commit -m "feat: build companies list, detail, and creation pages"
```

---

### Task 11: Deals Kanban and List View

**Files:**
- Create: `src/components/deals/DealsKanban.tsx`, `src/components/deals/DealsList.tsx`
- Modify: `src/app/deals/page.tsx`

- [ ] **Step 1: Build DealsKanban**

Use `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop.
Columns for each DealStage. Each deal card shows: deal name, company name, value, owner.
On drag end: call `moveDealStage()` + `addActivity()`.

- [ ] **Step 2: Build DealsList**

Table view: deal name, company, value (formatted currency), stage (badge), owner, close date, probability.
Filterable by stage, owner, value range.

- [ ] **Step 3: Wire up deals page with view toggle**

Tab buttons to switch between Kanban and List view. "Add Deal" button. Filters panel.

- [ ] **Step 4: Commit**

```bash
git add src/components/deals/ src/app/deals/page.tsx
git commit -m "feat: build deals kanban board and list view with drag-and-drop"
```

---

### Task 12: Deal Detail and Form

**Files:**
- Create: `src/components/deals/DealDetail.tsx`, `src/components/deals/DealForm.tsx`
- Modify: `src/app/deals/[id]/page.tsx`

- [ ] **Step 1: Build DealDetail**

Deal info card (name, value, stage with progress indicator, owner, close date, probability).
Associated contacts list, associated company (clickable), tasks list, activity timeline, notes.
Edit fields inline. Stage change dropdown.

- [ ] **Step 2: Build DealForm (multi-step)**

Steps: 1) Deal name + value, 2) Select company, 3) Select contacts (multi-select), 4) Set stage + close date + probability, 5) Assign owner.
On submit: `addDeal()` + `addActivity()`.

- [ ] **Step 3: Wire up detail page**

- [ ] **Step 4: Commit**

```bash
git add src/components/deals/DealDetail.tsx src/components/deals/DealForm.tsx src/app/deals/\\[id\\]/page.tsx
git commit -m "feat: build deal detail page and multi-step creation form"
```

---

### Task 13: Tasks Page

**Files:**
- Create: `src/components/tasks/TasksTable.tsx`, `src/components/tasks/TaskForm.tsx`
- Modify: `src/app/tasks/page.tsx`

- [ ] **Step 1: Build TasksTable**

Table columns: task name, assignee, due date, priority (color-coded badge), status (badge), linked entity.
Filters: assignee, priority, status, due date range.
Inline status toggle: click checkbox to mark done (calls `completeTask()`).
Overdue tasks (dueDate < today && status !== 'done') highlighted with red text/background.

- [ ] **Step 2: Build TaskForm**

Dialog form: task name, assign to (select team member), priority (select), due date (date picker), link to deal or contact (optional selects), notes.
On submit: `addTask()` + `addActivity()`.

- [ ] **Step 3: Wire up tasks page**

- [ ] **Step 4: Commit**

```bash
git add src/components/tasks/ src/app/tasks/page.tsx
git commit -m "feat: build tasks page with table, filters, inline actions, and creation form"
```

---

### Task 14: Emails Page

**Files:**
- Create: `src/components/emails/EmailList.tsx`, `src/components/emails/EmailThread.tsx`, `src/components/emails/ComposeEmail.tsx`
- Modify: `src/app/emails/page.tsx`

- [ ] **Step 1: Build EmailList**

Left panel: list of email threads. Each item shows subject, participants preview, latest message preview, timestamp. Clickable to select.

- [ ] **Step 2: Build EmailThread**

Right panel: shows the selected thread. Displays all messages in order with from/to, timestamp, body. Reply input at the bottom. Calls `replyToThread()` on submit.

- [ ] **Step 3: Build ComposeEmail**

Dialog form: to (email), subject, body. On submit: creates new EmailThread via `addEmailThread()`.

- [ ] **Step 4: Wire up emails page**

Split layout: EmailList on left (w-1/3), EmailThread on right (w-2/3). Compose button in header. Manage selected thread state locally.

- [ ] **Step 5: Commit**

```bash
git add src/components/emails/ src/app/emails/page.tsx
git commit -m "feat: build emails page with inbox layout, thread view, and compose"
```

---

### Task 15: Reports Page

**Files:**
- Create: `src/components/reports/ReportChart.tsx`, `src/components/reports/ReportFilters.tsx`, `src/components/reports/ReportBuilder.tsx`
- Modify: `src/app/reports/page.tsx`

- [ ] **Step 1: Build ReportChart**

Renders a chart (bar, line, or pie) based on report config. Uses Recharts. Computes data from the store based on report type:
- `revenue-by-month`: aggregate deals by closeDate month
- `deals-by-stage`: count deals per stage
- `contacts-by-source`: count contacts by status
- `tasks-by-owner`: count tasks per assignee
- `pipeline-forecast`: sum deal values by stage × probability

- [ ] **Step 2: Build ReportFilters**

Date range selector (start/end date inputs). Owner filter (select). Stage filter (select). Chart type toggle (bar/line/pie buttons).

- [ ] **Step 3: Build ReportBuilder (multi-step dialog)**

Steps: 1) Select metrics (report type), 2) Set date range, 3) Apply filters, 4) Choose chart type, 5) Name the report.
On submit: `addReport()`.

- [ ] **Step 4: Wire up reports page**

List of saved reports (cards). Click a report to view it (shows ReportChart + ReportFilters). "Create Custom Report" button opens ReportBuilder. "Export CSV" button generates a blob download.

- [ ] **Step 5: Commit**

```bash
git add src/components/reports/ src/app/reports/page.tsx
git commit -m "feat: build reports page with charts, filters, and report builder"
```

---

### Task 16: Settings Page

**Files:**
- Create: `src/components/settings/ProfileTab.tsx`, `src/components/settings/TeamTab.tsx`, `src/components/settings/NotificationsTab.tsx`, `src/components/settings/IntegrationsTab.tsx`, `src/components/settings/DataTab.tsx`
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Build all settings tab components**

**ProfileTab:** Display current user info (hardcoded as first team member). Editable name/email fields. Avatar placeholder. Mock password change form.

**TeamTab:** List team members with name, email, role badge. "Invite Member" form (email + role select). Uses `addTeamMember()`.

**NotificationsTab:** Three Switch toggles for email, in-app, daily digest. Calls `updateSettings()` on toggle.

**IntegrationsTab:** Cards for Slack, Gmail, Calendar. Each has a Switch to connect/disconnect. Calls `updateSettings()`.

**DataTab:** "Import Contacts" button (mock file upload). "Export All Data" button (generates JSON blob download).

- [ ] **Step 2: Wire up settings page with Tabs**

Use shadcn Tabs component. Five tabs: Profile, Team, Notifications, Integrations, Data.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/ src/app/settings/page.tsx
git commit -m "feat: build settings page with profile, team, notifications, integrations, and data tabs"
```

---

## Phase 3: Agent Integration

### Task 17: Agent Chat UI

**Files:**
- Create: `src/components/agent/AgentButton.tsx`, `src/components/agent/AgentPanel.tsx`, `src/components/agent/AgentMessage.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Build AgentButton**

Floating circular button, fixed bottom-right (bottom-6 right-6). Auxos logo or chat icon. onClick toggles panel open/closed. z-50.

- [ ] **Step 2: Build AgentMessage**

Message bubble component. Props: `role: 'user' | 'assistant'`, `content: string`, `isStreaming?: boolean`.
User messages: right-aligned, blue background.
Assistant messages: left-aligned, gray background.
If streaming, show a blinking cursor at the end.

- [ ] **Step 3: Build AgentPanel**

400px wide, 600px tall panel that slides up from the bottom-right corner.
Header: "Auxos" title, close button.
Message list: scrollable div, renders AgentMessage for each message.
Input area: textarea + send button at the bottom.
State: `messages[]`, `input`, `isLoading`.
On submit: add user message to messages, POST to `/api/agent`, stream response and add assistant message.
Auto-scroll to bottom on new messages.

Example prompt suggestions shown when no messages:
- "Show me all deals worth over $100k"
- "Create a new contact named Alex Chen at Quantum Labs"
- "What does my pipeline look like this quarter?"
- "Reassign all of Priya's tasks to Marcus"

- [ ] **Step 4: Add AgentButton + AgentPanel to root layout**

Add to `layout.tsx` inside the StoreInitializer, after `<main>`:

```typescript
<AgentButton />
<AgentPanel />
```

Use a simple state variable or Zustand to coordinate open/closed state.

- [ ] **Step 5: Commit**

```bash
git add src/components/agent/ src/app/layout.tsx
git commit -m "feat: build floating agent chat UI with message panel"
```

---

### Task 18: Agent Tools and System Prompt

**Files:**
- Create: `src/agent/types.ts`, `src/agent/tools.ts`, `src/agent/system-prompt.ts`

- [ ] **Step 1: Define agent types**

```typescript
// src/agent/types.ts
export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ToolCall {
  name: string
  input: Record<string, unknown>
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}
```

- [ ] **Step 2: Define tool schemas for Claude**

Create `src/agent/tools.ts` with all tool definitions as Claude API tool schemas. Each tool needs: `name`, `description`, `input_schema` (JSON Schema).

Tools to define (from the design doc):
- `navigate_to` — input: `{ page: string }`
- `list_contacts` — input: `{ status?: string, owner?: string, company?: string }`
- `get_contact` — input: `{ id: string }`
- `create_contact` — input: `{ firstName, lastName, email, phone?, title?, companyId?, status?, owner?, notes? }`
- `update_contact` — input: `{ id: string, data: Partial<Contact> }`
- `delete_contact` — input: `{ id: string }`
- `bulk_update_contacts` — input: `{ ids: string[], data: Partial<Contact> }`
- `list_companies` — input: `{ industry?: string }`
- `get_company` — input: `{ id: string }`
- `create_company` — input: `{ name, industry?, size?, website?, address?, notes? }`
- `update_company` — input: `{ id: string, data: Partial<Company> }`
- `list_deals` — input: `{ stage?: string, owner?: string, minValue?: number, maxValue?: number }`
- `get_deal` — input: `{ id: string }`
- `create_deal` — input: `{ name, companyId?, contactIds?, value, stage, owner, closeDate?, probability?, notes? }`
- `update_deal` — input: `{ id: string, data: Partial<Deal> }`
- `move_deal_stage` — input: `{ id: string, stage: DealStage }`
- `list_tasks` — input: `{ assignee?: string, priority?: string, status?: string }`
- `get_task` — input: `{ id: string }`
- `create_task` — input: `{ name, assignee, priority?, dueDate?, linkedDealId?, linkedContactId?, notes? }`
- `update_task` — input: `{ id: string, data: Partial<Task> }`
- `complete_task` — input: `{ id: string }`
- `list_emails` — input: `{}`
- `get_email_thread` — input: `{ id: string }`
- `send_email` — input: `{ to: string, subject: string, body: string, linkedContactId?, linkedDealId? }`
- `reply_to_email` — input: `{ threadId: string, body: string }`
- `list_reports` — input: `{}`
- `generate_report` — input: `{ name, type, chartType?, dateRange?, filters? }`
- `get_settings` — input: `{}`
- `update_settings` — input: `{ notifications?: Partial<Settings['notifications']>, integrations?: Partial<Settings['integrations']> }`
- `invite_team_member` — input: `{ name: string, email: string, role: string }`
- `onboard_client` — input: `{ companyName, contactFirstName, contactLastName, contactEmail, contactTitle?, dealValue, dealStage?, taskNames? }`
- `search_crm` — input: `{ query: string }` (searches across all entities by name/email)

- [ ] **Step 3: Write the system prompt**

```typescript
// src/agent/system-prompt.ts
export function getSystemPrompt(context: { teamMembers: string[], currentPage: string }): string {
  return `You are Auxos, an AI assistant embedded in a CRM application. You help users manage their contacts, companies, deals, tasks, emails, and reports through natural language.

## Context
- Current page: ${context.currentPage}
- Team members: ${context.teamMembers.join(', ')}

## Behavior Guidelines
- Be conversational and helpful, not robotic
- When you perform actions, describe what you did clearly
- If a request is ambiguous, ask for clarification
- When creating entities, confirm the details
- For multi-step workflows, execute all steps and summarize what was done
- When listing items, format them clearly
- Use the team member's full name when referring to them
- When the user says "me" or "my", assume they are the first team member (Sarah Chen)

## Important
- All data operations happen immediately - there's no need to "save"
- You can chain multiple tool calls to accomplish complex tasks
- When a user refers to an entity by name (not ID), search for it first using the search or list tools
- Provide entity IDs are internal - always refer to entities by their names when talking to the user`
}
```

- [ ] **Step 4: Commit**

```bash
git add src/agent/
git commit -m "feat: define agent tool schemas and system prompt"
```

---

### Task 19: Agent Tool Executor

**Files:**
- Create: `src/agent/executor.ts`

- [ ] **Step 1: Build the tool executor**

The executor maps tool call names to Zustand store operations. It's a client-side module that takes a tool call and the store, executes the action, and returns a result.

```typescript
// src/agent/executor.ts
import { CrmStore } from '@/store'
import { ToolResult } from './types'

export function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  store: CrmStore
): ToolResult {
  switch (toolName) {
    case 'navigate_to': {
      // Return navigation instruction (handled by the panel component)
      return { success: true, data: { navigate: input.page } }
    }
    case 'list_contacts': {
      let contacts = store.contacts
      if (input.status) contacts = contacts.filter(c => c.status === input.status)
      if (input.owner) contacts = contacts.filter(c => c.owner === input.owner)
      if (input.company) {
        const company = store.companies.find(co => co.name.toLowerCase().includes((input.company as string).toLowerCase()))
        if (company) contacts = contacts.filter(c => c.companyId === company.id)
      }
      return { success: true, data: contacts.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email, company: store.companies.find(co => co.id === c.companyId)?.name, status: c.status, owner: c.owner })) }
    }
    case 'get_contact': {
      const contact = store.contacts.find(c => c.id === input.id)
      if (!contact) return { success: false, error: 'Contact not found' }
      return { success: true, data: { ...contact, companyName: store.companies.find(co => co.id === contact.companyId)?.name } }
    }
    case 'create_contact': {
      const contact = store.addContact({
        firstName: input.firstName as string,
        lastName: input.lastName as string,
        email: input.email as string,
        phone: (input.phone as string) || '',
        title: (input.title as string) || '',
        companyId: (input.companyId as string) || null,
        status: (input.status as any) || 'lead',
        owner: (input.owner as string) || 'Sarah Chen',
        lastContacted: new Date().toISOString(),
        notes: (input.notes as string) || '',
      })
      store.addActivity({ type: 'contact_created', description: `Created contact ${contact.firstName} ${contact.lastName}`, entityType: 'contact', entityId: contact.id, userId: 'sarah-chen' })
      return { success: true, data: { id: contact.id, name: `${contact.firstName} ${contact.lastName}` } }
    }
    // ... implement all other tools following the same pattern
    // Each case: validate input, call store method, add activity entry, return result
    default:
      return { success: false, error: `Unknown tool: ${toolName}` }
  }
}
```

Implement ALL tool cases. Each one:
1. Reads or writes to the store
2. Adds an activity log entry for write operations
3. Returns `{ success: true, data }` or `{ success: false, error }`

For `search_crm`: search across contacts (name, email), companies (name), and deals (name) with case-insensitive matching.

For `onboard_client`: compose multiple store calls — create company, create contact, create deal, create tasks. Return summary of everything created.

- [ ] **Step 2: Commit**

```bash
git add src/agent/executor.ts
git commit -m "feat: implement tool executor mapping tool calls to store actions"
```

---

### Task 20: Agent API Endpoint

**Files:**
- Create: `src/app/api/agent/route.ts`

- [ ] **Step 1: Build the Claude API proxy endpoint**

```typescript
// src/app/api/agent/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { tools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  const { messages, context } = await request.json()

  const systemPrompt = getSystemPrompt(context)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    tools,
    messages,
  })

  return Response.json(response)
}
```

Note: This endpoint receives messages in Claude API format and returns the raw response. The client handles tool execution locally (since tools manipulate client-side Zustand store), then sends tool results back in the next request if needed.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/agent/route.ts
git commit -m "feat: add Claude API proxy endpoint for agent"
```

---

### Task 21: Wire Agent Panel to API with Tool Execution Loop

**Files:**
- Modify: `src/components/agent/AgentPanel.tsx`

- [ ] **Step 1: Implement the agent conversation loop**

Update AgentPanel to implement the full loop:

1. User sends message → add to messages array
2. POST messages to `/api/agent` with CRM context (current page, team members)
3. If response contains `tool_use` blocks:
   a. Execute each tool call via `executeTool()` using the store
   b. If any tool returns `{ navigate: page }`, call `router.push(page)`
   c. Add the assistant message (with tool_use) and tool_result messages to the conversation
   d. POST again to get the assistant's text response
4. When response has a final text block with `stop_reason: 'end_turn'`, display the text

Handle the multi-turn tool loop (assistant may call multiple tools or chain calls).

Show loading state while waiting for API response. Stream final text response for better UX (or display all at once for simplicity in v1).

- [ ] **Step 2: Commit**

```bash
git add src/components/agent/AgentPanel.tsx
git commit -m "feat: wire agent panel to API with tool execution loop"
```

---

## Phase 4: Polish

### Task 22: Toast Notifications

**Files:**
- Create or modify: `src/components/ui/toaster.tsx` (if not already from shadcn)
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Set up toast provider**

Add `<Toaster />` to the root layout. Ensure all form submissions and store mutations show a toast notification:
- "Contact created successfully"
- "Deal moved to Negotiation"
- "Task completed"
- etc.

This may require adding `toast()` calls throughout the form components built in Phase 2.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add toast notifications for all CRM actions"
```

---

### Task 23: Loading States and Aria Labels

**Files:**
- Modify: Various component files

- [ ] **Step 1: Add aria-labels to all interactive elements**

Go through each component and ensure:
- All buttons have descriptive `aria-label` attributes
- All form inputs have associated labels
- Tables have proper `aria-label` on the table element
- Navigation links have `aria-label`
- All interactive elements have `data-entity-type` and `data-entity-id` attributes where applicable (useful for agent interaction)

- [ ] **Step 2: Add loading states**

Add loading skeletons/spinners for:
- Initial page loads (store initialization)
- Agent response waiting
- Form submissions

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add aria labels, data attributes, and loading states"
```

---

### Task 24: Agent Prompt Suggestions and Visual Feedback

**Files:**
- Modify: `src/components/agent/AgentPanel.tsx`

- [ ] **Step 1: Add example prompt suggestions**

When the chat is empty, show clickable suggestion chips:
- "Show me all deals worth over $100k"
- "Create a new contact named Alex Chen at Quantum Labs, VP of Engineering"
- "Move the Meridian Corp deal to Negotiation and create a follow-up task for Friday"
- "Onboard a new client: Brightpath Labs, main contact Elena Voss, $120k deal"
- "What does my pipeline look like this quarter?"
- "Reassign all of Priya's tasks to Marcus"
- "Generate a revenue report for Q1"

Clicking a suggestion fills the input and submits.

- [ ] **Step 2: Add visual feedback for agent actions**

When the agent executes a tool that modifies data, briefly flash/pulse the relevant section of the UI. This can be done with a CSS animation class applied via a global state variable:
- Store an `agentHighlight: { entityType, entityId } | null` in Zustand
- Components check if their entity matches and apply a `ring-2 ring-blue-400 animate-pulse` class briefly
- Clear the highlight after 2 seconds

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add agent prompt suggestions and visual feedback for actions"
```

---

### Task 25: Final Integration Test and README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Manual integration test**

Run `npm run dev` and test all flows:
- Navigate to each page, verify data renders
- Create a contact, company, deal, task via forms
- Send and reply to emails
- Create a custom report
- Change settings
- Open the agent and test the example prompts
- Verify agent can create entities, navigate, search

Fix any bugs found.

- [ ] **Step 2: Update README**

```markdown
# Auxos CRM Demo

A complex CRM web application with an embedded AI agent (Auxos) that lets users perform any action through natural language.

## Setup

\`\`\`bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
\`\`\`

Open http://localhost:3000

## Demo Script

1. Browse the CRM — click through Dashboard, Contacts, Companies, Deals, Tasks, Emails, Reports, Settings
2. Click the Auxos chat button (bottom-right corner)
3. Try these prompts:
   - "Show me all deals worth over $100k"
   - "Create a new contact named Alex Chen at Quantum Labs, he's a VP of Engineering"
   - "Move the Meridian Corp deal to Negotiation and create a follow-up task for Friday"
   - "Onboard a new client: Brightpath Labs, main contact Elena Voss, $120k deal"
   - "What does my pipeline look like this quarter?"
   - "Reassign all of Priya's tasks to Marcus"
   - "Generate a revenue report for Q1"

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- Recharts (charts)
- Claude API (AI agent)
- @dnd-kit (drag and drop)
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: update README with setup instructions and demo script"
```
