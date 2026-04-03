'use client'

import { useMemo } from 'react'
import { useStore } from '@/store'
import { Report, DealStage } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const STAGES: DealStage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
]

const PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

// --------------------------------------------------------------------------
// Date-range helpers
// --------------------------------------------------------------------------

function inRange(isoDate: string, start: string, end: string): boolean {
  if (!start && !end) return true
  const d = isoDate.slice(0, 10)
  if (start && d < start) return false
  if (end && d > end) return false
  return true
}

// --------------------------------------------------------------------------
// Data computation hooks
// --------------------------------------------------------------------------

function useRevenueByMonth(report: Report) {
  const deals = useStore((s) => s.deals)
  return useMemo(() => {
    const { start, end } = report.dateRange ?? {}
    const ownerFilter = report.filters?.owner ?? ''

    const filtered = deals.filter((d) => {
      if (d.stage !== 'Closed Won') return false
      if (ownerFilter && d.owner !== ownerFilter) return false
      return inRange(d.closeDate, start, end)
    })

    // Build month buckets from the data span (or last 12 months as fallback)
    const now = new Date()
    const months: { label: string; key: string }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      months.push({ label, key })
    }

    const byMonth: Record<string, number> = {}
    for (const m of months) byMonth[m.key] = 0
    for (const deal of filtered) {
      const key = deal.closeDate.slice(0, 7)
      if (key in byMonth) byMonth[key] += deal.value
    }

    return months.map(({ label, key }) => ({ month: label, revenue: byMonth[key] }))
  }, [deals, report])
}

function useDealsByStage(report: Report) {
  const deals = useStore((s) => s.deals)
  return useMemo(() => {
    const { start, end } = report.dateRange ?? {}
    const ownerFilter = report.filters?.owner ?? ''

    const filtered = deals.filter((d) => {
      if (ownerFilter && d.owner !== ownerFilter) return false
      return inRange(d.closeDate, start, end)
    })

    return STAGES.map((stage, i) => ({
      stage,
      count: filtered.filter((d) => d.stage === stage).length,
      fill: PALETTE[i % PALETTE.length],
    }))
  }, [deals, report])
}

function useContactsBySource(report: Report) {
  const contacts = useStore((s) => s.contacts)
  return useMemo(() => {
    const { start, end } = report.dateRange ?? {}
    const ownerFilter = report.filters?.owner ?? ''

    const filtered = contacts.filter((c) => {
      if (ownerFilter && c.owner !== ownerFilter) return false
      return inRange(c.createdAt, start, end)
    })

    const statuses = ['lead', 'prospect', 'customer', 'churned'] as const
    return statuses.map((status, i) => ({
      status,
      count: filtered.filter((c) => c.status === status).length,
      fill: PALETTE[i % PALETTE.length],
    }))
  }, [contacts, report])
}

function useTasksByOwner(report: Report) {
  const tasks = useStore((s) => s.tasks)
  return useMemo(() => {
    const { start, end } = report.dateRange ?? {}

    const filtered = tasks.filter((t) => inRange(t.dueDate, start, end))

    const byOwner: Record<string, number> = {}
    for (const task of filtered) {
      byOwner[task.assignee] = (byOwner[task.assignee] ?? 0) + 1
    }

    return Object.entries(byOwner)
      .map(([owner, count], i) => ({ owner, count, fill: PALETTE[i % PALETTE.length] }))
      .sort((a, b) => b.count - a.count)
  }, [tasks, report])
}

function usePipelineForecast(report: Report) {
  const deals = useStore((s) => s.deals)
  return useMemo(() => {
    const { start, end } = report.dateRange ?? {}
    const ownerFilter = report.filters?.owner ?? ''
    const stageFilter = report.filters?.stage ?? ''

    const filtered = deals.filter((d) => {
      if (d.stage === 'Closed Won' || d.stage === 'Closed Lost') return false
      if (ownerFilter && d.owner !== ownerFilter) return false
      if (stageFilter && d.stage !== stageFilter) return false
      return inRange(d.closeDate, start, end)
    })

    const openStages = STAGES.filter((s) => s !== 'Closed Won' && s !== 'Closed Lost')
    return openStages.map((stage, i) => ({
      stage,
      forecast: filtered
        .filter((d) => d.stage === stage)
        .reduce((sum, d) => sum + d.value * (d.probability / 100), 0),
      fill: PALETTE[i % PALETTE.length],
    }))
  }, [deals, report])
}

// --------------------------------------------------------------------------
// Chart sub-components
// --------------------------------------------------------------------------

function RevenueByMonthChart({ report }: { report: Report }) {
  const data = useRevenueByMonth(report)
  const yFormatter = (v: number) => `$${(v / 1000).toFixed(0)}k`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) =>
    typeof value === 'number' ? formatCurrency(value) : value

  if (report.chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={yFormatter} />
          <Tooltip formatter={tooltipFormatter} />
          <Line type="monotone" dataKey="revenue" stroke={PALETTE[0]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Revenue" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // default bar
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={yFormatter} />
        <Tooltip formatter={tooltipFormatter} />
        <Bar dataKey="revenue" fill={PALETTE[0]} radius={[4, 4, 0, 0]} name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}

function DealsByStageChart({ report }: { report: Report }) {
  const data = useDealsByStage(report)

  if (report.chartType === 'pie') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderLabel = ({ name, percent }: any) =>
      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="stage" cx="50%" cy="50%" outerRadius={110} label={renderLabel}>
            {data.map((entry, i) => <Cell key={entry.stage} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => [v, 'Deals']} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip formatter={(v) => [v, 'Deals']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => <Cell key={entry.stage} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function ContactsBySourceChart({ report }: { report: Report }) {
  const data = useContactsBySource(report)

  if (report.chartType === 'pie') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderLabel = ({ name, percent }: any) =>
      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={110} label={renderLabel}>
            {data.map((entry, i) => <Cell key={entry.status} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => [v, 'Contacts']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip formatter={(v) => [v, 'Contacts']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => <Cell key={entry.status} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function TasksByOwnerChart({ report }: { report: Report }) {
  const data = useTasksByOwner(report)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="owner" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip formatter={(v) => [v, 'Tasks']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => <Cell key={entry.owner} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function PipelineForecastChart({ report }: { report: Report }) {
  const data = usePipelineForecast(report)
  const yFormatter = (v: number) => `$${(v / 1000).toFixed(0)}k`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = ({ name, percent }: any) =>
    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFmt = (v: any) => [typeof v === 'number' ? formatCurrency(v) : v, 'Forecast']

  if (report.chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="forecast" nameKey="stage" cx="50%" cy="50%" outerRadius={110} label={renderLabel}>
            {data.map((entry, i) => <Cell key={entry.stage} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip formatter={tooltipFmt} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={yFormatter} />
        <Tooltip formatter={tooltipFmt} />
        <Bar dataKey="forecast" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => <Cell key={entry.stage} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// --------------------------------------------------------------------------
// Report type label map
// --------------------------------------------------------------------------

const TYPE_LABELS: Record<Report['type'], string> = {
  'revenue-by-month': 'Revenue by Month',
  'deals-by-stage': 'Deals by Stage',
  'contacts-by-source': 'Contacts by Status',
  'tasks-by-owner': 'Tasks by Owner',
  'pipeline-forecast': 'Pipeline Forecast',
  'custom': 'Custom Report',
}

// --------------------------------------------------------------------------
// Main export
// --------------------------------------------------------------------------

export function ReportChart({ report }: { report: Report }) {
  const title = TYPE_LABELS[report.type] ?? report.name

  function renderChart() {
    switch (report.type) {
      case 'revenue-by-month':
        return <RevenueByMonthChart report={report} />
      case 'deals-by-stage':
        return <DealsByStageChart report={report} />
      case 'contacts-by-source':
        return <ContactsBySourceChart report={report} />
      case 'tasks-by-owner':
        return <TasksByOwnerChart report={report} />
      case 'pipeline-forecast':
        return <PipelineForecastChart report={report} />
      default:
        return (
          <div className="flex h-60 items-center justify-center text-slate-400 text-sm">
            No chart available for this report type.
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{report.name || title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}
