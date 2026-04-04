'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-slate-500">
      {segments.map((segment, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)

        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {isLast ? (
              <span className="text-slate-900 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-slate-900">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
