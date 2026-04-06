'use client'

import { useState } from 'react'
import { DealsKanban } from '@/components/deals/DealsKanban'
import { DealsList } from '@/components/deals/DealsList'
import { DealForm } from '@/components/deals/DealForm'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'kanban' | 'list'

export default function DealsPage() {
  const [view, setView] = useState<ViewMode>('kanban')
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900">Deals</h1>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="View mode">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('kanban')}
              aria-label="Kanban view"
              aria-pressed={view === 'kanban'}
              className={cn(
                'h-7 px-3 rounded-md transition-colors',
                view === 'kanban'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Kanban
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={cn(
                'h-7 px-3 rounded-md transition-colors',
                view === 'list'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <List className="h-4 w-4 mr-1.5" />
              List
            </Button>
          </div>

          {/* Add deal button */}
          <Button
            onClick={() => setFormOpen(true)}
            aria-label="Add new deal"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* View content */}
      {view === 'kanban' ? <DealsKanban /> : <DealsList />}

      {/* Add deal form */}
      <DealForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
