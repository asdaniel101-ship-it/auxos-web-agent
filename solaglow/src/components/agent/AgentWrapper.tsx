'use client'

import { useMemo } from 'react'
import { AuxosAgent } from '@auxos/agent'
import { useRouter, usePathname } from 'next/navigation'
import { createSolaGlowTools } from '@/agent/tools'
import { useCartStore } from '@/store/cart'

export function AgentWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const tools = useMemo(() => createSolaGlowTools(() => useCartStore.getState()), [])

  return (
    <AuxosAgent
      tools={tools}
      endpoint="/api/agent"
      name="SolaGlow"
      tagline="Skincare Assistant"
      suggestions={[
        'What products help with anti-aging?',
        'Add the GlowBoost Serum to my cart',
        "What's in the Complete Glow System bundle?",
        'How does LED light therapy work?',
        'Build me a skincare routine',
      ]}
      onNavigate={(path) => router.push(path)}
      getContext={() => ({ currentPage: pathname })}
      theme={{
        colors: {
          primary: '#C4956A',
          primaryDark: '#A67B52',
        },
      }}
    />
  )
}
