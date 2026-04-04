import { EmailThread, EmailMessage } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface EmailDraft {
  to: string
  subject: string
  body: string
  linkedContactId: string
  linkedDealId: string
}

export interface EmailsSlice {
  emailThreads: EmailThread[]
  setEmailThreads: (emailThreads: EmailThread[]) => void
  addEmailThread: (thread: Omit<EmailThread, 'id' | 'createdAt'>) => EmailThread
  replyToThread: (threadId: string, message: Omit<EmailMessage, 'id' | 'timestamp'>) => void
  emailDraft: EmailDraft | null
  composeOpen: boolean
  setEmailDraft: (draft: EmailDraft) => void
  setComposeOpen: (open: boolean) => void
}

export const createEmailsSlice: StateCreator<EmailsSlice> = (set) => ({
  emailThreads: [],
  setEmailThreads: (emailThreads) => set({ emailThreads }),
  addEmailThread: (data) => {
    const thread: EmailThread = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ emailThreads: [...state.emailThreads, thread] }))
    return thread
  },
  replyToThread: (threadId, message) => {
    const newMessage: EmailMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      emailThreads: state.emailThreads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, newMessage] } : t
      ),
    }))
  },
  emailDraft: null,
  composeOpen: false,
  setEmailDraft: (draft) => set({ emailDraft: draft, composeOpen: true }),
  setComposeOpen: (open) => set(open ? { composeOpen: true } : { composeOpen: false, emailDraft: null }),
})
