'use client'

import { useState, useCallback } from 'react'
import { useStore } from '@/store'
import { Report } from '@/types'
import { ReportChart } from '@/components/reports/ReportChart'
import { ReportFilters } from '@/components/reports/ReportFilters'
import { ReportBuilder } from '@/components/reports/ReportBuilder'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import {
  Plus,
  Download,
  BarChart2,
  LineChart,
  PieChart,
  ArrowLeft,
  Trash2,
} from 'lucide-react'

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const TYPE_LABELS: Record<Report['type'], string> = {
  'revenue-by-month': 'Revenue by Month',
  'deals-by-stage': 'Deals by Stage',
  'contacts-by-source': 'Contacts by Status',
  'tasks-by-owner': 'Tasks by Owner',
  'pipeline-forecast': 'Pipeline Forecast',
  'custom': 'Custom',
}

const CHART_ICONS: Record<Report['chartType'], React.ComponentType<{ className?: string }>> = {
  bar: BarChart2,
  line: LineChart,
  pie: PieChart,
}

// --------------------------------------------------------------------------
// CSV export
// --------------------------------------------------------------------------

function buildCsvRows(
  report: Report,
  store: ReturnType<typeof useStore.getState>
): string[][] {
  const { deals, contacts, tasks } = store
  const { start, end } = report.dateRange ?? {}
  const ownerFilter = report.filters?.owner ?? ''

  function inRange(isoDate: string) {
    const d = isoDate.slice(0, 10)
    if (start && d < start) return false
    if (end && d > end) return false
    return true
  }

  switch (report.type) {
    case 'revenue-by-month': {
      const now = new Date()
      const months: { label: string; key: string }[] = []
      for (let i = 11; i >= 0; i--) {
        const dt = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
        const label = dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        months.push({ label, key })
      }
      const filtered = deals.filter((d) => d.stage === 'Closed Won' && (!ownerFilter || d.owner === ownerFilter) && inRange(d.closeDate))
      const byMonth: Record<string, number> = {}
      for (const m of months) byMonth[m.key] = 0
      for (const d of filtered) {
        const key = d.closeDate.slice(0, 7)
        if (key in byMonth) byMonth[key] += d.value
      }
      return [
        ['Month', 'Revenue'],
        ...months.map(({ label, key }) => [label, String(byMonth[key])]),
      ]
    }

    case 'deals-by-stage': {
      const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
      const filtered = deals.filter((d) => (!ownerFilter || d.owner === ownerFilter) && inRange(d.closeDate))
      return [
        ['Stage', 'Count'],
        ...STAGES.map((stage) => [stage, String(filtered.filter((d) => d.stage === stage).length)]),
      ]
    }

    case 'contacts-by-source': {
      const STATUSES = ['lead', 'prospect', 'customer', 'churned']
      const filtered = contacts.filter((c) => (!ownerFilter || c.owner === ownerFilter) && inRange(c.createdAt))
      return [
        ['Status', 'Count'],
        ...STATUSES.map((s) => [s, String(filtered.filter((c) => c.status === s).length)]),
      ]
    }

    case 'tasks-by-owner': {
      const filtered = tasks.filter((t) => inRange(t.dueDate))
      const byOwner: Record<string, number> = {}
      for (const t of filtered) byOwner[t.assignee] = (byOwner[t.assignee] ?? 0) + 1
      return [
        ['Owner', 'Tasks'],
        ...Object.entries(byOwner).sort((a, b) => b[1] - a[1]).map(([owner, count]) => [owner, String(count)]),
      ]
    }

    case 'pipeline-forecast': {
      const openStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation']
      const stageFilter = report.filters?.stage ?? ''
      const filtered = deals.filter((d) =>
        openStages.includes(d.stage) &&
        (!ownerFilter || d.owner === ownerFilter) &&
        (!stageFilter || d.stage === stageFilter) &&
        inRange(d.closeDate)
      )
      return [
        ['Stage', 'Weighted Forecast'],
        ...openStages.map((stage) => [
          stage,
          String(
            filtered
              .filter((d) => d.stage === stage)
              .reduce((sum, d) => sum + d.value * (d.probability / 100), 0)
              .toFixed(2)
          ),
        ]),
      ]
    }

    default:
      return [['No data available']]
  }
}

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// --------------------------------------------------------------------------
// Report card
// --------------------------------------------------------------------------

function ReportCard({
  report,
  onSelect,
  onDelete,
}: {
  report: Report
  onSelect: () => void
  onDelete: () => void
}) {
  const ChartIcon = CHART_ICONS[report.chartType] ?? BarChart2

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onSelect}
    >
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-md bg-indigo-100 text-indigo-600 p-1.5 shrink-0">
              <ChartIcon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 truncate">{report.name}</h3>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1 rounded"
            aria-label="Delete report"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs capitalize">
            {TYPE_LABELS[report.type] ?? report.type}
          </Badge>
          <span className="text-xs text-slate-400 uppercase tracking-wide">{report.chartType}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">{formatDate(report.createdAt)}</p>
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------

export default function ReportsPage() {
  const reports = useStore((s) => s.reports)
  const deleteReport = useStore((s) => s.deleteReport)
  const storeState = useStore.getState

  const { toast } = useToast()

  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [builderOpen, setBuilderOpen] = useState(false)

  // Local override of report settings (chartType, dateRange, filters) without
  // persisting back to the store so we can experiment in the detail view.
  const [localReport, setLocalReport] = useState<Report | null>(null)

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report)
    setLocalReport({ ...report })
  }

  const handleBack = () => {
    setSelectedReport(null)
    setLocalReport(null)
  }

  const handleFiltersChange = useCallback((updates: Partial<Report>) => {
    setLocalReport((prev) => prev ? { ...prev, ...updates } : prev)
  }, [])

  const handleDelete = (id: string) => {
    deleteReport(id)
    if (selectedReport?.id === id) {
      setSelectedReport(null)
      setLocalReport(null)
    }
    toast({ title: 'Report deleted' })
  }

  const handleExportCsv = () => {
    if (!localReport) return
    const rows = buildCsvRows(localReport, storeState())
    const safeName = localReport.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    downloadCsv(rows, `${safeName}.csv`)
    toast({ title: 'CSV exported', description: `${localReport.name}.csv downloaded.` })
  }

  // Detail view
  if (selectedReport && localReport) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Reports
            </Button>
            <span className="text-slate-300">/</span>
            <h1 className="text-xl font-bold text-slate-900">{localReport.name}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <ReportFilters report={localReport} onChange={handleFiltersChange} />

        {/* Chart */}
        <ReportChart report={localReport} />
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <Button size="sm" onClick={() => setBuilderOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Custom Report
        </Button>
      </div>

      {/* Report grid */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
          <BarChart2 className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No reports yet</p>
          <p className="text-xs text-slate-400 mt-1">Create a custom report to get started.</p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setBuilderOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Report
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onSelect={() => handleSelectReport(report)}
              onDelete={() => handleDelete(report.id)}
            />
          ))}
        </div>
      )}

      {/* Report builder dialog */}
      <ReportBuilder open={builderOpen} onOpenChange={setBuilderOpen} />
    </div>
  )
}
