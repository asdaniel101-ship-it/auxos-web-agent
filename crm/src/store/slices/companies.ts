import { Company } from '@/types'
import { StateCreator } from 'zustand'
import { generateId } from '@/lib/utils'

export interface CompaniesSlice {
  companies: Company[]
  setCompanies: (companies: Company[]) => void
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Company
  updateCompany: (id: string, data: Partial<Company>) => void
  deleteCompany: (id: string) => void
}

export const createCompaniesSlice: StateCreator<CompaniesSlice> = (set) => ({
  companies: [],
  setCompanies: (companies) => set({ companies }),
  addCompany: (data) => {
    const company: Company = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((state) => ({ companies: [...state.companies, company] }))
    return company
  },
  updateCompany: (id, data) =>
    set((state) => ({
      companies: state.companies.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteCompany: (id) =>
    set((state) => ({ companies: state.companies.filter((c) => c.id !== id) })),
})
