'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  Mail,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/deals', label: 'Deals', icon: Handshake },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const teamMembers = useStore((s) => s.teamMembers)
  const currentUser = teamMembers?.[0]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r bg-white flex flex-col" aria-label="Main navigation">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-xl font-bold text-slate-900">CRM</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`Navigate to ${item.label}`}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      {currentUser && (
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {currentUser.avatar}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
