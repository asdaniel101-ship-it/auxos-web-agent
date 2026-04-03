'use client'

import { useStore } from '@/store'
import { Report, ChartType } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart2, LineChart, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportFiltersProps {
  report: Report
  onChange: (updates: Partial<Report>) => void
}

const CHART_TYPES: { value: ChartType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'bar', label: 'Bar', Icon: BarChart2 },
  { value: 'line', label: 'Line', Icon: LineChart },
  { value: 'pie', label: 'Pie', Icon: PieChart },
]

export function ReportFilters({ report, onChange }: ReportFiltersProps) {
  const teamMembers = useStore((s) => s.teamMembers)

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    onChange({
      dateRange: {
        ...report.dateRange,
        [field]: value,
      },
    })
  }

  const handleOwnerChange = (value: string) => {
    onChange({
      filters: {
        ...report.filters,
        owner: value === '__all__' ? '' : value,
      },
    })
  }

  const handleChartTypeChange = (type: ChartType) => {
    onChange({ chartType: type })
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Date range */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label className="text-xs text-slate-500">Start Date</Label>
        <Input
          type="date"
          value={report.dateRange?.start ?? ''}
          onChange={(e) => handleDateChange('start', e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label className="text-xs text-slate-500">End Date</Label>
        <Input
          type="date"
          value={report.dateRange?.end ?? ''}
          onChange={(e) => handleDateChange('end', e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Owner filter */}
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <Label className="text-xs text-slate-500">Owner</Label>
        <Select
          value={report.filters?.owner || '__all__'}
          onValueChange={handleOwnerChange}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="All owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All owners</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.name}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart type toggle */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-slate-500">Chart Type</Label>
        <div
          className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5"
          role="group"
          aria-label="Chart type"
        >
          {CHART_TYPES.map(({ value, label, Icon }) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              onClick={() => handleChartTypeChange(value)}
              aria-label={`${label} chart`}
              aria-pressed={report.chartType === value}
              className={cn(
                'h-7 px-3 rounded-md transition-colors gap-1.5',
                report.chartType === value
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
