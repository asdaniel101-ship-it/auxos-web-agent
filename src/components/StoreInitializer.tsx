'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/store'

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initRef = useRef(false)

  if (!initRef.current) {
    // Initialize synchronously on first render (before useEffect)
    // This avoids the flash of "Loading..." and ensures data is ready immediately
    try {
      const state = useStore.getState()
      if (!state.initialized) {
        state.initialize()
      }
    } catch (e) {
      console.error('Failed to initialize store:', e)
    }
    initRef.current = true
  }

  return <>{children}</>
}
