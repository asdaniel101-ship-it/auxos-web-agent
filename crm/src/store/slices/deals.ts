import { Deal, DealStage } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface DealsSlice {
  deals: Deal[]
  setDeals: (deals: Deal[]) => void
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Deal
  updateDeal: (id: string, data: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  moveDealStage: (id: string, stage: DealStage) => void
}

export const createDealsSlice: StateCreator<DealsSlice> = (set) => ({
  deals: [],
  setDeals: (deals) => set({ deals }),
  addDeal: (data) => {
    const deal: Deal = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ deals: [...state.deals, deal] }))
    return deal
  },
  updateDeal: (id, data) =>
    set((state) => ({
      deals: state.deals.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),
  deleteDeal: (id) =>
    set((state) => ({ deals: state.deals.filter((d) => d.id !== id) })),
  moveDealStage: (id, stage) =>
    set((state) => ({
      deals: state.deals.map((d) => (d.id === id ? { ...d, stage } : d)),
    })),
})
