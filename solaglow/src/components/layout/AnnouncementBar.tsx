'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnnouncementBarProps {
  className?: string
}

const announcements = [
  'Free shipping on orders over $75',
  'New arrivals: RadiantWave Mini & SPF 50 Day Shield',
  '60-day money-back guarantee on all devices',
]

export function AnnouncementBar({ className }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true)
  const [current, setCurrent] = useState(0)

  if (!visible) return null

  return (
    <div
      className={cn(
        'relative flex items-center justify-center bg-brand px-4 py-2.5 text-white text-sm',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{announcements[current]}</span>
        <span className="text-white/60 mx-1">—</span>
        <Link
          href="/shop"
          className="font-semibold underline underline-offset-2 hover:text-white/80 transition-colors"
        >
          Shop Now
        </Link>
      </div>

      {/* Dot navigation */}
      <div className="hidden sm:flex items-center gap-1 absolute right-10">
        {announcements.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Announcement ${i + 1}`}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              i === current ? 'bg-white' : 'bg-white/40'
            )}
          />
        ))}
      </div>

      <button
        onClick={() => setVisible(false)}
        aria-label="Close announcement"
        className="absolute right-3 p-1 hover:text-white/70 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
