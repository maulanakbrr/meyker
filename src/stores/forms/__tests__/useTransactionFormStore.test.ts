import { describe, it, expect, beforeEach } from 'vitest'
import { useTransactionFormStore } from '../useTransactionFormStore'

describe('useTransactionFormStore', () => {
  beforeEach(() => {
    useTransactionFormStore.getState().resetForm()
  })

  it('initializes with default values', () => {
    const state = useTransactionFormStore.getState()
    expect(state.amount).toBe('')
    expect(state.type).toBe('EXPENSE')
    expect(state.categoryId).toBe('')
    expect(state.paymentMethod).toBe('CASH')
    expect(state.note).toBe('')
  })

  it('updates individual fields', () => {
    const store = useTransactionFormStore.getState()
    store.setAmount('50000')
    store.setType('INCOME')
    store.setCategory('cat-salary')
    store.setDate('2026-09-21')
    store.setPaymentMethod('BANK_TRANSFER')
    store.setNote('Monthly Salary')

    const updated = useTransactionFormStore.getState()
    expect(updated.amount).toBe('50000')
    expect(updated.type).toBe('INCOME')
    expect(updated.categoryId).toBe('cat-salary')
    expect(updated.date).toBe('2026-09-21')
    expect(updated.paymentMethod).toBe('BANK_TRANSFER')
    expect(updated.note).toBe('Monthly Salary')
  })

  it('prefills form via setFormData (for receipt scanning)', () => {
    useTransactionFormStore.getState().setFormData({
      amount: '125000',
      type: 'EXPENSE',
      note: 'Grocery receipt',
    })

    const state = useTransactionFormStore.getState()
    expect(state.amount).toBe('125000')
    expect(state.type).toBe('EXPENSE')
    expect(state.note).toBe('Grocery receipt')
  })

  it('resets form back to defaults', () => {
    const store = useTransactionFormStore.getState()
    store.setAmount('99999')
    store.setNote('To be cleared')
    store.resetForm()

    const state = useTransactionFormStore.getState()
    expect(state.amount).toBe('')
    expect(state.note).toBe('')
    expect(state.type).toBe('EXPENSE')
  })
})
