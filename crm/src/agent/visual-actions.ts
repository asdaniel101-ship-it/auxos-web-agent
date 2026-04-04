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

/**
 * Map tool name to the sidebar nav page it belongs to.
 * Returns null if no mapping exists.
 */
function toolNavPage(toolName: string): string | null {
  const map: Record<string, string> = {
    list_contacts: 'Contacts',
    get_contact: 'Contacts',
    update_contact: 'Contacts',
    delete_contact: 'Contacts',
    bulk_update_contacts: 'Contacts',
    list_companies: 'Companies',
    get_company: 'Companies',
    update_company: 'Companies',
    list_deals: 'Deals',
    update_deal: 'Deals',
    move_deal_stage: 'Deals',
    list_tasks: 'Tasks',
    get_task: 'Tasks',
    update_task: 'Tasks',
    complete_task: 'Tasks',
    list_emails: 'Emails',
    get_email_thread: 'Emails',
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

/**
 * Queue visual cursor actions for a tool execution.
 * Returns a Promise that resolves when the animation completes.
 * The caller should AWAIT this before mutating data.
 */
function selectOption(triggerSelector: string, valueId: string): Step[] {
  return [
    { type: 'click', selector: triggerSelector },
    { type: 'wait', delay: 400 },
    { type: 'click', selector: `[role="option"][data-value="${valueId}"]` },
    { type: 'wait', delay: 300 },
  ]
}

function emailComposeSteps(input: Record<string, unknown>): Step[] {
  const steps: Step[] = [
    { type: 'click', selector: 'button[aria-label="Compose new email"]' },
    { type: 'wait', delay: 600 },
    { type: 'type', selector: 'input[aria-label="Recipient email address"]', text: (input.to as string) || '' },
    { type: 'type', selector: 'input[aria-label="Email subject"]', text: (input.subject as string) || '' },
    { type: 'type', selector: 'textarea[aria-label="Email body"]', text: (input.body as string) || '' },
  ]

  if (input.linkedContactId) {
    steps.push(...selectOption('button[aria-label="Link to contact"]', input.linkedContactId as string))
  }
  if (input.linkedDealId) {
    steps.push(...selectOption('button[aria-label="Link to deal"]', input.linkedDealId as string))
  }

  steps.push({ type: 'wait', delay: 400 })
  return steps
}

function navClick(page: string) {
  return [
    { type: 'click' as const, selector: `a[aria-label="Navigate to ${page}"]` },
    { type: 'wait' as const, delay: 600 },
  ]
}

/** Navigate to a page (if needed) then scroll to and click an entity row. */
function navigateToEntityRow(page: string, entityId: string): Promise<void> | null {
  if (isViewingEntity(page, entityId)) return Promise.resolve()
  const selector = entityRowSelector(page, entityId)
  if (!selector) return null
  const nav = isOnPage(page) ? [] : navClick(page)
  return queueAgentSteps([
    ...nav,
    { type: 'wait', delay: 500 },
    { type: 'scroll-to', selector },
    { type: 'wait', delay: 400 },
    { type: 'click', selector },
  ])
}

export function queueVisualAction(toolName: string, input: Record<string, unknown>): Promise<void> {
  switch (toolName) {
    case 'send_email':
      return queueAgentSteps([
        ...navClick('Emails'),
        ...emailComposeSteps(input),
        { type: 'click', selector: 'button[aria-label="Send email"]' },
        { type: 'wait', delay: 500 },
      ])

    case 'create_contact':
      return queueAgentSteps([
        ...navClick('Contacts'),
        { type: 'click', selector: 'button[aria-label="Add new contact"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#cf-firstName', text: (input.firstName as string) || '' },
        { type: 'type', selector: '#cf-lastName', text: (input.lastName as string) || '' },
        { type: 'type', selector: '#cf-email', text: (input.email as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'create_company':
      return queueAgentSteps([
        ...navClick('Companies'),
        { type: 'click', selector: 'button[aria-label="Add new company"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#cf-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'create_deal':
      return queueAgentSteps([
        ...navClick('Deals'),
        { type: 'click', selector: 'button[aria-label="Add new deal"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#df-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'create_task':
      return queueAgentSteps([
        ...navClick('Tasks'),
        { type: 'click', selector: 'button[aria-label="Add new task"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#tf-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'onboard_client':
      return queueAgentSteps([
        ...navClick('Companies'),
        { type: 'click', selector: 'button[aria-label="Add new company"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cf-name', text: (input.companyName as string) || '' },
        { type: 'wait', delay: 300 },
        ...navClick('Contacts'),
        { type: 'click', selector: 'button[aria-label="Add new contact"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cf-firstName', text: (input.contactFirstName as string) || '' },
        { type: 'type', selector: '#cf-lastName', text: (input.contactLastName as string) || '' },
        { type: 'type', selector: '#cf-email', text: (input.contactEmail as string) || '' },
        { type: 'wait', delay: 300 },
        ...navClick('Deals'),
        { type: 'click', selector: 'button[aria-label="Add new deal"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#df-name', text: (input.dealName as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'complete_task':
      return queueAgentSteps([
        ...navClick('Tasks'),
        { type: 'click', selector: `[data-task-id="${input.id}"] button[role="checkbox"]` },
        { type: 'wait', delay: 400 },
      ])

    case 'move_deal_stage':
      return queueAgentSteps([
        ...navClick('Deals'),
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

    case 'draft_email':
      return queueAgentSteps([
        ...navClick('Emails'),
        ...emailComposeSteps(input),
      ])

    case 'navigate_to': {
      const page = capitalize(input.page as string)
      if (input.entityId) {
        return navigateToEntityRow(page, input.entityId as string) ?? Promise.resolve()
      }
      if (isOnPage(page)) return Promise.resolve()
      return queueAgentSteps(navClick(page))
    }

    default: {
      const page = toolNavPage(toolName)
      if (page && !isOnPage(page)) {
        return queueAgentSteps(navClick(page))
      }
      return Promise.resolve()
    }
  }
}
