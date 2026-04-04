'use client'

import toolsConfig from '../../auxos-tools.json'
import { custom } from '@auxos/agent'
import { queueAgentSteps } from '@/components/agent/AgentCursor'
import type { AuxosTool } from '@auxos/agent'
import type { CrmStore } from '@/store'

type Step = { type: 'move' | 'click' | 'scroll-to'; selector: string }
  | { type: 'type'; selector: string; text: string }
  | { type: 'select-option'; text: string }
  | { type: 'wait'; delay: number }
  | { type: 'dismiss' }

interface ToolUI {
  page: string
  trigger: string
  fields: Record<string, string>
  submit: string | null
}

interface ToolDef {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
  ui?: ToolUI | null
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function isOnPage(page: string): boolean {
  return window.location.pathname.startsWith(page)
}

/** Generate cursor steps from JSON UI config for create tools */
function createStepsFromUI(ui: ToolUI, input: Record<string, unknown>): Step[] {
  const pageName = capitalize(ui.page.replace('/', ''))
  const steps: Step[] = []

  // Navigate to page if not already there
  if (!isOnPage(ui.page)) {
    steps.push(
      { type: 'click', selector: `a[aria-label="Navigate to ${pageName}"]` },
      { type: 'wait', delay: 600 },
    )
  }

  // Click trigger button (e.g., "Add Contact")
  if (ui.trigger) {
    const buttonLabel = ui.trigger.replace('button:', '')
    steps.push(
      { type: 'click', selector: `button[aria-label="Add new ${buttonLabel.replace('Add ', '').toLowerCase()}"]` },
      { type: 'wait', delay: 600 },
    )
  }

  // Fill form fields from the UI mapping
  for (const [fieldName, selector] of Object.entries(ui.fields)) {
    const value = input[fieldName]
    if (value != null && value !== '') {
      steps.push({ type: 'type', selector, text: String(value) })
    }
  }

  // Handle wizard-style forms: advance through steps if there's a "next" button
  // Try advancing up to 5 times (covers multi-step wizards)
  for (let i = 0; i < 5; i++) {
    steps.push(
      { type: 'click', selector: 'button[aria-label="Go to next step"]' },
      { type: 'wait', delay: 400 },
    )
  }

  // Click submit
  if (ui.submit) {
    steps.push(
      { type: 'click', selector: `button[aria-label="${ui.submit}"]` },
      { type: 'wait', delay: 600 },
    )
  }

  return steps
}

/**
 * Load tools from auxos-tools.json for create operations.
 * Returns tools with schemas from JSON and cursor flows driven by UI config.
 * Read-only and other tools are NOT included — they come from tools.ts.
 */
export function loadCreateToolsFromConfig(): AuxosTool[] {
  const config = toolsConfig as { tools: ToolDef[] }
  const tools: AuxosTool[] = []

  for (const toolDef of config.tools) {
    // Only handle create tools that have UI mappings
    if (!toolDef.name.startsWith('create_') || !toolDef.ui) continue

    tools.push(
      custom({
        name: toolDef.name,
        description: toolDef.description,
        parameters: {
          type: toolDef.parameters.type as 'object',
          properties: toolDef.parameters.properties,
          required: toolDef.parameters.required,
        },
        execute: (input) => {
          // Execute is handled by the UI — this is a fallback
          return { success: true, data: { performedViaUI: true } }
        },
      })
    )
  }

  return tools
}

/**
 * Queue visual action using JSON UI config instead of hardcoded steps.
 * Returns true if the tool was handled by config, false if it should fall back
 * to the hardcoded visual-actions.ts.
 */
export function queueVisualActionFromConfig(
  toolName: string,
  input: Record<string, unknown>
): Promise<void> | null {
  const config = toolsConfig as { tools: ToolDef[] }
  const toolDef = config.tools.find(t => t.name === toolName)

  if (!toolDef?.ui) return null // not in config, fall back to hardcoded

  const steps = createStepsFromUI(toolDef.ui, input)
  return queueAgentSteps(steps)
}
