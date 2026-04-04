import { queueAgentSteps } from '@/components/agent/AgentCursor'

type Step = { type: 'move' | 'click' | 'scroll-to'; selector: string }
  | { type: 'type'; selector: string; text: string }
  | { type: 'wait'; delay: number }
  | { type: 'dismiss' }

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const entityAttr: Record<string, string> = {
  Deals: 'data-deal-id',
  Contacts: 'data-contact-id',
  Companies: 'data-company-id',
  Tasks: 'data-task-id',
}

function entityRowSelector(page: string, entityId: string): string {
  const attr = entityAttr[page]
  return attr ? `tr[${attr}="${entityId}"]` : ''
}

function isOnPage(page: string): boolean {
  return window.location.pathname.startsWith(`/${page.toLowerCase()}`)
}

function isViewingEntity(page: string, entityId: string): boolean {
  return window.location.pathname === `/${page.toLowerCase()}/${entityId}`
}

function toolNavPage(toolName: string): string | null {
  const map: Record<string, string> = {
    list_contacts: 'Contacts',
    get_contact: 'Contacts',
    create_contact: 'Contacts',
    update_contact: 'Contacts',
    delete_contact: 'Contacts',
    bulk_update_contacts: 'Contacts',
    list_companies: 'Companies',
    get_company: 'Companies',
    create_company: 'Companies',
    update_company: 'Companies',
    list_deals: 'Deals',
    create_deal: 'Deals',
    update_deal: 'Deals',
    move_deal_stage: 'Deals',
    list_tasks: 'Tasks',
    get_task: 'Tasks',
    create_task: 'Tasks',
    update_task: 'Tasks',
    complete_task: 'Tasks',
    list_emails: 'Emails',
    get_email_thread: 'Emails',
    send_email: 'Emails',
    reply_to_email: 'Emails',
    list_reports: 'Reports',
    generate_report: 'Reports',
    get_settings: 'Settings',
    update_settings: 'Settings',
    invite_team_member: 'Settings',
    onboard_client: 'Dashboard',
  }
  return map[toolName] ?? null
}

// ─── Reusable step builders ───

function navTo(page: string): Step[] {
  if (isOnPage(page)) return []
  return [
    { type: 'click', selector: `a[aria-label="Navigate to ${page}"]` },
    { type: 'wait', delay: 600 },
  ]
}

function advanceWizard(times: number): Step[] {
  const steps: Step[] = []
  for (let i = 0; i < times; i++) {
    steps.push(
      { type: 'click', selector: 'button[aria-label="Go to next step"]' },
      { type: 'wait', delay: 400 },
    )
  }
  return steps
}

/** Navigate to a page (if needed) then scroll to and click an entity row. */
function navigateToEntityRow(page: string, entityId: string): Promise<void> | null {
  if (isViewingEntity(page, entityId)) return Promise.resolve()
  const selector = entityRowSelector(page, entityId)
  if (!selector) return null
  return queueAgentSteps([
    ...navTo(page),
    { type: 'wait', delay: 500 },
    { type: 'scroll-to', selector },
    { type: 'wait', delay: 400 },
    { type: 'click', selector },
  ])
}

// ─── Per-tool visual flows ───

function createContactSteps(input: Record<string, unknown>): Step[] {
  const firstName = (input.firstName as string) || ''
  const lastName = (input.lastName as string) || ''
  const email = (input.email as string) || ''
  const phone = (input.phone as string) || ''
  const title = (input.title as string) || ''

  return [
    // Navigate to Contacts
    ...navTo('Contacts'),
    // Open form
    { type: 'click', selector: 'button[aria-label="Add new contact"]' },
    { type: 'wait', delay: 600 },
    // Step 0: Basic Info
    { type: 'type', selector: '#cf-firstName', text: firstName },
    { type: 'type', selector: '#cf-lastName', text: lastName },
    { type: 'type', selector: '#cf-email', text: email },
    ...(phone ? [{ type: 'type' as const, selector: '#cf-phone', text: phone }] : []),
    ...(title ? [{ type: 'type' as const, selector: '#cf-title', text: title }] : []),
    // Advance through Steps 1 (Company), 2 (Notes), 3 (Assign)
    ...advanceWizard(3),
    // Submit
    { type: 'click', selector: 'button[aria-label="Submit contact form"]' },
    { type: 'wait', delay: 600 },
  ]
}

function createCompanySteps(input: Record<string, unknown>): Step[] {
  const name = (input.name as string) || ''

  return [
    ...navTo('Companies'),
    { type: 'click', selector: 'button[aria-label="Add new company"]' },
    { type: 'wait', delay: 600 },
    { type: 'type', selector: '#cf-name', text: name },
    { type: 'wait', delay: 300 },
    { type: 'click', selector: 'button[aria-label="Create company"]' },
    { type: 'wait', delay: 600 },
  ]
}

function createDealSteps(input: Record<string, unknown>): Step[] {
  const name = (input.name as string) || ''
  const value = String((input.value as number) || 0)

  return [
    ...navTo('Deals'),
    { type: 'click', selector: 'button[aria-label="Add new deal"]' },
    { type: 'wait', delay: 600 },
    // Step 0: Name & Value
    { type: 'type', selector: '#df-name', text: name },
    { type: 'type', selector: '#df-value', text: value },
    // Advance through Steps 1-4 (Company, Contacts, Stage, Owner)
    ...advanceWizard(4),
    // Submit
    { type: 'click', selector: 'button[aria-label="Create deal"]' },
    { type: 'wait', delay: 600 },
  ]
}

function createTaskSteps(input: Record<string, unknown>): Step[] {
  const name = (input.name as string) || ''

  return [
    ...navTo('Tasks'),
    { type: 'click', selector: 'button[aria-label="Add new task"]' },
    { type: 'wait', delay: 600 },
    { type: 'type', selector: '#tf-name', text: name },
    { type: 'wait', delay: 300 },
    { type: 'click', selector: 'button[aria-label="Create task"]' },
    { type: 'wait', delay: 600 },
  ]
}

function sendEmailSteps(input: Record<string, unknown>): Step[] {
  const to = (input.to as string) || ''
  const subject = (input.subject as string) || ''
  const body = (input.body as string) || ''

  return [
    ...navTo('Emails'),
    { type: 'click', selector: 'button[aria-label="Compose new email"]' },
    { type: 'wait', delay: 600 },
    { type: 'type', selector: '#ce-to', text: to },
    { type: 'type', selector: '#ce-subject', text: subject },
    { type: 'type', selector: '#ce-body', text: body },
    { type: 'wait', delay: 400 },
    { type: 'click', selector: 'button[aria-label="Send email"]' },
    { type: 'wait', delay: 500 },
  ]
}

// ─── Main router ───

export function queueVisualAction(toolName: string, input: Record<string, unknown>): Promise<void> {
  switch (toolName) {
    case 'create_contact':
      return queueAgentSteps(createContactSteps(input))

    case 'create_company':
      return queueAgentSteps(createCompanySteps(input))

    case 'create_deal':
      return queueAgentSteps(createDealSteps(input))

    case 'create_task':
      return queueAgentSteps(createTaskSteps(input))

    case 'send_email':
      return queueAgentSteps(sendEmailSteps(input))

    case 'draft_email':
      return queueAgentSteps([
        ...navTo('Emails'),
        { type: 'click', selector: 'button[aria-label="Compose new email"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#ce-to', text: (input.to as string) || '' },
        { type: 'type', selector: '#ce-subject', text: (input.subject as string) || '' },
        { type: 'type', selector: '#ce-body', text: (input.body as string) || '' },
        { type: 'wait', delay: 400 },
        // Don't click Send — this is a draft
      ])

    case 'complete_task':
      return queueAgentSteps([
        ...navTo('Tasks'),
        { type: 'click', selector: `[data-task-id="${input.id}"] button[role="checkbox"]` },
        { type: 'wait', delay: 400 },
      ])

    case 'move_deal_stage':
      return queueAgentSteps([
        ...navTo('Deals'),
        { type: 'move', selector: `[data-deal-id="${input.id}"]` },
        { type: 'wait', delay: 400 },
      ])

    case 'get_deal':
    case 'get_contact':
    case 'get_company':
    case 'get_task': {
      const page = toolNavPage(toolName)!
      return navigateToEntityRow(page, input.id as string) ?? Promise.resolve()
    }

    case 'navigate_to': {
      const page = capitalize(input.page as string)
      if (input.entityId) {
        return navigateToEntityRow(page, input.entityId as string) ?? Promise.resolve()
      }
      if (isOnPage(page)) return Promise.resolve()
      return queueAgentSteps(navTo(page))
    }

    case 'onboard_client': {
      const firstName = (input.contactFirstName as string) || ''
      const lastName = (input.contactLastName as string) || ''
      const email = (input.contactEmail as string) || ''
      const companyName = (input.companyName as string) || ''
      const dealValue = String((input.dealValue as number) || 0)
      const taskName = `Follow up with ${firstName} ${lastName}`
      const emailSubject = `Welcome aboard, ${firstName} ${lastName}!`
      const emailBody = `Hi ${firstName},\n\nThank you for choosing to work with us! We're excited to get started on the ${companyName} partnership.\n\nI'll be your main point of contact. Let's schedule a kickoff call this week to align on next steps.\n\nBest regards`

      return queueAgentSteps([
        // 1. Create company
        ...createCompanySteps({ name: companyName }),
        // 2. Create contact
        ...createContactSteps({ firstName, lastName, email }),
        // 3. Create deal
        ...createDealSteps({ name: `${companyName} Deal`, value: dealValue }),
        // 4. Create follow-up task
        ...createTaskSteps({ name: taskName }),
        // 5. Send welcome email
        ...sendEmailSteps({ to: email, subject: emailSubject, body: emailBody }),
      ])
    }

    default: {
      const page = toolNavPage(toolName)
      if (page && !isOnPage(page)) {
        return queueAgentSteps(navTo(page))
      }
      return Promise.resolve()
    }
  }
}
