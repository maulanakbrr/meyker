import { describe, it, expect, beforeEach } from 'vitest'
import { useFinanceStore } from '../useFinanceStore'

describe('useFinanceStore', () => {
  beforeEach(() => {
    useFinanceStore.setState({
      categories: [],
      transactions: [],
      savingsGoals: [],
      recurringRules: [],
      isLoadingData: false,
    })
  })

  it('loads demo data properly', () => {
    useFinanceStore.getState().loadDemoData()
    const state = useFinanceStore.getState()
    expect(state.categories.length).toBeGreaterThan(0)
    expect(state.transactions.length).toBeGreaterThan(0)
    expect(state.savingsGoals.length).toBeGreaterThan(0)
    expect(state.recurringRules.length).toBeGreaterThan(0)
  })

  it('creates and deletes transactions in demo mode', async () => {
    useFinanceStore.getState().setCategories([
      { id: 'cat-1', name: 'Food', type: 'EXPENSE', icon: 'Tag', color: '#ff0000', isDefault: true },
    ])

    await useFinanceStore.getState().createTransaction({
      amount: 50000,
      type: 'EXPENSE',
      categoryId: 'cat-1',
      transactionDate: '2026-09-21',
      paymentMethod: 'CASH',
      note: 'Lunch',
      isDemoMode: true,
    })

    const state = useFinanceStore.getState()
    expect(state.transactions.length).toBe(1)
    expect(state.transactions[0].amount).toBe(50000)
    expect(state.transactions[0].category?.name).toBe('Food')

    const txId = state.transactions[0].id
    await useFinanceStore.getState().deleteTransaction(txId, undefined, true)
    expect(useFinanceStore.getState().transactions.length).toBe(0)
  })

  it('manages savings goals (create, deposit, update, delete)', async () => {
    await useFinanceStore.getState().createSavingsGoal({
      name: 'Emergency Fund',
      targetAmount: 10000000,
      initialDeposit: 2000000,
      color: '#10b981',
      isDemoMode: true,
    })

    let state = useFinanceStore.getState()
    expect(state.savingsGoals.length).toBe(1)
    const goalId = state.savingsGoals[0].id
    expect(state.savingsGoals[0].currentAmount).toBe(2000000)

    // Deposit
    await useFinanceStore.getState().depositSavingsGoal(goalId, 500000, undefined, true)
    state = useFinanceStore.getState()
    expect(state.savingsGoals[0].currentAmount).toBe(2500000)

    // Update
    await useFinanceStore.getState().updateSavingsGoal(
      goalId,
      { name: 'Updated Fund', targetAmount: 15000000, currentAmount: 2500000, color: '#10b981' },
      undefined,
      true
    )
    state = useFinanceStore.getState()
    expect(state.savingsGoals[0].name).toBe('Updated Fund')
    expect(state.savingsGoals[0].targetAmount).toBe(15000000)

    // Delete
    await useFinanceStore.getState().deleteSavingsGoal(goalId, undefined, true)
    expect(useFinanceStore.getState().savingsGoals.length).toBe(0)
  })

  it('manages recurring rules (create, toggle, delete)', async () => {
    await useFinanceStore.getState().createRecurringRule({
      title: 'Spotify',
      amount: 54000,
      type: 'EXPENSE',
      categoryId: null,
      paymentMethod: 'CREDIT_CARD',
      frequency: 'MONTHLY',
      startDate: '2026-09-21',
      isDemoMode: true,
    })

    let state = useFinanceStore.getState()
    expect(state.recurringRules.length).toBe(1)
    const rule = state.recurringRules[0]
    expect(rule.isActive).toBe(true)

    // Toggle
    await useFinanceStore.getState().toggleRecurringRule(rule.id, true, undefined, true)
    state = useFinanceStore.getState()
    expect(state.recurringRules[0].isActive).toBe(false)

    // Delete
    await useFinanceStore.getState().deleteRecurringRule(rule.id, undefined, true)
    expect(useFinanceStore.getState().recurringRules.length).toBe(0)
  })
})
