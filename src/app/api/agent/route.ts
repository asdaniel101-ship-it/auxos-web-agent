import { createApiHandler } from '@auxos/agent/server'
import { tools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'

export const POST = createApiHandler({
  tools,
  systemPrompt: (context: Record<string, unknown>) =>
    getSystemPrompt({
      teamMembers: (context.teamMembers as string[]) || [],
      currentPage: (context.currentPage as string) || '/',
    }),
})
