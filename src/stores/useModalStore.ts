import { create } from 'zustand'
import type { SavingsGoal, RecurringTransaction } from '../types'

export type ModalType =
  | 'ADD_TRANSACTION'
  | 'CATEGORY_MANAGEMENT'
  | 'EXPORT'
  | 'WHATSAPP_SETTINGS'
  | 'RECEIPT_UPLOAD'
  | 'BANK_IMPORT'
  | 'CATEGORY_BUDGET'
  | 'SAVINGS_GOAL'
  | 'RECURRING_TRANSACTION'
  | 'GOOGLE_SHEETS'
  | null

export interface ModalPayload {
  savingsGoalMode?: 'CREATE' | 'EDIT' | 'DEPOSIT'
  targetGoal?: SavingsGoal | null
  targetRule?: RecurringTransaction | null
}

interface ModalState {
  activeModal: ModalType
  savingsGoalMode: 'CREATE' | 'EDIT' | 'DEPOSIT'
  targetGoal: SavingsGoal | null
  targetRule: RecurringTransaction | null

  openModal: (modal: ModalType, payload?: ModalPayload) => void
  closeModal: () => void
  openSavingsGoal: (mode: 'CREATE' | 'EDIT' | 'DEPOSIT', targetGoal?: SavingsGoal | null) => void
  openRecurring: (targetRule?: RecurringTransaction | null) => void
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  savingsGoalMode: 'CREATE',
  targetGoal: null,
  targetRule: null,

  openModal: (modal, payload) =>
    set({
      activeModal: modal,
      savingsGoalMode: payload?.savingsGoalMode ?? 'CREATE',
      targetGoal: payload?.targetGoal ?? null,
      targetRule: payload?.targetRule ?? null,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      targetGoal: null,
      targetRule: null,
    }),

  openSavingsGoal: (mode, targetGoal = null) =>
    set({
      activeModal: 'SAVINGS_GOAL',
      savingsGoalMode: mode,
      targetGoal,
    }),

  openRecurring: (targetRule = null) =>
    set({
      activeModal: 'RECURRING_TRANSACTION',
      targetRule,
    }),
}))
