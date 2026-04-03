'use client'

import { tools as schemas } from './tools'
import { executeTool } from './executor'
import { queueVisualAction } from './visual-actions'
import { useStore } from '@/store'
import type { AuxosTool } from '@auxos/agent'

/**
 * Bridge the CRM's existing tool schemas + executor to the SDK's AuxosTool format.
 * Each tool gets its schema from tools.ts, its execute function from executor.ts,
 * and queues visual cursor animations via visual-actions.ts.
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
    execute: (input: Record<string, unknown>) => {
      const store = useStore.getState()
      const result = executeTool(schema.name, input, store)

      // Queue visual cursor animation (runs async, doesn't block)
      if (result.success) {
        queueVisualAction(schema.name, input)
      }

      return result
    },
  }))
}
