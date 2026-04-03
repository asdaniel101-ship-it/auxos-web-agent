'use client'

import { Wrench, Check, AlertCircle } from 'lucide-react'
import type { AuxosTheme, ToolResult } from '../types'

interface ToolMessageProps {
  toolName: string
  result: ToolResult
  theme: AuxosTheme
}

function formatToolName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function summarizeResult(result: ToolResult): string {
  if (!result.success) return result.error || 'Failed'
  if (!result.data) return 'Done'
  if (typeof result.data === 'object' && result.data !== null) {
    const d = result.data as Record<string, unknown>
    // Common patterns: { name, id }, { updatedCount }, { navigate }
    if (d.name) return String(d.name)
    if (d.updatedCount) return `${d.updatedCount} updated`
    if (d.navigate) return `→ ${d.navigate}`
    if (d.id) return `ID: ${d.id}`
    // For compound results (onboard_client), summarize top-level keys
    const keys = Object.keys(d)
    if (keys.length <= 4) return keys.join(', ')
  }
  return 'Done'
}

export function ToolMessage({ toolName, result, theme }: ToolMessageProps) {
  const Icon = result.success ? Check : AlertCircle
  const iconColor = result.success ? '#22c55e' : '#ef4444'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        padding: '6px 10px',
        borderRadius: theme.radii.button,
        backgroundColor: result.success ? 'rgba(34, 197, 94, 0.06)' : 'rgba(239, 68, 68, 0.06)',
        border: `1px solid ${result.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
        fontSize: '12px',
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.body,
      }}
    >
      <Wrench style={{ height: '12px', width: '12px', flexShrink: 0, color: theme.colors.textMuted }} />
      <span style={{ fontWeight: 500 }}>{formatToolName(toolName)}</span>
      <span style={{ color: theme.colors.textMuted }}>—</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {summarizeResult(result)}
      </span>
      <Icon style={{ height: '12px', width: '12px', flexShrink: 0, color: iconColor }} />
    </div>
  )
}
