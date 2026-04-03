export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}
