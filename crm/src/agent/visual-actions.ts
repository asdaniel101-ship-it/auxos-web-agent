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
        { type: 'click', selector: 'button[aria-label="Compose new email"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: 'input[aria-label="Recipient email address"]', text: (input.to as string) || '' },
        { type: 'type', selector: 'input[aria-label="Email subject"]', text: (input.subject as string) || '' },
        { type: 'type', selector: 'textarea[aria-label="Email body"]', text: ((input.body as string) || '').slice(0, 120) },
        { type: 'wait', delay: 400 },
        { type: 'click', selector: 'button[aria-label="Send email"]' },
        { type: 'wait', delay: 500 },
      ])

    case 'create_contact':
      return queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new contact"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#cf-firstName', text: (input.firstName as string) || '' },
        { type: 'type', selector: '#cf-lastName', text: (input.lastName as string) || '' },
        { type: 'type', selector: '#cf-email', text: (input.email as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'create_company':
      return queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new company"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#cf-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'create_deal':
      return queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new deal"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#df-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'create_task':
      return queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new task"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: '#tf-name', text: (input.name as string) || '' },
        { type: 'wait', delay: 400 },
      ])

    case 'draft_email':
      return queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Compose new email"]' },
        { type: 'wait', delay: 600 },
        { type: 'type', selector: 'input[aria-label="Recipient email address"]', text: (input.to as string) || '' },
        { type: 'type', selector: 'input[aria-label="Email subject"]', text: (input.subject as string) || '' },
        { type: 'type', selector: 'textarea[aria-label="Email body"]', text: ((input.body as string) || '').slice(0, 120) },
        { type: 'wait', delay: 400 },
      ])

    case 'navigate_to':
      return queueAgentSteps([
        { type: 'click', selector: `a[aria-label="Navigate to ${capitalize(input.page as string)}"]` },
        { type: 'wait', delay: 300 },
      ])

    default:
      return Promise.resolve()
  }
}
