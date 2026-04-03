'use client'

import { useEffect } from 'react'
import { useStore } from '@/store'

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
