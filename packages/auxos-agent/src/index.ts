// Components
export { AuxosAgent } from './components/AuxosAgent'
export { AgentPanel } from './components/AgentPanel'
export { AgentButton } from './components/AgentButton'
export { AgentMessage } from './components/AgentMessage'
export { ToolMessage } from './components/ToolMessage'
export { SiriOrb } from './components/SiriOrb'
export { SpeechBubble } from './components/SpeechBubble'

// Hooks
export { useAgent } from './hooks/useAgent'

// Theme
export { createTheme, defaultTheme } from './theme'

// Tool builders
export { crud, search, navigation, custom } from './tools/builder'

// Types
export type {
  AuxosTool,
  AuxosConfig,
  AuxosTheme,
  AuxosEvent,
  DisplayMessage,
  ToolResult,
  ToolSchema,
  ApiHandlerConfig,
  CrudConfig,
  CrudField,
  SearchConfig,
  NavigationConfig,
} from './types'

export type { OrbState } from './components/SiriOrb'
