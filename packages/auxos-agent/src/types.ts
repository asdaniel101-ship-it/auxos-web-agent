/** A tool the agent can use. Combines the schema (sent to Claude) with the execute function (runs client-side). */
export interface AuxosTool {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
  /** Called client-side when Claude invokes this tool. */
  execute: (input: Record<string, unknown>) => ToolResult | Promise<ToolResult>
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

/** Schema-only version of a tool, safe to send over the wire. */
export interface ToolSchema {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

// ─── Display messages ───

export type DisplayMessage =
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string }
  | { type: 'tool'; toolName: string; toolInput: Record<string, unknown>; result: ToolResult }

// ─── Theme ───

export interface AuxosTheme {
  colors: {
    primary: string
    primaryDark: string
    primaryLight: string
    primaryAlpha: string
    background: string
    surface: string
    surfaceBorder: string
    text: string
    textSecondary: string
    textMuted: string
    userBubble: string
    userBubbleText: string
    assistantBubble: string
    assistantBubbleBorder: string
    assistantBubbleText: string
    inputBackground: string
    inputBorder: string
    /** Glassmorphism panel background */
    glassBg: string
    /** Glassmorphism surface tint */
    glassSurface: string
    /** Glass border color */
    glassBorder: string
  }
  fonts: {
    body: string
  }
  radii: {
    panel: string
    bubble: string
    button: string
    input: string
  }
  spacing: {
    panelPadding: string
    messagePadding: string
  }
}

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }

// ─── Config ───

export interface AuxosConfig {
  /** Tool definitions — schemas are sent to Claude, execute functions run client-side. */
  tools: AuxosTool[]
  /** API endpoint that handles Claude communication. */
  endpoint: string
  /** Agent display name. */
  name?: string
  /** Short tagline below the name. */
  tagline?: string
  /** Suggestion chips shown in empty state. */
  suggestions?: string[]
  /** Called when the agent triggers a navigation action (tool result contains { navigate: '/path' }). */
  onNavigate?: (path: string) => void
  /** Returns extra context sent with each request (e.g., current page, user info). */
  getContext?: () => Record<string, unknown>
  /** System prompt — can also be set server-side via createApiHandler. */
  systemPrompt?: string
  /** Theme override. Partial — missing values derived from defaults. */
  theme?: DeepPartial<AuxosTheme>
  /** Optional event callback for logging/analytics. */
  onEvent?: (event: AuxosEvent) => void
  /** Max tool execution iterations before stopping. Defaults to 10. */
  maxIterations?: number
  /** Whether the user is currently idle (triggers orb alert state). */
  isIdle?: boolean
  /** Contextual message to show in the speech bubble when idle. */
  idleMessage?: string
  /** Called when the user dismisses the idle alert. */
  onIdleDismiss?: () => void
  /** Called when the panel opens or closes. */
  onOpenChange?: (isOpen: boolean) => void
  /** When true, hides the panel and entry point (orb/button) without interrupting the agent loop. */
  minimized?: boolean
  /** When true, dims the orb to indicate the agent is busy executing actions. */
  executing?: boolean
}

export type AuxosEvent =
  | { type: 'message_sent'; content: string }
  | { type: 'response_start' }
  | { type: 'response_text'; text: string }
  | { type: 'tool_start'; toolName: string; input: Record<string, unknown> }
  | { type: 'tool_end'; toolName: string; result: ToolResult }
  | { type: 'response_end' }
  | { type: 'tools_done' }
  | { type: 'error'; error: string; retryable: boolean }
  | { type: 'stopped' }
  | { type: 'done' }
  | { type: 'ask_user'; question: string; respond: (answer: string) => void }

/** Server-side API handler configuration. */
export interface ApiHandlerConfig {
  /** Tool schemas (required). Accepts AuxosTool[], ToolSchema[], or Anthropic SDK Tool[]. */
  tools: AuxosTool[] | ToolSchema[] | any[]
  /** System prompt or function that builds one from request context. */
  systemPrompt?: string | ((context: Record<string, unknown>) => string)
  /** Claude model to use. Defaults to 'claude-sonnet-4-6'. */
  model?: string
  /** Max tokens. Defaults to 4096. */
  maxTokens?: number
  /** Anthropic API key. Defaults to ANTHROPIC_API_KEY env var. */
  apiKey?: string
  /** Enable streaming. Defaults to true. */
  stream?: boolean
}

// ─── Tool builder types ───

export interface CrudField {
  type: 'string' | 'number' | 'boolean' | 'array'
  description?: string
  enum?: string[]
  items?: { type: string }
}

export interface CrudConfig {
  entity: string
  plural?: string
  fields: Record<string, CrudField | string>
  required?: string[]
  filters?: string[]
  execute: {
    list: (filters: Record<string, unknown>) => unknown
    get: (id: string) => unknown
    create: (data: Record<string, unknown>) => unknown
    update: (id: string, data: Record<string, unknown>) => unknown
    delete?: (id: string) => unknown
  }
}

export interface SearchConfig {
  scope: string
  description: string
  execute: (query: string) => unknown
}

export interface NavigationConfig {
  pages: string[]
  onNavigate: (page: string) => void
}
