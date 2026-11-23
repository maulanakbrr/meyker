import { create } from 'zustand'
import type { TransactionType, PaymentMethod } from '../../types'

export interface TransactionFormData {
  amount: string
  type: TransactionType
  categoryId: string
  date: string
  paymentMethod: PaymentMethod
  note: string
}

interface TransactionFormState extends TransactionFormData {
  setAmount: (amount: string) => void
  setType: (type: TransactionType) => void
  setCategory: (categoryId: string) => void
  setDate: (date: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setNote: (note: string) => void
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
}

export const useTransactionFormStore = create<TransactionFormState>((set) => ({
  ...initialState,
  setAmount: (amount) => set({ amount }),
  setType: (type) => set({ type, categoryId: '' }),
  setCategory: (categoryId) => set({ categoryId }),
  setDate: (date) => set({ date }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setNote: (note) => set({ note }),
  setFormData: (data) => set((state) => ({ ...state, ...data })),
  resetForm: () => set({ ...initialState, date: getDefaultDate() }),
}))
