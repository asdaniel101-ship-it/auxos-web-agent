'use client'

import { useStore } from '@/store'
import { Settings } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type NotificationKey = keyof Settings['notifications']

interface NotificationRow {
  key: NotificationKey
  label: string
  description: string
}

const ROWS: NotificationRow[] = [
  {
    key: 'email',
    label: 'Email Notifications',
    description: 'Receive email notifications for important updates',
  },
  {
    key: 'inApp',
    label: 'In-App Notifications',
    description: 'Show notifications within the application',
  },
  {
    key: 'dailyDigest',
    label: 'Daily Digest',
    description: 'Receive a daily summary email',
  },
]

export function NotificationsTab() {
  const notifications = useStore((s) => s.settings.notifications)
  const updateSettings = useStore((s) => s.updateSettings)
  const { toast } = useToast()

  function handleToggle(key: NotificationKey, value: boolean) {
    updateSettings({ notifications: { ...notifications, [key]: value } })
    const label = ROWS.find((r) => r.key === key)?.label ?? key
    toast({
      title: value ? 'Notification enabled' : 'Notification disabled',
      description: `${label} has been turned ${value ? 'on' : 'off'}.`,
    })
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how and when you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {ROWS.map((row) => (
              <li key={row.key} className="flex items-center justify-between py-4 gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-900">{row.label}</p>
                  <p className="text-xs text-slate-500">{row.description}</p>
                </div>
                <Switch
                  checked={notifications[row.key]}
                  onCheckedChange={(checked) => handleToggle(row.key, checked)}
                  aria-label={row.label}
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
