import { createApiHandler } from '@auxos/agent/server'
import { createCrmTools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'
import type { CrmStore } from '@/store'

// Server-side: only the tool schemas (name, description, parameters) are used.
// The execute functions are never called server-side, so a null store getter is safe.
const tools = createCrmTools(() => null as unknown as CrmStore)

export const POST = createApiHandler({
  tools,
  systemPrompt: (context: Record<string, unknown>) =>
    getSystemPrompt({
      teamMembers: (context.teamMembers as string[]) || [],
      currentPage: (context.currentPage as string) || '/',
    }),
})
