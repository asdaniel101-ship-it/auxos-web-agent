import { queueAgentSteps } from '@/components/agent/AgentCursor'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Queue visual cursor actions for a tool execution.
 * These run asynchronously — the data mutation already happened,
 * the cursor just shows the user what the agent "did."
 */
export function queueVisualAction(toolName: string, input: Record<string, unknown>) {
  switch (toolName) {
    case 'send_email':
      queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Compose new email"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: 'input[aria-label="Recipient email address"]', text: (input.to as string) || '' },
        { type: 'type', selector: 'input[aria-label="Email subject"]', text: (input.subject as string) || '' },
        { type: 'type', selector: 'textarea[aria-label="Email body"]', text: ((input.body as string) || '').slice(0, 100) },
        { type: 'wait', delay: 300 },
        { type: 'click', selector: 'button[aria-label="Send email"]' },
      ])
      break

    case 'create_contact':
      queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new contact"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cf-first', text: (input.firstName as string) || '' },
        { type: 'type', selector: '#cf-last', text: (input.lastName as string) || '' },
        { type: 'type', selector: '#cf-email', text: (input.email as string) || '' },
      ])
      break

    case 'create_company':
      queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new company"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#cof-name', text: (input.name as string) || '' },
      ])
      break

    case 'create_deal':
      queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new deal"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#df-name', text: (input.name as string) || '' },
      ])
      break

    case 'create_task':
      queueAgentSteps([
        { type: 'click', selector: 'button[aria-label="Add new task"]' },
        { type: 'wait', delay: 500 },
        { type: 'type', selector: '#tf-name', text: (input.name as string) || '' },
      ])
      break

    case 'navigate_to':
      queueAgentSteps([
        { type: 'click', selector: `a[aria-label="Navigate to ${capitalize(input.page as string)}"]` },
      ])
      break
  }
}
