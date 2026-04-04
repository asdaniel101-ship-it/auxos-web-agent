'use client'

import { useStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export function ActivityFeed() {
  const activities = useStore((s) => s.activities)
  const recent = activities.slice(0, 20)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
