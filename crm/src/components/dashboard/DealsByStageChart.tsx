'use client'

import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { DealStage } from '@/types'

const STAGES: DealStage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
]

// Custom bar shape with rounded top corners
function RoundedBar(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill } = props
  const radius = 4
  if (height <= 0) return null
  return (
    <path
      d={`M${x},${y + height} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} Z`}
      fill={fill}
    />
  )
}

export function DealsByStageChart() {
  const deals = useStore((s) => s.deals)

  const data = STAGES.map((stage) => ({
    stage: stage.replace(' ', '\n'),
    displayStage: stage,
    count: deals.filter((d) => d.stage === stage).length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Deals by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="displayStage"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip formatter={(value) => [value, 'Deals']} />
            <Bar dataKey="count" shape={<RoundedBar />}>
              {data.map((entry) => (
                <Cell key={entry.displayStage} fill="#6366f1" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
