'use client'

import { tools as schemas } from './tools'
import { executeTool } from './executor'
import { queueVisualAction } from './visual-actions'
import { useStore } from '@/store'
import type { AuxosTool } from '@auxos/agent'

/**
 * Bridge the CRM's existing tool schemas + executor to the SDK's AuxosTool format.
 * Visual cursor animation plays FIRST, then the actual state mutation happens.
 */
export function getCrmTools(): AuxosTool[] {
  return schemas.map((schema): AuxosTool => ({
    name: schema.name,
    description: schema.description ?? '',
    parameters: {
      type: 'object' as const,
      properties: (schema.input_schema.properties ?? {}) as Record<string, unknown>,
      required: (schema.input_schema.required as string[]) ?? [],
    },
    execute: async (input: Record<string, unknown>) => {
      // 1. Play visual cursor animation FIRST (user sees the cursor click, type, etc.)
      await queueVisualAction(schema.name, input)

      // 2. THEN mutate the actual state
      const store = useStore.getState()
      return executeTool(schema.name, input, store)
    },
  }))
}
