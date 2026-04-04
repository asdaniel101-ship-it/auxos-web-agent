import { createApiHandler } from '@auxos/agent/server'
import { createSolaGlowTools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'

const tools = createSolaGlowTools(() => null as any)

export const POST = createApiHandler({
  tools,
  systemPrompt: (context: Record<string, unknown>) =>
    getSystemPrompt({
      currentPage: (context.currentPage as string) || '/',
    }),
})
