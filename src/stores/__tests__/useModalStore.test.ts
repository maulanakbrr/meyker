import { describe, it, expect, beforeEach } from 'vitest'
import { useModalStore } from '../useModalStore'
import type { SavingsGoal, RecurringTransaction } from '../../types'

describe('useModalStore', () => {
  beforeEach(() => {
    useModalStore.getState().closeModal()
  })

  it('initializes with activeModal null', () => {
    const state = useModalStore.getState()
    expect(state.activeModal).toBeNull()
    expect(state.targetGoal).toBeNull()
    expect(state.targetRule).toBeNull()
  })

  it('opens a simple modal and closes it', () => {
    useModalStore.getState().openModal('ADD_TRANSACTION')
    expect(useModalStore.getState().activeModal).toBe('ADD_TRANSACTION')

    useModalStore.getState().closeModal()
    expect(useModalStore.getState().activeModal).toBeNull()
  })

  it('opens savings goal modal with mode and targetGoal', () => {
    const mockGoal: SavingsGoal = {
      id: 'g-1',
      userId: 'u-1',
      name: 'Vacation',
      targetAmount: 5000,
      currentAmount: 1000,
      color: '#ff0000',
      icon: 'Target',
    }

    useModalStore.getState().openSavingsGoal('DEPOSIT', mockGoal)
    const state = useModalStore.getState()
    expect(state.activeModal).toBe('SAVINGS_GOAL')
    expect(state.savingsGoalMode).toBe('DEPOSIT')
    expect(state.targetGoal).toEqual(mockGoal)
  })

  it('opens recurring rule modal with targetRule', () => {
    const mockRule: RecurringTransaction = {
      id: 'r-1',
      userId: 'u-1',
      title: 'Netflix',
      amount: 15,
      type: 'EXPENSE',
      categoryId: 'c-1',
      paymentMethod: 'CREDIT_CARD',
      frequency: 'MONTHLY',
      startDate: '2026-01-01',
      nextDueDate: '2026-02-01',
      isActive: true,
    }

    useModalStore.getState().openRecurring(mockRule)
    const state = useModalStore.getState()
    expect(state.activeModal).toBe('RECURRING_TRANSACTION')
    expect(state.targetRule).toEqual(mockRule)
  })
})
