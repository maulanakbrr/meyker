import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  Transaction,
  Category,
  TransactionType,
  PaymentMethod,
  SavingsGoal,
  RecurringTransaction,
  RecurringFrequency,
} from '../types'
import {
  MOCK_CATEGORIES,
  MOCK_TRANSACTIONS,
  MOCK_SAVINGS_GOALS,
  MOCK_RECURRING_RULES,
} from '../lib/mockData'
import { calculateNextDueDate, getDueRecurringRules } from '../lib/recurringUtils'

export interface FinanceState {
  categories: Category[]
  transactions: Transaction[]
  savingsGoals: SavingsGoal[]
  recurringRules: RecurringTransaction[]
  isLoadingData: boolean

  setCategories: (categories: Category[]) => void
  setTransactions: (transactions: Transaction[]) => void
  setSavingsGoals: (goals: SavingsGoal[]) => void
  setRecurringRules: (rules: RecurringTransaction[]) => void

  loadDemoData: () => void
  loadLocalFallback: () => void
  fetchUserData: (userId: string) => Promise<void>

  createTransaction: (tx: {
    amount: number
    type: TransactionType
    categoryId: string | null
    transactionDate: string
    paymentMethod: PaymentMethod
    note?: string
    userId?: string
    isDemoMode?: boolean
  }) => Promise<void>
  deleteTransaction: (id: string, userId?: string, isDemoMode?: boolean) => Promise<void>
  importBankTransactions: (
    txs: {
      date: string
      amount: number
      type: 'INCOME' | 'EXPENSE'
      categoryId: string
      note: string
      paymentMethod: 'BANK_TRANSFER'
    }[],
    userId?: string
  ) => Promise<void>

  createCategory: (cat: {
    name: string
    type: TransactionType
    color: string
    userId?: string
    isDemoMode?: boolean
  }) => Promise<Category>
  saveCategoryBudgets: (
    map: Record<string, number | null>,
    userId?: string,
    isDemoMode?: boolean
  ) => Promise<void>

  createSavingsGoal: (goal: {
    name: string
    targetAmount: number
    initialDeposit: number
    color: string
    targetDate?: string | null
    userId?: string
    isDemoMode?: boolean
  }) => Promise<void>
  depositSavingsGoal: (goalId: string, amount: number, userId?: string, isDemoMode?: boolean) => Promise<void>
  updateSavingsGoal: (
    goalId: string,
    fields: { name: string; targetAmount: number; currentAmount: number; color: string },
    userId?: string,
    isDemoMode?: boolean
  ) => Promise<void>
  deleteSavingsGoal: (goalId: string, userId?: string, isDemoMode?: boolean) => Promise<void>

  createRecurringRule: (rule: {
    title: string
    amount: number
    type: TransactionType
    categoryId: string | null
    paymentMethod: PaymentMethod
    frequency: RecurringFrequency
    startDate: string
    userId?: string
    isDemoMode?: boolean
  }) => Promise<void>
  updateRecurringRule: (
    ruleId: string,
    fields: {
      amount: number
      frequency: RecurringFrequency
      paymentMethod: PaymentMethod
      startDate: string
    },
    userId?: string,
    isDemoMode?: boolean
  ) => Promise<void>
  toggleRecurringRule: (ruleId: string, currentActive: boolean, userId?: string, isDemoMode?: boolean) => Promise<void>
  deleteRecurringRule: (ruleId: string, userId?: string, isDemoMode?: boolean) => Promise<void>
  processDueRecurringRules: (userId?: string, isDemoMode?: boolean) => Promise<void>
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  categories: [],
  transactions: [],
  savingsGoals: [],
  recurringRules: [],
  isLoadingData: false,

  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }),
  setSavingsGoals: (savingsGoals) => set({ savingsGoals }),
  setRecurringRules: (recurringRules) => set({ recurringRules }),

  loadDemoData: () => {
    set({
      categories: MOCK_CATEGORIES,
      transactions: MOCK_TRANSACTIONS,
      savingsGoals: MOCK_SAVINGS_GOALS,
      recurringRules: MOCK_RECURRING_RULES,
      isLoadingData: false,
    })
  },

  loadLocalFallback: () => {
    try {
      const localGoals = localStorage.getItem('meyker_savings_goals')
      if (localGoals) {
        set({ savingsGoals: JSON.parse(localGoals) })
      }
      const localRules = localStorage.getItem('meyker_recurring_rules')
      if (localRules) {
        set({ recurringRules: JSON.parse(localRules) })
      }
      const localBudgets = localStorage.getItem('meyker_category_budgets')
      if (localBudgets) {
        const map: Record<string, number> = JSON.parse(localBudgets)
        set((state) => ({
          categories: state.categories.map((c) =>
            map[c.id] !== undefined ? { ...c, monthlyBudget: map[c.id] } : c
          ),
        }))
      }
    } catch (e) {
      // ignore JSON parse error
    }
  },

  fetchUserData: async (userId: string) => {
    set({ isLoadingData: true })
    try {
      // 1. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${userId}`)

      if (catErr) {
        console.error('[FinanceStore] Failed to fetch categories:', catErr.message || catErr)
      }

      let loadedCategories: Category[] = []
      if (catData && catData.length > 0) {
        loadedCategories = catData.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color,
          isDefault: c.is_default,
          monthlyBudget: c.monthly_budget ? Number(c.monthly_budget) : null,
        }))
        set({ categories: loadedCategories })
      }

      // 2. Fetch Savings Goals
      const { data: goalData, error: goalErr } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)

      if (goalErr) {
        console.warn('[FinanceStore] Failed to fetch savings_goals:', goalErr.message || goalErr)
      }

      if (goalData && goalData.length > 0) {
        const formattedGoals = goalData.map((g: any) => ({
          id: g.id,
          userId: g.user_id,
          name: g.name,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          color: g.color,
          icon: g.icon,
          targetDate: g.target_date,
          createdAt: g.created_at,
        }))
        set({ savingsGoals: formattedGoals })
        try {
          localStorage.setItem('meyker_savings_goals', JSON.stringify(formattedGoals))
        } catch (e) {}
      }

      // 3. Fetch Recurring Transactions
      const { data: recurringData, error: recErr } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)

      if (recErr) {
        console.warn('[FinanceStore] Failed to fetch recurring_transactions:', recErr.message || recErr)
      }

      if (recurringData && recurringData.length > 0) {
        const formattedRules: RecurringTransaction[] = recurringData.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          amount: Number(r.amount),
          type: r.type,
          categoryId: r.category_id,
          paymentMethod: r.payment_method,
          frequency: r.frequency,
          startDate: r.start_date,
          nextDueDate: r.next_due_date,
          isActive: r.is_active,
          createdAt: r.created_at,
        }))
        set({ recurringRules: formattedRules })
        try {
          localStorage.setItem('meyker_recurring_rules', JSON.stringify(formattedRules))
        } catch (e) {}
      }

      // 4. Fetch Transactions
      let { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*, categories(*)')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })

      if (txErr) {
        console.warn('[FinanceStore] Joined query failed, retrying plain query:', txErr.message || txErr)
        const fallbackRes = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('transaction_date', { ascending: false })

        if (fallbackRes.error) {
          console.error('[FinanceStore] Failed to fetch transactions:', fallbackRes.error.message || fallbackRes.error)
        } else {
          txData = fallbackRes.data
        }
      }

      if (txData) {
        const mappedTransactions = txData.map((t: any) => {
          const rawCat = Array.isArray(t.categories) ? t.categories[0] : t.categories
          const matchedCat = rawCat
            ? {
                id: rawCat.id,
                name: rawCat.name,
                type: rawCat.type,
                icon: rawCat.icon,
                color: rawCat.color,
                isDefault: rawCat.is_default,
              }
            : loadedCategories.find((c) => c.id === t.category_id) || null

          return {
            id: t.id,
            userId: t.user_id,
            categoryId: t.category_id,
            amount: Number(t.amount),
            type: t.type,
            transactionDate: t.transaction_date,
            paymentMethod: t.payment_method,
            note: t.note,
            source: t.source,
            category: matchedCat,
          }
        })
        set({ transactions: mappedTransactions })
      }
    } catch (err) {
      console.error('[FinanceStore] Fetch error:', err)
    } finally {
      set({ isLoadingData: false })
    }
  },

  createTransaction: async ({
    amount,
    type,
    categoryId,
    transactionDate,
    paymentMethod,
    note,
    userId,
    isDemoMode,
  }) => {
    const categories = get().categories
    const selectedCat = categories.find((c) => c.id === categoryId) || null

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: userId || 'user-demo',
      categoryId: categoryId || null,
      amount,
      type,
      transactionDate: new Date(transactionDate).toISOString(),
      paymentMethod,
      note: note || null,
      source: 'WEB',
      category: selectedCat,
    }

    if (userId && !isDemoMode) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            category_id: categoryId || null,
            amount,
            type,
            transaction_date: new Date(transactionDate).toISOString(),
            payment_method: paymentMethod,
            note: note || null,
            source: 'WEB',
          },
        ])
        .select('*, categories(*)')

      if (error) {
        console.error('[FinanceStore] Error inserting transaction:', error)
        throw error
      }

      if (data && data[0]) {
        const t = data[0]
        newTx.id = t.id
        if (t.categories) {
          newTx.category = {
            id: t.categories.id,
            name: t.categories.name,
            type: t.categories.type,
            icon: t.categories.icon,
            color: t.categories.color,
            isDefault: t.categories.is_default,
          }
        }
      }
    }

    set((state) => ({ transactions: [newTx, ...state.transactions] }))
  },

  deleteTransaction: async (id, userId, isDemoMode) => {
    if (userId && !isDemoMode) {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) {
        console.error('[FinanceStore] Error deleting transaction:', error)
      }
    }
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }))
  },

  importBankTransactions: async (txs, userId) => {
    if (!userId) return

    const insertPayloads = txs.map((t) => ({
      user_id: userId,
      amount: t.amount,
      type: t.type,
      category_id: t.categoryId,
      payment_method: t.paymentMethod,
      note: t.note,
      transaction_date: t.date,
      source: 'IMPORT',
    }))

    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert(insertPayloads)
      .select('*, category:categories(*)')

    if (error) throw error

    if (inserted) {
      const formattedInserted: Transaction[] = inserted.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        amount: Number(row.amount),
        type: row.type,
        categoryId: row.category_id,
        category: row.category,
        paymentMethod: row.payment_method,
        note: row.note,
        source: row.source || 'IMPORT',
        transactionDate: row.transaction_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))

      set((state) => ({ transactions: [...formattedInserted, ...state.transactions] }))
    }
  },

  createCategory: async ({ name, type, color, userId, isDemoMode }) => {
    const newCat: Category = {
      id: `cat-custom-${Date.now()}`,
      userId: userId || 'user-demo',
      name: name.trim(),
      type,
      icon: 'Tag',
      color,
      isDefault: false,
    }

    if (userId && !isDemoMode) {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            user_id: userId,
            name: name.trim(),
            type,
            icon: 'Tag',
            color,
            is_default: false,
          },
        ])
        .select()

      if (!error && data && data[0]) {
        newCat.id = data[0].id
      }
    }

    set((state) => ({ categories: [...state.categories, newCat] }))
    return newCat
  },

  saveCategoryBudgets: async (updatedMap, userId, isDemoMode) => {
    let nextCategories: Category[] = []
    set((state) => {
      nextCategories = state.categories.map((c) => {
        if (updatedMap[c.id] !== undefined) {
          return { ...c, monthlyBudget: updatedMap[c.id] }
        }
        return c
      })
      return { categories: nextCategories }
    })

    try {
      const budgetMap: Record<string, number | null> = {}
      nextCategories.forEach((c) => {
        if (c.monthlyBudget) budgetMap[c.id] = c.monthlyBudget
      })
      localStorage.setItem('meyker_category_budgets', JSON.stringify(budgetMap))
    } catch (e) {}

    if (userId && !isDemoMode) {
      for (const [catId, budgetVal] of Object.entries(updatedMap)) {
        await supabase.from('categories').update({ monthly_budget: budgetVal }).eq('id', catId)
      }
    }
  },

  createSavingsGoal: async ({ name, targetAmount, initialDeposit, color, targetDate, userId, isDemoMode }) => {
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      userId: userId || 'demo-user',
      name,
      targetAmount,
      currentAmount: initialDeposit,
      color,
      icon: 'Target',
      targetDate,
      createdAt: new Date().toISOString(),
    }

    set((state) => {
      const next = [newGoal, ...state.savingsGoals]
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return { savingsGoals: next }
    })

    if (userId && !isDemoMode) {
      const { data } = await supabase
        .from('savings_goals')
        .insert({
          user_id: userId,
          name,
          target_amount: targetAmount,
          current_amount: initialDeposit,
          color,
          icon: 'Target',
          target_date: targetDate,
        })
        .select()
        .single()

      if (data) {
        set((state) => {
          const next = state.savingsGoals.map((g) => (g.id === newGoal.id ? { ...g, id: data.id } : g))
          try {
            localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
          } catch (e) {}
          return { savingsGoals: next }
        })
      }
    }
  },

  depositSavingsGoal: async (goalId, amount, userId, isDemoMode) => {
    let updatedGoal: SavingsGoal | undefined
    set((state) => {
      const next = state.savingsGoals.map((g) => {
        if (g.id === goalId) {
          const updated = { ...g, currentAmount: g.currentAmount + amount }
          updatedGoal = updated
          return updated
        }
        return g
      })
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return { savingsGoals: next }
    })

    if (userId && updatedGoal && !isDemoMode) {
      await supabase
        .from('savings_goals')
        .update({ current_amount: updatedGoal.currentAmount })
        .eq('id', goalId)
    }
  },

  updateSavingsGoal: async (goalId, fields, userId, isDemoMode) => {
    set((state) => {
      const next = state.savingsGoals.map((g) => (g.id === goalId ? { ...g, ...fields } : g))
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return { savingsGoals: next }
    })

    if (userId && !isDemoMode) {
      await supabase.from('savings_goals').update(fields).eq('id', goalId)
    }
  },

  deleteSavingsGoal: async (goalId, userId, isDemoMode) => {
    set((state) => {
      const next = state.savingsGoals.filter((g) => g.id !== goalId)
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return { savingsGoals: next }
    })

    if (userId && !isDemoMode) {
      await supabase.from('savings_goals').delete().eq('id', goalId)
    }
  },

  createRecurringRule: async (rule) => {
    const newRule: RecurringTransaction = {
      id: `rule-${Date.now()}`,
      userId: rule.userId || 'demo-user',
      title: rule.title,
      amount: rule.amount,
      type: rule.type,
      categoryId: rule.categoryId || null,
      paymentMethod: rule.paymentMethod,
      frequency: rule.frequency,
      startDate: rule.startDate,
      nextDueDate: rule.startDate,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    set((state) => {
      const next = [newRule, ...state.recurringRules]
      try {
        localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
      } catch (e) {}
      return { recurringRules: next }
    })

    if (rule.userId && !rule.isDemoMode) {
      const { data } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: rule.userId,
          title: rule.title,
          amount: rule.amount,
          type: rule.type,
          category_id: rule.categoryId || null,
          payment_method: rule.paymentMethod,
          frequency: rule.frequency,
          start_date: rule.startDate,
          next_due_date: rule.startDate,
          is_active: true,
        })
        .select()
        .single()

      if (data) {
        set((state) => {
          const next = state.recurringRules.map((r) => (r.id === newRule.id ? { ...r, id: data.id } : r))
          try {
            localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
          } catch (e) {}
          return { recurringRules: next }
        })
      }
    }
  },

  updateRecurringRule: async (ruleId, fields, userId, isDemoMode) => {
    set((state) => {
      const next = state.recurringRules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              amount: fields.amount,
              frequency: fields.frequency,
              paymentMethod: fields.paymentMethod,
              startDate: fields.startDate,
              nextDueDate: fields.startDate,
            }
          : r
      )
      try {
        localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
      } catch (e) {}
      return { recurringRules: next }
    })

    if (userId && !isDemoMode) {
      await supabase
        .from('recurring_transactions')
        .update({
          amount: fields.amount,
          frequency: fields.frequency,
          payment_method: fields.paymentMethod,
          start_date: fields.startDate,
          next_due_date: fields.startDate,
        })
        .eq('id', ruleId)
    }
  },

  toggleRecurringRule: async (ruleId, currentActive, userId, isDemoMode) => {
    const nextActive = !currentActive
    set((state) => {
      const next = state.recurringRules.map((r) => (r.id === ruleId ? { ...r, isActive: nextActive } : r))
      try {
        localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
      } catch (e) {}
      return { recurringRules: next }
    })

    if (userId && !isDemoMode) {
      await supabase.from('recurring_transactions').update({ is_active: nextActive }).eq('id', ruleId)
    }
  },

  deleteRecurringRule: async (ruleId, userId, isDemoMode) => {
    set((state) => {
      const next = state.recurringRules.filter((r) => r.id !== ruleId)
      try {
        localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
      } catch (e) {}
      return { recurringRules: next }
    })

    if (userId && !isDemoMode) {
      await supabase.from('recurring_transactions').delete().eq('id', ruleId)
    }
  },

  processDueRecurringRules: async (userId, isDemoMode) => {
    const recurringRules = get().recurringRules
    if (recurringRules.length === 0) return

    const dueRules = getDueRecurringRules(recurringRules)
    if (dueRules.length === 0) return

    for (const rule of dueRules) {
      const matchedCat = get().categories.find((c) => c.id === rule.categoryId) || null
      const newTx: Transaction = {
        id: `tx-rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: rule.userId,
        categoryId: rule.categoryId,
        amount: rule.amount,
        type: rule.type,
        transactionDate: rule.nextDueDate,
        paymentMethod: rule.paymentMethod,
        note: `Auto-recurring: ${rule.title}`,
        source: 'RECURRING',
        category: matchedCat,
      }

      const nextDue = calculateNextDueDate(rule.nextDueDate, rule.frequency)

      set((state) => ({
        transactions: [newTx, ...state.transactions],
        recurringRules: state.recurringRules.map((r) =>
          r.id === rule.id ? { ...r, nextDueDate: nextDue } : r
        ),
      }))

      if (userId && !isDemoMode) {
        try {
          await supabase.from('transactions').insert({
            user_id: userId,
            category_id: rule.categoryId,
            amount: rule.amount,
            type: rule.type,
            transaction_date: rule.nextDueDate,
            payment_method: rule.paymentMethod,
            note: `Auto-recurring: ${rule.title}`,
            source: 'RECURRING',
          })

          await supabase
            .from('recurring_transactions')
            .update({ next_due_date: nextDue })
            .eq('id', rule.id)
        } catch (err) {
          console.error('[FinanceStore] Auto-logging recurring rule failed:', err)
        }
      }
    }
  },
}))
