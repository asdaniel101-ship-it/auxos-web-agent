'use client'

import { KpiCards } from '@/components/dashboard/KpiCards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { DealsByStageChart } from '@/components/dashboard/DealsByStageChart'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <KpiCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <DealsByStageChart />
      </div>
      <ActivityFeed />
    </div>
  )
}
