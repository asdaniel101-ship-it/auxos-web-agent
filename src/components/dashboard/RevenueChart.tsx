'use client'

import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function buildLast12MonthsData(
  deals: { stage: string; value: number; closeDate: string }[]
) {
  const now = new Date()
  const months: { label: string; key: string }[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    months.push({ label, key })
  }

  const revenueByMonth: Record<string, number> = {}
  for (const { key } of months) {
    revenueByMonth[key] = 0
  }

  for (const deal of deals) {
    if (deal.stage !== 'Closed Won') continue
    const key = deal.closeDate.slice(0, 7)
    if (key in revenueByMonth) {
      revenueByMonth[key] += deal.value
    }
  }

  return months.map(({ label, key }) => ({
    month: label,
    revenue: revenueByMonth[key],
  }))
}

export function RevenueChart() {
  const deals = useStore((s) => s.deals)
  const data = buildLast12MonthsData(deals)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Revenue (12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === 'number'
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                    }).format(value)
                  : value
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
