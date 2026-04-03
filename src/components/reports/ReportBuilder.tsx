'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { ChartType, Report } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
  BarChart2,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Briefcase,
  CheckSquare,
  DollarSign,
} from 'lucide-react'

interface ReportBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ReportType = Report['type']

const REPORT_TYPES: {
  value: ReportType
  label: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'revenue-by-month', label: 'Revenue by Month', description: 'Closed Won deal revenue aggregated by month', Icon: DollarSign },
  { value: 'deals-by-stage', label: 'Deals by Stage', description: 'Count of deals at each pipeline stage', Icon: Briefcase },
  { value: 'contacts-by-source', label: 'Contacts by Status', description: 'Contact distribution across statuses', Icon: Users },
  { value: 'tasks-by-owner', label: 'Tasks by Owner', description: 'Number of tasks per assignee', Icon: CheckSquare },
  { value: 'pipeline-forecast', label: 'Pipeline Forecast', description: 'Weighted forecast value per open stage', Icon: TrendingUp },
]

const CHART_TYPES: { value: ChartType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'bar', label: 'Bar', Icon: BarChart2 },
  { value: 'line', label: 'Line', Icon: LineChart },
  { value: 'pie', label: 'Pie', Icon: PieChart },
]

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation']

const TOTAL_STEPS = 5

interface BuilderState {
  type: ReportType
  startDate: string
  endDate: string
  owner: string
  stage: string
  chartType: ChartType
  name: string
}

const DEFAULT_STATE: BuilderState = {
  type: 'revenue-by-month',
  startDate: '',
  endDate: '',
  owner: '',
  stage: '',
  chartType: 'bar',
  name: '',
}

export function ReportBuilder({ open, onOpenChange }: ReportBuilderProps) {
  const addReport = useStore((s) => s.addReport)
  const teamMembers = useStore((s) => s.teamMembers)
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [state, setState] = useState<BuilderState>(DEFAULT_STATE)

  const update = (patch: Partial<BuilderState>) => setState((prev) => ({ ...prev, ...patch }))

  const reset = () => {
    setStep(1)
    setState(DEFAULT_STATE)
  }

  const handleClose = (val: boolean) => {
    if (!val) reset()
    onOpenChange(val)
  }

  const handleSubmit = () => {
    const reportName = state.name.trim() || `${REPORT_TYPES.find((t) => t.value === state.type)?.label} Report`
    addReport({
      name: reportName,
      type: state.type,
      chartType: state.chartType,
      filters: {
        ...(state.owner ? { owner: state.owner } : {}),
        ...(state.stage ? { stage: state.stage } : {}),
      },
      dateRange: { start: state.startDate, end: state.endDate },
    })
    toast({ title: 'Report created', description: `"${reportName}" has been saved.` })
    handleClose(false)
  }

  const stepTitle = [
    'Select Report Type',
    'Set Date Range',
    'Apply Filters',
    'Choose Chart Type',
    'Name Your Report',
  ][step - 1]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Custom Report</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-indigo-500' : 'bg-slate-200'
              )}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Step {step} of {TOTAL_STEPS}: {stepTitle}
        </p>

        {/* Step 1 – Report type */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-2">
            {REPORT_TYPES.map(({ value, label, description, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ type: value })}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                  state.type === value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className={cn('rounded-md p-1.5 mt-0.5', state.type === value ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500')}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 – Date range */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={state.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={state.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 3 – Filters */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select value={state.owner || '__all__'} onValueChange={(v) => update({ owner: v === '__all__' ? '' : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All owners</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(state.type === 'deals-by-stage' || state.type === 'pipeline-forecast') && (
              <div className="space-y-1.5">
                <Label>Stage</Label>
                <Select value={state.stage || '__all__'} onValueChange={(v) => update({ stage: v === '__all__' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All stages</SelectItem>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step 4 – Chart type */}
        {step === 4 && (
          <div className="grid grid-cols-3 gap-3">
            {CHART_TYPES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ chartType: value })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  state.chartType === value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className={cn('rounded-md p-2', state.chartType === value ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500')}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={cn('text-sm font-medium', state.chartType === value ? 'text-indigo-700' : 'text-slate-700')}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 5 – Name */}
        {step === 5 && (
          <div className="space-y-1.5">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder={`${REPORT_TYPES.find((t) => t.value === state.type)?.label} Report`}
              value={state.name}
              onChange={(e) => update({ name: e.target.value })}
              autoFocus
            />
            <p className="text-xs text-slate-500">Leave blank to use the default name.</p>
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Create Report</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
