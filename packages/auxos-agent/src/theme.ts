import type { AuxosTheme } from './types'

export function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const defaultTheme: AuxosTheme = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#dbeafe',
    primaryAlpha: 'rgba(59, 130, 246, 0.08)',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceBorder: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    userBubble: '#3b82f6',
    userBubbleText: '#ffffff',
    assistantBubble: '#ffffff',
    assistantBubbleBorder: '#e2e8f0',
    assistantBubbleText: '#1e293b',
    inputBackground: '#f8fafc',
    inputBorder: '#e2e8f0',
    glassBg: 'rgba(15, 17, 23, 0.7)',
    glassSurface: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  fonts: {
    body: 'inherit',
  },
  radii: {
    panel: '16px',
    bubble: '12px',
    button: '8px',
    input: '12px',
  },
  spacing: {
    panelPadding: '16px',
    messagePadding: '8px 12px',
  },
}

/** Create a theme by merging partial overrides with defaults. */
export function createTheme(overrides: { colors?: Partial<AuxosTheme['colors']>; fonts?: Partial<AuxosTheme['fonts']>; radii?: Partial<AuxosTheme['radii']>; spacing?: Partial<AuxosTheme['spacing']> }): AuxosTheme {
  const primary = overrides.colors?.primary || defaultTheme.colors.primary
  // Auto-derive colors from primary if not explicitly set
  const derivedColors = {
    primaryDark: adjustColor(primary, -30),
    primaryLight: hexToRgba(primary, 0.15),
    primaryAlpha: hexToRgba(primary, 0.08),
    userBubble: primary,
  }

  return {
    colors: { ...defaultTheme.colors, ...derivedColors, ...overrides.colors },
    fonts: { ...defaultTheme.fonts, ...overrides.fonts },
    radii: { ...defaultTheme.radii, ...overrides.radii },
    spacing: { ...defaultTheme.spacing, ...overrides.spacing },
  }
}
