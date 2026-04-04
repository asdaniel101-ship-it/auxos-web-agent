'use client'

import { useStore } from '@/store'
import { Settings } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Mail, Calendar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type IntegrationKey = keyof Settings['integrations']

interface IntegrationCard {
  key: IntegrationKey
  name: string
  description: string
  Icon: LucideIcon
}

const INTEGRATIONS: IntegrationCard[] = [
  {
    key: 'slack',
    name: 'Slack',
    description: 'Send CRM notifications and deal updates directly to Slack channels.',
    Icon: MessageSquare,
  },
  {
    key: 'gmail',
    name: 'Gmail',
    description: 'Sync emails and automatically log conversations against contacts and deals.',
    Icon: Mail,
  },
  {
    key: 'calendar',
    name: 'Calendar',
    description: 'Connect your calendar to schedule meetings and track follow-ups.',
    Icon: Calendar,
  },
]

export function IntegrationsTab() {
  const integrations = useStore((s) => s.settings.integrations)
  const updateSettings = useStore((s) => s.updateSettings)
  const { toast } = useToast()

  function handleToggle(key: IntegrationKey, value: boolean) {
    updateSettings({ integrations: { ...integrations, [key]: value } })
    const name = INTEGRATIONS.find((i) => i.key === key)?.name ?? key
    toast({
      title: value ? `${name} connected` : `${name} disconnected`,
      description: value
        ? `Your ${name} account has been connected successfully.`
        : `Your ${name} account has been disconnected.`,
    })
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Integrations</h2>
        <p className="text-xs text-slate-500 mt-0.5">Connect your favourite tools to streamline your workflow.</p>
      </div>
      <div className="space-y-3">
        {INTEGRATIONS.map(({ key, name, description, Icon }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{name}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500">
                  {integrations[key] ? 'Connected' : 'Disconnected'}
                </span>
                <Switch
                  checked={integrations[key]}
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                  aria-label={`Toggle ${name} integration`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
