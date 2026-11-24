import { create } from 'zustand'
import type { TransactionType, PaymentMethod } from '../../types'

export interface TransactionFormData {
  amount: string
  type: TransactionType
  categoryId: string
  date: string
  paymentMethod: PaymentMethod
  note: string
  tags: string[]
}

interface TransactionFormState extends TransactionFormData {
  setAmount: (amount: string) => void
  setType: (type: TransactionType) => void
  setCategory: (categoryId: string) => void
  setDate: (date: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setNote: (note: string) => void
  setTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  setFormData: (data: Partial<TransactionFormData>) => void
  resetForm: () => void
}

const getDefaultDate = () => new Date().toISOString().slice(0, 10)

const initialState: TransactionFormData = {
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  date: getDefaultDate(),
  paymentMethod: 'CASH',
  note: '',
  tags: [],
}

export const useTransactionFormStore = create<TransactionFormState>((set) => ({
  ...initialState,
  setAmount: (amount) => set({ amount }),
  setType: (type) => set({ type, categoryId: '' }),
  setCategory: (categoryId) => set({ categoryId }),
  setDate: (date) => set({ date }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setNote: (note) => set({ note }),
  setTags: (tags) => set({ tags }),
  addTag: (tag) =>
    set((state) => {
      const clean = tag.trim().replace(/^#/, '').toLowerCase()
      if (!clean || state.tags.includes(clean)) return state
      return { tags: [...state.tags, clean] }
    }),
  removeTag: (tagToRemove) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.toLowerCase() !== tagToRemove.trim().replace(/^#/, '').toLowerCase()),
    })),
  setFormData: (data) => set((state) => ({ ...state, ...data })),
  resetForm: () => set({ ...initialState, date: getDefaultDate() }),
}))
