import { create } from 'zustand'
import type { TransactionType } from '../../types'

export interface CategoryFormData {
  name: string
  type: TransactionType
  color: string
}

interface CategoryFormState extends CategoryFormData {
  setName: (name: string) => void
  setType: (type: TransactionType) => void
  setColor: (color: string) => void
  setFormData: (data: Partial<CategoryFormData>) => void
  resetForm: () => void
}

const initialState: CategoryFormData = {
  name: '',
  type: 'EXPENSE',
  color: '#6366f1',
}

export const useCategoryFormStore = create<CategoryFormState>((set) => ({
  ...initialState,
  setName: (name) => set({ name }),
  setType: (type) => set({ type }),
  setColor: (color) => set({ color }),
  setFormData: (data) => set((state) => ({ ...state, ...data })),
  resetForm: () => set(initialState),
}))
