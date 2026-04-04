import { Contact } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface ContactsSlice {
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact
  updateContact: (id: string, data: Partial<Contact>) => void
  deleteContact: (id: string) => void
  bulkUpdateContacts: (ids: string[], data: Partial<Contact>) => void
}

export const createContactsSlice: StateCreator<ContactsSlice> = (set, get) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (data) => {
    const contact: Contact = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ contacts: [...state.contacts, contact] }))
    return contact
  },
  updateContact: (id, data) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteContact: (id) =>
    set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
  bulkUpdateContacts: (ids, data) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (ids.includes(c.id) ? { ...c, ...data } : c)),
    })),
})
