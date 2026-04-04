'use client'

import { createCrmTools } from './tools'
import { queueVisualAction } from './visual-actions'
import { useStore } from '@/store'
import type { AuxosTool } from '@auxos/agent'

// Mutation tools: the cursor fills out forms and clicks submit buttons in the UI.
// The UI handles the state mutation, so we do NOT call tool.execute() for these.
const MUTATION_TOOLS = new Set([
  'create_contact',
  'update_contact',
  'delete_contact',
  'bulk_update_contacts',
  'create_company',
  'update_company',
  'create_deal',
  'update_deal',
  'move_deal_stage',
  'create_task',
  'update_task',
  'complete_task',
  'send_email',
  'reply_to_email',
  'draft_email',
  'update_settings',
  'invite_team_member',
  'onboard_client',
])

/**
 * Returns CRM tools with visual cursor animation wired in.
 *
 * Mutation tools: cursor performs the action through the UI (filling forms,
 * clicking buttons). No background tool.execute() call — what the user sees
 * IS the action. They could do it themselves the same way.
 *
 * Read-only tools: cursor navigates to the relevant page, then tool.execute()
 * returns the data the LLM needs.
 */
export function getCrmTools(): AuxosTool[] {
  const tools = createCrmTools(() => useStore.getState())

  return tools.map((tool): AuxosTool => ({
    ...tool,
    execute: async (input: Record<string, unknown>) => {
      // Play visual cursor animation (navigate, fill forms, click buttons)
      await queueVisualAction(tool.name, input)

      if (MUTATION_TOOLS.has(tool.name)) {
        // Mutation was performed by the cursor clicking the UI.
        // Return a success indicator so the LLM knows it worked.
        return { success: true, performedViaUI: true }
      }

      // Read-only tools still need to execute to return data to the LLM
      return tool.execute(input)
    },
  }))
}
