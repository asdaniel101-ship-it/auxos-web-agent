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
    <div className="fixed top-24 right-6 z-[100] animate-slide-down">
      <div className="bg-foreground text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
