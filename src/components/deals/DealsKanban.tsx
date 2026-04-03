'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '@/store'
import { Deal, DealStage } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

const STAGES: DealStage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
]

const STAGE_COLORS: Record<DealStage, string> = {
  Prospecting: 'border-t-slate-400',
  Qualification: 'border-t-blue-400',
  Proposal: 'border-t-yellow-400',
  Negotiation: 'border-t-orange-400',
  'Closed Won': 'border-t-green-500',
  'Closed Lost': 'border-t-red-400',
}

// Prefix stage IDs so they don't collide with deal IDs
function stageDropId(stage: DealStage) {
  return `stage::${stage}`
}

function parseStageDropId(id: string): DealStage | null {
  if (id.startsWith('stage::')) return id.slice('stage::'.length) as DealStage
  return null
}

// ─── Deal Card ──────────────────────────────────────────────────────────────

interface DealCardProps {
  deal: Deal
  companyName: string | null
  isGlobalDragging: boolean
}

function DealCard({ deal, companyName, isGlobalDragging }: DealCardProps) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  function handleClick() {
    if (!isGlobalDragging) {
      router.push(`/deals/${deal.id}`)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border border-slate-200 shadow-sm p-3 space-y-2 group',
        'hover:border-blue-300 hover:shadow-md transition-all cursor-pointer select-none',
        isDragging && 'opacity-30'
      )}
      onClick={handleClick}
      aria-label={`Deal: ${deal.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-slate-900 leading-tight line-clamp-2 flex-1">
          {deal.name}
        </span>
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing mt-0.5"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      {companyName && (
        <p className="text-xs text-slate-500 truncate">{companyName}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">{formatCurrency(deal.value)}</span>
        {deal.owner && (
          <span className="text-xs text-slate-400 truncate max-w-[80px]">{deal.owner}</span>
        )}
      </div>
    </div>
  )
}

// ─── Drag Overlay Card ───────────────────────────────────────────────────────

function DealCardOverlay({ deal, companyName }: { deal: Deal; companyName: string | null }) {
  return (
    <div className="bg-white rounded-lg border-2 border-blue-400 shadow-2xl p-3 space-y-2 w-60 rotate-2 opacity-95 pointer-events-none">
      <span className="font-semibold text-sm text-slate-900 leading-tight line-clamp-2 block">
        {deal.name}
      </span>
      {companyName && (
        <p className="text-xs text-slate-500 truncate">{companyName}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">{formatCurrency(deal.value)}</span>
        {deal.owner && (
          <span className="text-xs text-slate-400 truncate max-w-[80px]">{deal.owner}</span>
        )}
      </div>
    </div>
  )
}

// ─── Kanban Column ───────────────────────────────────────────────────────────

interface KanbanColumnProps {
  stage: DealStage
  deals: Deal[]
  getCompanyName: (id: string | null) => string | null
  activeDealId: string | null
}

function KanbanColumn({ stage, deals, getCompanyName, activeDealId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stageDropId(stage) })
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)

  return (
    <div
      className={cn(
        'flex-shrink-0 w-60 rounded-xl border-t-4 bg-slate-50 border border-slate-200 flex flex-col',
        STAGE_COLORS[stage],
        isOver && 'ring-2 ring-blue-300 bg-blue-50'
      )}
      aria-label={`${stage} column`}
    >
      {/* Column header */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="font-semibold text-sm text-slate-700">{stage}</span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-200 rounded-full px-2 py-0.5">
          {deals.length}
        </span>
      </div>

      {/* Column total */}
      <div className="px-3 pb-2">
        <span className="text-xs text-slate-400">
          {totalValue > 0 ? formatCurrency(totalValue) : 'No deals'}
        </span>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 min-h-[80px]">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 p-2">
            {deals.length === 0 && (
              <div
                className={cn(
                  'flex items-center justify-center text-xs text-slate-300 min-h-[60px] rounded-lg border-2 border-dashed border-slate-200',
                  isOver && 'border-blue-300 text-blue-400'
                )}
              >
                Drop here
              </div>
            )}
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                companyName={getCompanyName(deal.companyId)}
                isGlobalDragging={activeDealId !== null}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

// ─── Kanban Board ────────────────────────────────────────────────────────────

export function DealsKanban() {
  const deals = useStore((s) => s.deals)
  const companies = useStore((s) => s.companies)
  const moveDealStage = useStore((s) => s.moveDealStage)
  const addActivity = useStore((s) => s.addActivity)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)

  if (!initialized) initialize()

  const [activeDealId, setActiveDealId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function getCompanyName(companyId: string | null): string | null {
    if (!companyId) return null
    return companies.find((c) => c.id === companyId)?.name ?? null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDealId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDealId(null)
    const { active, over } = event
    if (!over) return

    const dealId = active.id as string
    const deal = deals.find((d) => d.id === dealId)
    if (!deal) return

    const overId = over.id as string

    // Determine target stage from droppable id or from another deal's stage
    let newStage: DealStage | null = parseStageDropId(overId)
    if (!newStage) {
      // over is a deal card — use that deal's current stage
      const overDeal = deals.find((d) => d.id === overId)
      if (overDeal) newStage = overDeal.stage
    }

    if (newStage && newStage !== deal.stage) {
      moveDealStage(dealId, newStage)
      addActivity({
        type: 'deal_stage_changed',
        description: `Deal "${deal.name}" moved from ${deal.stage} to ${newStage}`,
        entityType: 'deal',
        entityId: dealId,
        userId: deal.owner,
      })
    }
  }

  const activeDeal = activeDealId ? deals.find((d) => d.id === activeDealId) ?? null : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-240px)]" aria-label="Deals kanban board">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={deals.filter((d) => d.stage === stage)}
            getCompanyName={getCompanyName}
            activeDealId={activeDealId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDeal && (
          <DealCardOverlay
            deal={activeDeal}
            companyName={getCompanyName(activeDeal.companyId)}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
