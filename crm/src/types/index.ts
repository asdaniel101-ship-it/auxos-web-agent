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
  type: 'contact_created' | 'contact_updated' | 'contact_deleted' | 'deal_created' | 'deal_updated' | 'deal_stage_changed' | 'company_created' | 'company_updated' | 'task_created' | 'task_updated' | 'task_completed' | 'email_sent' | 'note_added' | 'report_generated'
  description: string
  entityType: 'contact' | 'company' | 'deal' | 'task' | 'email' | 'report'
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
