'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { Deal, DealStage } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STAGES: DealStage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
]

const STAGE_BADGE_COLORS: Record<DealStage, string> = {
  Prospecting: 'bg-slate-100 text-slate-700 border-slate-200',
  Qualification: 'bg-blue-100 text-blue-700 border-blue-200',
  Proposal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
  'Closed Won': 'bg-green-100 text-green-700 border-green-200',
  'Closed Lost': 'bg-red-100 text-red-700 border-red-200',
}

export function DealsList() {
  const deals = useStore((s) => s.deals)
  const companies = useStore((s) => s.companies)
  const teamMembers = useStore((s) => s.teamMembers)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)
  const router = useRouter()

  if (!initialized) initialize()

  const [stageFilter, setStageFilter] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')
  const [minValue, setMinValue] = useState<string>('')
  const [maxValue, setMaxValue] = useState<string>('')

  function getCompanyName(companyId: string | null): string {
    if (!companyId) return '—'
    return companies.find((c) => c.id === companyId)?.name ?? '—'
  }

  const filtered = deals.filter((deal) => {
    if (stageFilter !== 'all' && deal.stage !== stageFilter) return false
    if (ownerFilter !== 'all' && deal.owner !== ownerFilter) return false
    if (minValue && deal.value < Number(minValue)) return false
    if (maxValue && deal.value > Number(maxValue)) return false
    return true
  })

  const owners = Array.from(new Set(deals.map((d) => d.owner).filter(Boolean)))

  return (
    <div className="space-y-4">
      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        {/* Stage filter */}
        <div className="space-y-1">
          <Label htmlFor="dl-stage" className="text-xs text-slate-600">Stage</Label>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger id="dl-stage" className="h-8 w-44 text-xs" aria-label="Filter by stage">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Owner filter */}
        <div className="space-y-1">
          <Label htmlFor="dl-owner" className="text-xs text-slate-600">Owner</Label>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger id="dl-owner" className="h-8 w-44 text-xs" aria-label="Filter by owner">
              <SelectValue placeholder="All owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min value */}
        <div className="space-y-1">
          <Label htmlFor="dl-min" className="text-xs text-slate-600">Min Value ($)</Label>
          <Input
            id="dl-min"
            type="number"
            min={0}
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            placeholder="0"
            className="h-8 w-28 text-xs"
            aria-label="Minimum deal value"
          />
        </div>

        {/* Max value */}
        <div className="space-y-1">
          <Label htmlFor="dl-max" className="text-xs text-slate-600">Max Value ($)</Label>
          <Input
            id="dl-max"
            type="number"
            min={0}
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            placeholder="Any"
            className="h-8 w-28 text-xs"
            aria-label="Maximum deal value"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500">{filtered.length} deal{filtered.length !== 1 ? 's' : ''}</p>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Deal Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Company</TableHead>
                <TableHead className="font-semibold text-slate-700">Value</TableHead>
                <TableHead className="font-semibold text-slate-700">Stage</TableHead>
                <TableHead className="font-semibold text-slate-700">Owner</TableHead>
                <TableHead className="font-semibold text-slate-700">Close Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Probability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-10">
                    No deals found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((deal) => (
                <TableRow
                  key={deal.id}
                  data-deal-id={deal.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => router.push(`/deals/${deal.id}`)}
                  aria-label={`View deal ${deal.name}`}
                >
                  <TableCell className="font-medium text-slate-900">{deal.name}</TableCell>
                  <TableCell className="text-slate-600">{getCompanyName(deal.companyId)}</TableCell>
                  <TableCell className="text-slate-700 font-semibold">{formatCurrency(deal.value)}</TableCell>
                  <TableCell>
                    <Badge className={STAGE_BADGE_COLORS[deal.stage]} variant="outline">
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{deal.owner || '—'}</TableCell>
                  <TableCell className="text-slate-600">
                    {deal.closeDate ? formatDate(deal.closeDate) : '—'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {deal.probability != null ? `${deal.probability}%` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  )
}
