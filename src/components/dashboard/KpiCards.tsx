'use client'

import { useStore } from '@/store'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Handshake, CheckSquare, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function KpiCards() {
  const deals = useStore((s) => s.deals)
  const tasks = useStore((s) => s.tasks)
  const contacts = useStore((s) => s.contacts)

  const totalRevenue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.value, 0)

  const openDealsCount = deals.filter(
    (d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost'
  ).length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)
  const tasksDueTodayCount = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate.slice(0, 10) === todayStr
  ).length

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const newContactsThisWeek = contacts.filter(
    (c) => new Date(c.createdAt) >= oneWeekAgo
  ).length

  const kpis = [
    {
      icon: DollarSign,
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      iconClass: 'text-green-600 bg-green-100',
    },
    {
      icon: Handshake,
      title: 'Open Deals',
      value: openDealsCount.toString(),
      iconClass: 'text-blue-600 bg-blue-100',
    },
    {
      icon: CheckSquare,
      title: 'Tasks Due Today',
      value: tasksDueTodayCount.toString(),
      iconClass: 'text-orange-600 bg-orange-100',
    },
    {
      icon: Users,
      title: 'New Contacts This Week',
      value: newContactsThisWeek.toString(),
      iconClass: 'text-purple-600 bg-purple-100',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-2 ${kpi.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
