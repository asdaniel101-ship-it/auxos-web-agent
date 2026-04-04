'use client'

import { createCrmTools } from './tools'
import { queueVisualAction } from './visual-actions'
import { useStore } from '@/store'
import type { AuxosTool } from '@auxos/agent'

/**
 * Returns CRM tools with visual cursor animation wired in.
 * The animation plays FIRST, then the actual state mutation happens.
 */
export function getCrmTools(): AuxosTool[] {
  const tools = createCrmTools(() => useStore.getState())

  // Wrap each tool's execute with cursor animation
  return tools.map((tool): AuxosTool => ({
    ...tool,
    execute: async (input: Record<string, unknown>) => {
      // 1. Play visual cursor animation FIRST (user sees the cursor click, type, etc.)
      await queueVisualAction(tool.name, input)

      // 2. THEN run the actual tool (state mutation)
      return tool.execute(input)
    },
  }))
}
