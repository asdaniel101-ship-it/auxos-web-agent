'use client'

import { createCrmTools, validateToolInput } from './tools'
import { queueVisualAction } from './visual-actions'
import { queueVisualActionFromConfig } from './tools-loader'
import { useStore } from '@/store'
import type { AuxosTool } from '@auxos/agent'

// Tools with COMPLETE cursor-driven UI flows (form fill + submit click).
// These skip tool.execute() because the cursor's UI interactions ARE the mutation.
const UI_MUTATION_TOOLS = new Set([
  'create_contact',
  'create_company',
  'create_deal',
  'create_task',
  'send_email',
  'draft_email',
  'update_contact',
  'update_company',
  'update_deal',
  'delete_contact',
  'delete_company',
  'complete_task',
  'move_deal_stage',
  'reply_to_email',
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
      // Run validation BEFORE the cursor animation for mutation tools.
      // If invalid (duplicate email, bad data), return error immediately
      // so the LLM can course-correct without a wasted animation.
      if (UI_MUTATION_TOOLS.has(tool.name)) {
        const error = validateToolInput(tool.name, input, () => useStore.getState())
        if (error) return error
      }

      // Play visual cursor animation — try JSON config first, fall back to hardcoded
      const configAction = queueVisualActionFromConfig(tool.name, input)
      if (configAction) {
        await configAction
      } else {
        await queueVisualAction(tool.name, input)
      }

      if (UI_MUTATION_TOOLS.has(tool.name)) {
        // Verify the UI mutation succeeded: if a dialog is still open,
        // the cursor missed the submit button. Fall back to tool.execute().
        const dialogStillOpen = typeof document !== 'undefined' &&
          document.querySelector('[role="dialog"]') !== null
        if (dialogStillOpen) {
          // Close the stuck dialog, then execute the tool directly
          document.querySelector<HTMLElement>('[role="dialog"] button[aria-label="Close"]')?.click()
          return tool.execute(input)
        }
        return { success: true, performedViaUI: true }
      }

      // ANIMATED_WITH_FALLBACK: cursor played the animation, now execute the actual mutation
      // (these tools don't have complete UI flows yet)

      // Read-only tools still need to execute to return data to the LLM
      return tool.execute(input)
    },
  }))
}
