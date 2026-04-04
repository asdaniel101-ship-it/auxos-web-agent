import { queueAgentSteps } from '@/components/agent/AgentCursor'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Queue visual cursor actions for a tool execution.
 * Returns a Promise that resolves when the animation completes.
 * The caller should AWAIT this before mutating data.
 */
export function queueVisualAction(toolName: string, input: Record<string, unknown>): Promise<void> {
  switch (toolName) {
    case 'send_email':
      return queueAgentSteps([
        { type: 'click', selector: 'a[aria-label="Navigate to Emails"]' },
        { type: 'wait', delay: 600 },
        { type: 'click', selector: 'button[aria-label="Compose new email"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: 'input[aria-label="Recipient email address"]', text: (input.to as string) || '' },
        { type: 'type', selector: 'input[aria-label="Email subject"]', text: (input.subject as string) || '' },
        { type: 'type', selector: 'textarea[aria-label="Email body"]', text: ((input.body as string) || '').slice(0, 120) },
        { type: 'wait', delay: 300 },
        { type: 'click', selector: 'button[aria-label="Send email"]' },
        { type: 'wait', delay: 400 },
      ])

    case 'create_contact':
      return queueAgentSteps([
        { type: 'click', selector: 'a[aria-label="Navigate to Contacts"]' },
        { type: 'wait', delay: 600 },
        { type: 'click', selector: 'button[aria-label="Add new contact"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cf-firstName', text: (input.firstName as string) || '' },
        { type: 'type', selector: '#cf-lastName', text: (input.lastName as string) || '' },
        { type: 'type', selector: '#cf-email', text: (input.email as string) || '' },
        { type: 'wait', delay: 300 },
      ])

    case 'create_company':
      return queueAgentSteps([
        { type: 'click', selector: 'a[aria-label="Navigate to Companies"]' },
        { type: 'wait', delay: 600 },
        { type: 'click', selector: 'button[aria-label="Add new company"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cf-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 300 },
      ])

    case 'create_deal':
      return queueAgentSteps([
        { type: 'click', selector: 'a[aria-label="Navigate to Deals"]' },
        { type: 'wait', delay: 600 },
        { type: 'click', selector: 'button[aria-label="Add new deal"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#df-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 300 },
      ])

    case 'create_task':
      return queueAgentSteps([
        { type: 'click', selector: 'a[aria-label="Navigate to Tasks"]' },
        { type: 'wait', delay: 600 },
        { type: 'click', selector: 'button[aria-label="Add new task"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#tf-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 300 },
      ])

    case 'navigate_to':
      return queueAgentSteps([
        { type: 'click', selector: `a[aria-label="Navigate to ${capitalize(input.page as string)}"]` },
        // Give the page time to render before the next tool targets elements on it
        { type: 'wait', delay: 600 },
      ])

    case 'move_deal_stage':
      return queueAgentSteps([
        { type: 'move', selector: `[data-deal-id="${input.id}"]` },
        { type: 'wait', delay: 300 },
      ])

    case 'complete_task':
      return queueAgentSteps([
        { type: 'click', selector: `[data-task-id="${input.id}"] button[role="checkbox"]` },
        { type: 'wait', delay: 300 },
      ])

    case 'update_contact':
    case 'update_company':
    case 'update_deal':
    case 'update_task':
      return queueAgentSteps([
        { type: 'move', selector: `[data-id="${input.id}"]` },
        { type: 'wait', delay: 250 },
      ])

    case 'onboard_client':
      return queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new company"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cf-name', text: (input.companyName as string) || '' },
        { type: 'wait', delay: 300 },
        { type: 'click', selector: 'button[aria-label="Add new contact"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cf-firstName', text: (input.contactFirstName as string) || '' },
        { type: 'type', selector: '#cf-lastName', text: (input.contactLastName as string) || '' },
        { type: 'type', selector: '#cf-email', text: (input.contactEmail as string) || '' },
        { type: 'wait', delay: 300 },
        { type: 'click', selector: 'button[aria-label="Add new deal"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#df-name', text: (input.dealName as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'list_deals':
    case 'get_deal':
      return queueAgentSteps([
        { type: 'move', selector: '[aria-label="Deals kanban board"]' },
        { type: 'wait', delay: 400 },
      ])

    case 'list_contacts':
    case 'get_contact':
      return queueAgentSteps([
        { type: 'move', selector: 'input[aria-label="Search contacts"]' },
        { type: 'wait', delay: 400 },
      ])

    case 'list_companies':
    case 'get_company':
      return queueAgentSteps([
        { type: 'move', selector: 'input[aria-label="Search companies"]' },
        { type: 'wait', delay: 400 },
      ])

    case 'list_tasks':
    case 'get_task':
      return queueAgentSteps([
        { type: 'move', selector: 'input[aria-label="Search tasks"]' },
        { type: 'wait', delay: 400 },
      ])

    case 'list_emails':
    case 'get_email_thread':
      return queueAgentSteps([
        { type: 'move', selector: 'input[aria-label="Search email threads"]' },
        { type: 'wait', delay: 400 },
      ])

    case 'search_crm':
      return queueAgentSteps([
        { type: 'move', selector: 'input[aria-label="Search contacts"]' },
        { type: 'wait', delay: 400 },
      ])

    default:
      return Promise.resolve()
  }
}
