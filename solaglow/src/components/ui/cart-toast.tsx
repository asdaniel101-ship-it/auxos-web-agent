'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

interface CartToastProps {
  message: string
  visible: boolean
  onClose: () => void
}

export function CartToast({ message, visible, onClose }: CartToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="fixed top-36 right-6 z-[200] animate-slide-down">
      <div className="bg-foreground text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px]">
        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">{message}</p>
          <p className="text-xs text-white/60 mt-0.5">View cart to checkout</p>
        </div>
      </div>
    </div>
  )
}
