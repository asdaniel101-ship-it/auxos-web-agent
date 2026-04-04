import { subDays, addDays, format, subMonths } from 'date-fns'
import type {
  TeamMember,
  Company,
  Contact,
  Deal,
  Task,
  EmailThread,
  EmailMessage,
  ActivityEntry,
  Report,
  Settings,
} from '@/types'

// ---------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------
function seededRandom(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const copy = [...arr]
  const result: T[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function isoDate(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm:ss'Z'")
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function idFor(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, '0')}`
}

// ---------------------------------------------------------------------------
// Static lookup tables
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Jamie', 'Morgan', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Drew', 'Reese', 'Skyler', 'Harper', 'Peyton', 'Kendall', 'Logan',
  'Cameron', 'Sydney', 'Alex', 'Devon', 'Rowan', 'Finley', 'Emerson', 'Sage',
  'River', 'Parker', 'Elliot', 'Remy',
]

const LAST_NAMES = [
  'Torres', 'Nguyen', 'Kim', 'Patel', 'Williams', 'Brown', 'Martinez', 'Garcia',
  'Lee', 'Wilson', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young',
  'Scott', 'Adams', 'Nelson', 'Baker',
]

const TITLES = [
  'CEO', 'CTO', 'VP of Sales', 'Head of Product', 'VP of Engineering',
  'Director of Marketing', 'Head of Operations', 'CFO', 'VP of Business Development',
  'Product Manager', 'Engineering Manager', 'Sales Manager', 'Marketing Director',
  'Operations Manager', 'Procurement Manager',
]

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Energy', 'Media', 'Consulting', 'Education', 'Logistics',
]

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

const COMPANY_NAMES = [
  'Meridian Corp', 'Northwind Industries', 'Brightpath Labs', 'Quantum Dynamics',
  'Atlas Ventures', 'Pinnacle Systems', 'Horizon Digital', 'Vertex Solutions',
  'Nova Analytics', 'Summit Partners', 'Cascade AI', 'Evergreen Tech',
  'Sapphire Data', 'TerraFirma Inc', 'Ironclad Security',
]

const CITIES = [
  'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL', 'Seattle, WA',
  'Boston, MA', 'Denver, CO', 'Atlanta, GA', 'Los Angeles, CA', 'Nashville, TN',
  'Miami, FL', 'Portland, OR', 'Phoenix, AZ', 'Minneapolis, MN', 'Dallas, TX',
]

const DEAL_TYPES = [
  'Enterprise License', 'Platform Upgrade', 'Annual Contract', 'Consulting Engagement',
  'Implementation', 'Expansion Deal', 'Renewal', 'Partnership Agreement',
]

const DEAL_STAGES: Deal['stage'][] = [
  'Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost',
]

const STAGE_PROBABILITY: Record<Deal['stage'], number> = {
  Prospecting: 10,
  Qualification: 25,
  Proposal: 50,
  Negotiation: 75,
  'Closed Won': 100,
  'Closed Lost': 0,
}

// Weighted stages: more deals in early stages
const STAGE_WEIGHTS = [
  ...Array(8).fill('Prospecting'),
  ...Array(6).fill('Qualification'),
  ...Array(4).fill('Proposal'),
  ...Array(3).fill('Negotiation'),
  ...Array(2).fill('Closed Won'),
  ...Array(2).fill('Closed Lost'),
] as Deal['stage'][]

const CONTACT_STATUSES: Contact['status'][] = ['lead', 'prospect', 'customer', 'churned']
const STATUS_WEIGHTS: Contact['status'][] = [
  ...Array(15).fill('lead'),
  ...Array(15).fill('prospect'),
  ...Array(15).fill('customer'),
  ...Array(5).fill('churned'),
] as Contact['status'][]

const TASK_PRIORITIES: Task['priority'][] = ['low', 'medium', 'high', 'urgent']
const TASK_STATUSES: Task['status'][] = ['todo', 'in-progress', 'done']
const TASK_STATUS_WEIGHTS: Task['status'][] = [
  ...Array(4).fill('todo'),
  ...Array(3).fill('in-progress'),
  ...Array(3).fill('done'),
] as Task['status'][]

const EMAIL_SUBJECTS = [
  'Re: Q1 Proposal Review',
  'Meeting Follow-up',
  'Contract Terms Discussion',
  'Product Demo Request',
  'Partnership Opportunity',
  'Quarterly Business Review',
  'Re: Pricing Discussion',
  'Action Items from Today\'s Call',
  'Next Steps',
  'Introduction - {company}',
  'Invoice #',
]

const ACTIVITY_TYPES: ActivityEntry['type'][] = [
  'contact_created', 'deal_created', 'company_created', 'task_created',
  'deal_stage_changed', 'task_completed', 'email_sent',
  'contact_updated', 'deal_updated', 'note_added',
]

const REPORT_NOTES_BODIES = [
  'Great conversation, very interested in Q2 expansion.',
  'Requested a follow-up call next week.',
  'Currently evaluating competitors.',
  'Warm lead from the Austin conference.',
  'Needs security review before signing.',
  'Budget approved for this fiscal year.',
  'Escalated to VP for final sign-off.',
  'Interested in professional services add-on.',
]

// ---------------------------------------------------------------------------
// Export types
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------
export function generateSeedData(): SeedData {
  const rng = seededRandom('auxos-crm-seed-v1')
  const TODAY = new Date('2026-04-02T12:00:00Z')

  // -------------------------------------------------------------------------
  // Team Members
  // -------------------------------------------------------------------------
  const teamMembers: TeamMember[] = [
    { id: 'tm-001', name: 'Sarah Chen',     email: 'sarah.chen@company.com',     role: 'admin',   avatar: 'SC' },
    { id: 'tm-002', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', role: 'manager', avatar: 'MJ' },
    { id: 'tm-003', name: 'Priya Patel',    email: 'priya.patel@company.com',    role: 'member',  avatar: 'PP' },
    { id: 'tm-004', name: 'Alex Rivera',    email: 'alex.rivera@company.com',    role: 'member',  avatar: 'AR' },
  ]
  const teamNames = teamMembers.map(t => t.name)

  // -------------------------------------------------------------------------
  // Companies
  // -------------------------------------------------------------------------
  const companies: Company[] = COMPANY_NAMES.map((name, i) => {
    const revenue = Math.round((randInt(rng, 1, 500) * 1_000_000) / 100_000) * 100_000
    return {
      id: idFor('co', i),
      name,
      industry: pick(rng, INDUSTRIES),
      size: pick(rng, SIZES),
      revenue,
      website: `https://www.${slugify(name)}.com`,
      address: `${randInt(rng, 100, 9999)} ${pick(rng, ['Main St', 'Market Ave', 'Innovation Dr', 'Tech Blvd', 'Commerce Way'])}, ${CITIES[i % CITIES.length]}`,
      createdAt: isoDate(subDays(TODAY, randInt(rng, 90, 365))),
      notes: pick(rng, REPORT_NOTES_BODIES),
    }
  })

  // -------------------------------------------------------------------------
  // Contacts (50)
  // -------------------------------------------------------------------------
  const contacts: Contact[] = []
  // Keep track of which contacts belong to which company for later linking
  const contactsByCompany: Record<string, string[]> = {}

  // Assign company indices to contacts: 3-4 per company, a few null
  const companyAssignments: (string | null)[] = []
  companies.forEach(co => {
    const count = pick(rng, [3, 3, 4]) as number
    for (let c = 0; c < count; c++) {
      companyAssignments.push(co.id)
    }
  })
  // Trim or pad to 50
  while (companyAssignments.length < 50) companyAssignments.push(null)
  const companyIds50 = companyAssignments.slice(0, 50)

  // Shuffle deterministically
  for (let i = companyIds50.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [companyIds50[i], companyIds50[j]] = [companyIds50[j], companyIds50[i]]
  }

  // Build a pool of unique full names (50)
  const usedNames = new Set<string>()
  const namePool: { first: string; last: string }[] = []
  let attempts = 0
  while (namePool.length < 50 && attempts < 10000) {
    attempts++
    const first = pick(rng, FIRST_NAMES)
    const last = pick(rng, LAST_NAMES)
    const key = `${first} ${last}`
    if (!usedNames.has(key)) {
      usedNames.add(key)
      namePool.push({ first, last })
    }
  }

  for (let i = 0; i < 50; i++) {
    const { first, last } = namePool[i]
    const companyId = companyIds50[i]
    const company = companyId ? companies.find(c => c.id === companyId) : null
    const emailDomain = company ? `${slugify(company.name)}.com` : 'gmail.com'
    const contactId = idFor('ct', i)

    if (companyId) {
      if (!contactsByCompany[companyId]) contactsByCompany[companyId] = []
      contactsByCompany[companyId].push(contactId)
    }

    contacts.push({
      id: contactId,
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${emailDomain}`,
      phone: `555-${String(randInt(rng, 100, 999))}-${String(randInt(rng, 1000, 9999))}`,
      companyId,
      status: pick(rng, STATUS_WEIGHTS),
      owner: pick(rng, teamNames),
      title: pick(rng, TITLES),
      lastContacted: isoDate(subDays(TODAY, randInt(rng, 0, 30))),
      createdAt: isoDate(subDays(TODAY, randInt(rng, 30, 180))),
      notes: pick(rng, REPORT_NOTES_BODIES),
    })
  }

  // -------------------------------------------------------------------------
  // Deals (25)
  // -------------------------------------------------------------------------
  const deals: Deal[] = []
  for (let i = 0; i < 25; i++) {
    const company = companies[i % companies.length]
    const dealType = pick(rng, DEAL_TYPES)
    const stage = pick(rng, STAGE_WEIGHTS)
    const probability = STAGE_PROBABILITY[stage]
    // Close dates: last 3 months to next 3 months
    const offsetDays = randInt(rng, -90, 90)
    const closeDate = offsetDays >= 0
      ? addDays(TODAY, offsetDays)
      : subDays(TODAY, -offsetDays)

    // Link 1-3 contacts from same company
    const companyContacts = contactsByCompany[company.id] ?? []
    const linkCount = Math.min(randInt(rng, 1, 3), companyContacts.length)
    const linkedContacts = linkCount > 0 ? pickN(rng, companyContacts, linkCount) : []

    const value = Math.round(randInt(rng, 5, 500) * 1000)

    deals.push({
      id: idFor('dl', i),
      name: `${company.name} - ${dealType}`,
      companyId: company.id,
      contactIds: linkedContacts,
      value,
      stage,
      probability,
      owner: pick(rng, teamNames),
      closeDate: isoDate(closeDate),
      createdAt: isoDate(subDays(TODAY, randInt(rng, 1, 120))),
      notes: pick(rng, REPORT_NOTES_BODIES),
    })
  }

  // -------------------------------------------------------------------------
  // Tasks (40)
  // -------------------------------------------------------------------------
  const tasks: Task[] = []
  const taskTemplates = [
    (cn: string) => `Follow up with ${cn}`,
    (_cn: string, co: string) => `Prepare proposal for ${co}`,
    (cn: string) => `Schedule demo with ${cn}`,
    (_cn: string, co: string) => `Review contract for ${co}`,
    (cn: string) => `Send pricing to ${cn}`,
    (_cn: string, co: string) => `Update CRM notes for ${co}`,
    (cn: string) => `Quarterly review with ${cn}`,
    (cn: string) => `Onboarding call with ${cn}`,
  ]

  for (let i = 0; i < 40; i++) {
    const contact = contacts[i % contacts.length]
    const contactName = `${contact.firstName} ${contact.lastName}`
    const company = contact.companyId
      ? (companies.find(c => c.id === contact.companyId)?.name ?? 'Unknown')
      : companies[i % companies.length].name
    const templateFn = pick(rng, taskTemplates)
    const taskName = templateFn(contactName, company)
    const offsetDays = randInt(rng, -7, 14)
    const dueDate = offsetDays >= 0 ? addDays(TODAY, offsetDays) : subDays(TODAY, -offsetDays)

    // Optionally link to a deal
    const linkedDealId = rng() > 0.5 ? deals[i % deals.length].id : null
    const linkedContactId = rng() > 0.4 ? contact.id : null

    tasks.push({
      id: idFor('tk', i),
      name: taskName,
      assignee: pick(rng, teamNames),
      dueDate: isoDate(dueDate),
      priority: pick(rng, TASK_PRIORITIES),
      status: pick(rng, TASK_STATUS_WEIGHTS),
      linkedDealId,
      linkedContactId,
      createdAt: isoDate(subDays(TODAY, randInt(rng, 1, 30))),
      notes: pick(rng, REPORT_NOTES_BODIES),
    })
  }

  // -------------------------------------------------------------------------
  // Email Threads (30)
  // -------------------------------------------------------------------------
  const emailThreads: EmailThread[] = []
  const teamEmails = teamMembers.map(t => t.email)

  for (let i = 0; i < 30; i++) {
    const contact = contacts[i % contacts.length]
    const contactEmail = contact.email
    const contactName = `${contact.firstName} ${contact.lastName}`
    const company = contact.companyId
      ? (companies.find(c => c.id === contact.companyId)?.name ?? 'Acme')
      : companies[i % companies.length].name

    let subjectTemplate = pick(rng, EMAIL_SUBJECTS)
    const subject = subjectTemplate
      .replace('{company}', company)
      .replace('#', `#${1000 + i}`)

    const threadStart = subDays(TODAY, randInt(rng, 0, 14))
    const numMessages = randInt(rng, 2, 5)
    const messages: EmailMessage[] = []
    const teamMember = teamMembers[i % teamMembers.length]

    for (let m = 0; m < numMessages; m++) {
      const isTeamFirst = m === 0 ? rng() > 0.5 : undefined
      const fromTeam = m === 0 ? !!isTeamFirst : m % 2 === (messages[0].from === teamMember.email ? 0 : 1)
      const fromEmail = fromTeam ? teamMember.email : contactEmail
      const toEmail = fromTeam ? contactEmail : teamMember.email
      const msgTime = addDays(threadStart, m)

      const bodies = [
        `Hi ${fromTeam ? contactName : teamMember.name}, just following up on our last conversation regarding ${subject}.`,
        `Thanks for your message. I'll review the details and get back to you shortly.`,
        `Could we schedule a call this week to discuss further? I have availability Tuesday or Thursday.`,
        `Sounds great — let me loop in my colleague and we can align on next steps.`,
        `Please find the updated documentation attached. Let me know if you have any questions.`,
      ]

      messages.push({
        id: `em-${String(i + 1).padStart(3, '0')}-${m + 1}`,
        from: fromEmail,
        to: toEmail,
        body: bodies[m % bodies.length],
        timestamp: isoDate(msgTime),
      })
    }

    const linkedContactId = rng() > 0.3 ? contact.id : null
    const linkedDealId = rng() > 0.5 ? deals[i % deals.length].id : null

    emailThreads.push({
      id: idFor('et', i),
      subject,
      participants: [teamMember.email, contactEmail],
      messages,
      linkedContactId,
      linkedDealId,
      createdAt: isoDate(threadStart),
    })
  }

  // -------------------------------------------------------------------------
  // Activities (100+)
  // -------------------------------------------------------------------------
  const activities: ActivityEntry[] = []

  // Helper to push an activity
  function pushActivity(
    index: number,
    type: ActivityEntry['type'],
    description: string,
    entityType: ActivityEntry['entityType'],
    entityId: string,
    userId: string,
    daysAgo: number,
  ) {
    activities.push({
      id: idFor('ac', index),
      type,
      description,
      entityType,
      entityId,
      userId,
      timestamp: isoDate(subDays(TODAY, daysAgo)),
    })
  }

  let actIdx = 0

  // Company created events (15)
  companies.forEach((co, i) => {
    const member = teamMembers[i % teamMembers.length]
    pushActivity(actIdx++, 'company_created', `${member.name} created company ${co.name}`, 'company', co.id, member.id, randInt(rng, 1, 30))
  })

  // Contact created events (50)
  contacts.forEach((ct, i) => {
    const member = pick(rng, teamMembers)
    pushActivity(actIdx++, 'contact_created', `${member.name} created contact ${ct.firstName} ${ct.lastName}`, 'contact', ct.id, member.id, randInt(rng, 1, 30))
  })

  // Deal created events (25)
  deals.forEach((dl, i) => {
    const member = pick(rng, teamMembers)
    pushActivity(actIdx++, 'deal_created', `${member.name} created deal ${dl.name}`, 'deal', dl.id, member.id, randInt(rng, 1, 30))
  })

  // Deal stage changed (15)
  for (let i = 0; i < 15; i++) {
    const dl = deals[i % deals.length]
    const member = pick(rng, teamMembers)
    const fromStage = pick(rng, DEAL_STAGES)
    pushActivity(actIdx++, 'deal_stage_changed', `${member.name} moved deal ${dl.name} to ${dl.stage}`, 'deal', dl.id, member.id, randInt(rng, 1, 30))
  }

  // Task created (10)
  for (let i = 0; i < 10; i++) {
    const tk = tasks[i % tasks.length]
    const member = pick(rng, teamMembers)
    pushActivity(actIdx++, 'task_created', `${member.name} created task "${tk.name}"`, 'task', tk.id, member.id, randInt(rng, 1, 30))
  }

  // Task completed (10)
  const doneTasks = tasks.filter(t => t.status === 'done')
  for (let i = 0; i < Math.min(10, doneTasks.length); i++) {
    const tk = doneTasks[i]
    const member = pick(rng, teamMembers)
    pushActivity(actIdx++, 'task_completed', `${member.name} completed task "${tk.name}"`, 'task', tk.id, member.id, randInt(rng, 1, 15))
  }

  // Email sent (10)
  for (let i = 0; i < 10; i++) {
    const et = emailThreads[i % emailThreads.length]
    const member = teamMembers[i % teamMembers.length]
    pushActivity(actIdx++, 'email_sent', `${member.name} sent email "${et.subject}"`, 'email', et.id, member.id, randInt(rng, 1, 14))
  }

  // Contact updated (10)
  for (let i = 0; i < 10; i++) {
    const ct = contacts[(i + 5) % contacts.length]
    const member = pick(rng, teamMembers)
    pushActivity(actIdx++, 'contact_updated', `${member.name} updated contact ${ct.firstName} ${ct.lastName}`, 'contact', ct.id, member.id, randInt(rng, 1, 20))
  }

  // Deal updated (10)
  for (let i = 0; i < 10; i++) {
    const dl = deals[(i + 3) % deals.length]
    const member = pick(rng, teamMembers)
    pushActivity(actIdx++, 'deal_updated', `${member.name} updated deal ${dl.name}`, 'deal', dl.id, member.id, randInt(rng, 1, 20))
  }

  // Note added (10)
  for (let i = 0; i < 10; i++) {
    const ct = contacts[(i + 10) % contacts.length]
    const member = pick(rng, teamMembers)
    pushActivity(actIdx++, 'note_added', `${member.name} added a note to ${ct.firstName} ${ct.lastName}`, 'contact', ct.id, member.id, randInt(rng, 1, 25))
  }

  // Sort descending by timestamp (newest first)
  activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // -------------------------------------------------------------------------
  // Reports (5)
  // -------------------------------------------------------------------------
  const now = TODAY
  const reports: Report[] = [
    {
      id: 'rp-001',
      name: 'Revenue by Month',
      type: 'revenue-by-month',
      chartType: 'line',
      filters: {},
      dateRange: { start: isoDate(subMonths(now, 6)), end: isoDate(now) },
      createdAt: isoDate(subDays(now, 30)),
    },
    {
      id: 'rp-002',
      name: 'Deals by Stage',
      type: 'deals-by-stage',
      chartType: 'bar',
      filters: {},
      dateRange: { start: isoDate(subMonths(now, 3)), end: isoDate(now) },
      createdAt: isoDate(subDays(now, 25)),
    },
    {
      id: 'rp-003',
      name: 'Contacts by Source',
      type: 'contacts-by-source',
      chartType: 'pie',
      filters: {},
      dateRange: { start: isoDate(subMonths(now, 3)), end: isoDate(now) },
      createdAt: isoDate(subDays(now, 20)),
    },
    {
      id: 'rp-004',
      name: 'Tasks by Owner',
      type: 'tasks-by-owner',
      chartType: 'bar',
      filters: {},
      dateRange: { start: isoDate(subMonths(now, 1)), end: isoDate(now) },
      createdAt: isoDate(subDays(now, 15)),
    },
    {
      id: 'rp-005',
      name: 'Pipeline Forecast',
      type: 'pipeline-forecast',
      chartType: 'bar',
      filters: {},
      dateRange: { start: isoDate(now), end: isoDate(addDays(now, 90)) },
      createdAt: isoDate(subDays(now, 10)),
    },
  ]

  // -------------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------------
  const settings: Settings = {
    notifications: { email: true, inApp: true, dailyDigest: false },
    integrations: { slack: false, gmail: false, calendar: false },
  }

  return {
    teamMembers,
    companies,
    contacts,
    deals,
    tasks,
    emailThreads,
    activities,
    reports,
    settings,
  }
}
