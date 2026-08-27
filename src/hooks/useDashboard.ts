import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase, signOut } from '../lib/supabase'
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
  calculateDashboardStats,
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  calculateCategoryBudgets,
  filterDashboardTransactions,
} from '../lib/dashboardUtils'
import { calculateNextDueDate, getDueRecurringRules } from '../lib/recurringUtils'

import { getDateRangeForPreset, type DateFilterRange } from '../lib/dateUtils'

export function useDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Domain State
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [recurringRules, setRecurringRules] = useState<RecurringTransaction[]>([])

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  )
  const [dateRange, setDateRange] = useState<DateFilterRange>(() =>
    getDateRangeForPreset('THIS_MONTH')
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Profile & Modal State
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null)
  const [showAddTxModal, setShowAddTxModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showBankImportModal, setShowBankImportModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [savingsGoalModalMode, setSavingsGoalModalMode] = useState<'CREATE' | 'EDIT' | 'DEPOSIT'>('CREATE')
  const [targetDepositGoal, setTargetDepositGoal] = useState<SavingsGoal | null>(null)
  const [targetEditRule, setTargetEditRule] = useState<RecurringTransaction | null>(null)
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false)
  const [googleSheetsId, setGoogleSheetsId] = useState<string | null>(null)

  // Form State - New Transaction
  const [txAmount, setTxAmount] = useState('')
  const [txType, setTxType] = useState<TransactionType>('EXPENSE')
  const [txCategory, setTxCategory] = useState('')
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10))
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('CASH')
  const [txNote, setTxNote] = useState('')

  // Form State - New Custom Category
  const [catName, setCatName] = useState('')
  const [catType, setCatType] = useState<TransactionType>('EXPENSE')
  const [catColor, setCatColor] = useState('#6366f1')

  // Fetch Supabase Auth User & Sync DB Data
  useEffect(() => {
    // If this window is an OAuth popup callback, wait for Supabase session exchange before closing popup
    if (window.opener && window.opener !== window) {
      let isClosed = false
      const notifyAndClose = () => {
        if (isClosed) return
        isClosed = true
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'MEYKER_OAUTH_SUCCESS' }, window.location.origin)
          }
        } catch (e) {
          // ignore cross-origin errors
        }
        setTimeout(() => {
          try {
            window.close()
          } catch (e) {}
        }, 300)
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          notifyAndClose()
        }
      })

      const { data: popupListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session || event === 'SIGNED_IN') {
          notifyAndClose()
        }
      })

      const timer = setTimeout(() => {
        notifyAndClose()
      }, 3500)

      return () => {
        popupListener.subscription.unsubscribe()
        clearTimeout(timer)
      }
    }

    const loadLocalFallback = () => {
      try {
        const localGoals = localStorage.getItem('meyker_savings_goals')
        if (localGoals) {
          setSavingsGoals(JSON.parse(localGoals))
        }
        const localRules = localStorage.getItem('meyker_recurring_rules')
        if (localRules) {
          setRecurringRules(JSON.parse(localRules))
        }
        const localBudgets = localStorage.getItem('meyker_category_budgets')
        if (localBudgets) {
          const map: Record<string, number> = JSON.parse(localBudgets)
          setCategories((prev) =>
            prev.map((c) => (map[c.id] !== undefined ? { ...c, monthlyBudget: map[c.id] } : c))
          )
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }

    loadLocalFallback()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoadingAuth(false)

      if (session?.user) {
        fetchUserData(session.user.id)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoadingAuth(false)
      if (session?.user) {
        fetchUserData(session.user.id)
      }
    })

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MEYKER_OAUTH_SUCCESS') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setUser(session.user)
            fetchUserData(session.user.id)
          }
        })
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      authListener.subscription.unsubscribe()
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Auto-process due recurring rules
  useEffect(() => {
    if (recurringRules.length === 0) return

    const dueRules = getDueRecurringRules(recurringRules)
    if (dueRules.length === 0) return

    dueRules.forEach(async (rule) => {
      const matchedCat = categories.find((c) => c.id === rule.categoryId) || null
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

      setTransactions((prev) => [newTx, ...prev])
      setRecurringRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, nextDueDate: nextDue } : r))
      )

      if (user?.id) {
        try {
          await supabase.from('transactions').insert({
            user_id: user.id,
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
          console.error('[Dashboard Error] Auto-logging recurring rule failed:', err)
        }
      }
    })
  }, [recurringRules.length])

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch Profile Phone Number
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone_number, google_sheets_id')
        .eq('id', userId)
        .maybeSingle()

      if (profileData) {
        setUserPhoneNumber(profileData.phone_number)
        setGoogleSheetsId(profileData.google_sheets_id || null)
      }

      // Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${userId}`)

      if (catErr) {
        console.error('[Dashboard DB Error] Failed to fetch categories:', catErr.message || catErr)
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
        setCategories(loadedCategories)
      }

      // Fetch Savings Goals
      const { data: goalData, error: goalErr } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)

      if (goalErr) {
        console.warn('[Dashboard DB Warning] Failed to fetch savings_goals:', goalErr.message || goalErr)
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
        setSavingsGoals(formattedGoals)
        try {
          localStorage.setItem('meyker_savings_goals', JSON.stringify(formattedGoals))
        } catch (e) {}
      }

      // Fetch Recurring Transactions
      const { data: recurringData, error: recErr } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)

      if (recErr) {
        console.warn('[Dashboard DB Warning] Failed to fetch recurring_transactions:', recErr.message || recErr)
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
        setRecurringRules(formattedRules)
        try {
          localStorage.setItem('meyker_recurring_rules', JSON.stringify(formattedRules))
        } catch (e) {}
      }

      // Fetch Transactions
      let { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*, categories(*)')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })

      // Fallback if joined query fails due to missing relationship definition in DB
      if (txErr) {
        console.warn('[Dashboard DB Warning] Joined query failed, retrying plain transactions query:', txErr.message || txErr)
        const fallbackRes = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('transaction_date', { ascending: false })

        if (fallbackRes.error) {
          console.error('[Dashboard DB Error] Failed to fetch transactions:', fallbackRes.error.message || fallbackRes.error)
        } else {
          txData = fallbackRes.data
          txErr = null
        }
      }

      if (txData && !txErr) {
        setTransactions(
          txData.map((t: any) => {
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
        )
      }
    } catch (err) {
      console.error('[Dashboard Fetch Error]', err)
    }
  }

  // Handle Add Transaction
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txAmount || isNaN(Number(txAmount))) return

    const amountNum = Math.abs(Number(txAmount))
    const selectedCat = categories.find((c) => c.id === txCategory) || null

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user?.id || 'user-demo',
      categoryId: txCategory || null,
      amount: amountNum,
      type: txType,
      transactionDate: new Date(txDate).toISOString(),
      paymentMethod: txPaymentMethod,
      note: txNote,
      source: 'WEB',
      category: selectedCat,
    }

    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              category_id: txCategory || null,
              amount: amountNum,
              type: txType,
              transaction_date: new Date(txDate).toISOString(),
              payment_method: txPaymentMethod,
              note: txNote,
              source: 'WEB',
            },
          ])
          .select('*, categories(*)')

        if (error) {
          console.error('Error inserting transaction:', error)
          alert(`Failed to save transaction: ${error.message}`)
          return
        }

        if (data && data[0]) {
          const t = data[0]
          const insertedTx: Transaction = {
            id: t.id,
            userId: t.user_id,
            categoryId: t.category_id,
            amount: Number(t.amount),
            type: t.type,
            transactionDate: t.transaction_date,
            paymentMethod: t.payment_method,
            note: t.note,
            source: t.source,
            category: t.categories
              ? {
                  id: t.categories.id,
                  name: t.categories.name,
                  type: t.categories.type,
                  icon: t.categories.icon,
                  color: t.categories.color,
                  isDefault: t.categories.is_default,
                }
              : selectedCat,
          }
          setTransactions((prev) => [insertedTx, ...prev])
        }
      } catch (err: any) {
        console.error('Error inserting to DB:', err)
        alert(`Error saving transaction: ${err.message || err}`)
        return
      }
    } else {
      setTransactions((prev) => [newTx, ...prev])
    }

    setShowAddTxModal(false)
    setTxAmount('')
    setTxNote('')
  }

  // Handle Create Custom Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return

    const newCat: Category = {
      id: `cat-custom-${Date.now()}`,
      userId: user?.id || 'user-demo',
      name: catName.trim(),
      type: catType,
      icon: 'Tag',
      color: catColor,
      isDefault: false,
    }

    if (user?.id) {
      try {
        const { data } = await supabase
          .from('categories')
          .insert([
            {
              user_id: user.id,
              name: catName.trim(),
              type: catType,
              icon: 'Tag',
              color: catColor,
              is_default: false,
            },
          ])
          .select()
        if (data && data[0]) {
          newCat.id = data[0].id
        }
      } catch (err) {
        console.error('Error inserting category:', err)
      }
    }

    setCategories((prev) => [...prev, newCat])
    setCatName('')
    setShowCatModal(false)
  }

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return

    if (user?.id) {
      try {
        await supabase.from('transactions').delete().eq('id', id)
      } catch (err) {
        console.error('Error deleting from DB:', err)
      }
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  // Handle Receipt Extracted Data Auto-Fill
  const handleReceiptExtracted = (data: any) => {
    if (data.amount && data.amount > 0) {
      setTxAmount(String(data.amount))
    }
    if (data.type) {
      setTxType(data.type)
    }

    // Try matching category by hint or default to first category of same type
    if (data.categoryHint) {
      const hintLower = data.categoryHint.toLowerCase()
      const matchedCat = categories.find(
        (c) => c.type === data.type && c.name.toLowerCase().includes(hintLower)
      )
      if (matchedCat) {
        setTxCategory(matchedCat.id)
      } else {
        const fallbackCat = categories.find((c) => c.type === data.type)
        if (fallbackCat) setTxCategory(fallbackCat.id)
      }
    }

    if (data.transactionDate) {
      setTxDate(data.transactionDate)
    }
    if (data.paymentMethod) {
      setTxPaymentMethod(data.paymentMethod)
    }
    if (data.note || data.merchantName) {
      setTxNote(data.note || (data.merchantName ? `Purchase at ${data.merchantName}` : 'Receipt Scan'))
    }

    setShowReceiptModal(false)
    setShowAddTxModal(true)
  }

  const handleImportBankTransactions = async (
    txs: {
      date: string
      amount: number
      type: 'INCOME' | 'EXPENSE'
      categoryId: string
      note: string
      paymentMethod: 'BANK_TRANSFER'
    }[]
  ) => {
    if (!user) return

    const insertPayloads = txs.map((t) => ({
      user_id: user.id,
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

      setTransactions((prev) => [...formattedInserted, ...prev])
    }
  }

  // Derived Calculations
  const filteredTransactions = useMemo(
    () =>
      filterDashboardTransactions(transactions, {
        dateRange,
        selectedMonth,
        typeFilter,
        categoryFilter,
        searchQuery,
      }),
    [transactions, dateRange, selectedMonth, typeFilter, categoryFilter, searchQuery]
  )

  const stats = useMemo(
    () => calculateDashboardStats(transactions, dateRange || selectedMonth),
    [transactions, dateRange, selectedMonth]
  )

  const categoryBreakdownData = useMemo(
    () => calculateCategoryBreakdown(transactions, dateRange || selectedMonth, categories),
    [transactions, dateRange, selectedMonth, categories]
  )

  const monthlyTrendData = useMemo(
    () => calculateMonthlyTrend(transactions),
    [transactions]
  )

  const categoryBudgetsData = useMemo(
    () => calculateCategoryBudgets(transactions, dateRange || selectedMonth, categories),
    [transactions, dateRange, selectedMonth, categories]
  )

  const handleSaveCategoryBudgets = async (updatedMap: Record<string, number | null>) => {
    let nextCategories: Category[] = []
    setCategories((prev) => {
      nextCategories = prev.map((c) => {
        if (updatedMap[c.id] !== undefined) {
          return { ...c, monthlyBudget: updatedMap[c.id] }
        }
        return c
      })
      return nextCategories
    })

    try {
      const budgetMap: Record<string, number | null> = {}
      nextCategories.forEach((c) => {
        if (c.monthlyBudget) budgetMap[c.id] = c.monthlyBudget
      })
      localStorage.setItem('meyker_category_budgets', JSON.stringify(budgetMap))
    } catch (e) {}

    if (user) {
      for (const [catId, budgetVal] of Object.entries(updatedMap)) {
        const { error } = await supabase
          .from('categories')
          .update({ monthly_budget: budgetVal })
          .eq('id', catId)

        if (error) {
          console.error('[Dashboard DB Error] Failed to update category budget:', error.message || error)
        }
      }
    }
  }

  const handleCreateSavingsGoal = async (goal: {
    name: string
    targetAmount: number
    initialDeposit: number
    color: string
    targetDate?: string | null
  }) => {
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      userId: user?.id || 'demo-user',
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.initialDeposit,
      color: goal.color,
      icon: 'Target',
      targetDate: goal.targetDate,
      createdAt: new Date().toISOString(),
    }

    setSavingsGoals((prev) => {
      const next = [newGoal, ...prev]
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    if (user) {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.initialDeposit,
          color: goal.color,
          icon: 'Target',
          target_date: goal.targetDate,
        })
        .select()
        .single()

      if (error) {
        console.error('[Dashboard DB Error] Failed to create savings goal:', error.message || error)
      } else if (data) {
        setSavingsGoals((prev) => {
          const next = prev.map((g) => (g.id === newGoal.id ? { ...g, id: data.id } : g))
          try {
            localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
          } catch (e) {}
          return next
        })
      }
    }
  }

  const handleDepositSavingsGoal = async (goalId: string, depositAmount: number) => {
    let updatedGoal: SavingsGoal | undefined
    setSavingsGoals((prev) => {
      const next = prev.map((g) => {
        if (g.id === goalId) {
          const updated = { ...g, currentAmount: g.currentAmount + depositAmount }
          updatedGoal = updated
          return updated
        }
        return g
      })
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    if (user && updatedGoal) {
      const { error } = await supabase
        .from('savings_goals')
        .update({ current_amount: updatedGoal.currentAmount })
        .eq('id', goalId)

      if (error) {
        console.error('[Dashboard DB Error] Failed to update savings goal deposit:', error.message || error)
      }
    }
  }

  const handleUpdateSavingsGoal = async (
    goalId: string,
    fields: { name: string; targetAmount: number; currentAmount: number; color: string }
  ) => {
    setSavingsGoals((prev) => {
      const next = prev.map((g) => (g.id === goalId ? { ...g, ...fields } : g))
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    if (user) {
      const { error } = await supabase
        .from('savings_goals')
        .update({
          name: fields.name,
          target_amount: fields.targetAmount,
          current_amount: fields.currentAmount,
          color: fields.color,
        })
        .eq('id', goalId)

      if (error) {
        console.error('[Dashboard DB Error] Failed to update savings goal:', error.message || error)
      }
    }
  }

  const handleDeleteSavingsGoal = async (goalId: string) => {
    setSavingsGoals((prev) => {
      const next = prev.filter((g) => g.id !== goalId)
      try {
        localStorage.setItem('meyker_savings_goals', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    if (user) {
      const { error } = await supabase.from('savings_goals').delete().eq('id', goalId)
      if (error) {
        console.error('[Dashboard DB Error] Failed to delete savings goal:', error.message || error)
      }
    }
  }

  const handleCreateRecurringRule = async (rule: {
    title: string
    amount: number
    type: TransactionType
    categoryId: string
    paymentMethod: PaymentMethod
    frequency: RecurringFrequency
    startDate: string
  }) => {
    const newRule: RecurringTransaction = {
      id: `rule-${Date.now()}`,
      userId: user?.id || 'demo-user',
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

    setRecurringRules((prev) => {
      const next = [newRule, ...prev]
      try {
        localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    if (user) {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
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

      if (error) {
        console.error('[Dashboard DB Error] Failed to create recurring rule:', error.message || error)
      } else if (data) {
        setRecurringRules((prev) => {
          const next = prev.map((r) => (r.id === newRule.id ? { ...r, id: data.id } : r))
          try {
            localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
          } catch (e) {}
          return next
        })
      }
    }
  }

  const handleToggleRecurringRule = async (ruleId: string, currentActive: boolean) => {
    const nextActive = !currentActive
    setRecurringRules((prev) => {
      const next = prev.map((r) => (r.id === ruleId ? { ...r, isActive: nextActive } : r))
      try {
        localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    if (user) {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ is_active: nextActive })
        .eq('id', ruleId)

      if (error) {
        console.error('[Dashboard DB Error] Failed to toggle recurring rule:', error.message || error)
      }
    }
  }

  const handleUpdateRecurringRule = async (
    ruleId: string,
    fields: {
      amount: number
      frequency: RecurringFrequency
      paymentMethod: PaymentMethod
      startDate: string
    }
  ) => {
    setRecurringRules((prev) => {
      const next = prev.map((r) =>
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
      return next
    })

    if (user) {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({
          amount: fields.amount,
          frequency: fields.frequency,
          payment_method: fields.paymentMethod,
          start_date: fields.startDate,
          next_due_date: fields.startDate,
        })
        .eq('id', ruleId)

      if (error) {
        console.error('[Dashboard DB Error] Failed to update recurring rule:', error.message || error)
      }
    }
  }

  const handleDeleteRecurringRule = async (ruleId: string) => {
    setRecurringRules((prev) => {
      const next = prev.filter((r) => r.id !== ruleId)
      try {
        localStorage.setItem('meyker_recurring_rules', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    if (user) {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', ruleId)
      if (error) {
        console.error('[Dashboard DB Error] Failed to delete recurring rule:', error.message || error)
      }
    }
  }

  return {
    navigate,
    user,
    loadingAuth,
    signOut,

    // Data State
    categories,
    transactions,
    filteredTransactions,
    stats,
    categoryBreakdownData,
    monthlyTrendData,
    categoryBudgetsData,
    savingsGoals,
    recurringRules,

    // Filter State
    selectedMonth,
    setSelectedMonth,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,

    // Modal Visibility State
    showAddTxModal,
    setShowAddTxModal,
    showCatModal,
    setShowCatModal,
    showExportModal,
    setShowExportModal,
    showWhatsAppModal,
    setShowWhatsAppModal,
    showReceiptModal,
    setShowReceiptModal,
    showBankImportModal,
    setShowBankImportModal,
    showBudgetModal,
    setShowBudgetModal,
    showSavingsGoalModal,
    setShowSavingsGoalModal,
    showRecurringModal,
    setShowRecurringModal,
    savingsGoalModalMode,
    setSavingsGoalModalMode,
    targetDepositGoal,
    setTargetDepositGoal,
    targetEditRule,
    setTargetEditRule,
    showGoogleSheetsModal,
    setShowGoogleSheetsModal,
    googleSheetsId,
    setGoogleSheetsId,
    handleReceiptExtracted,
    handleImportBankTransactions,
    userPhoneNumber,
    setUserPhoneNumber,

    // Add Transaction Form State
    txAmount,
    setTxAmount,
    txType,
    setTxType,
    txCategory,
    setTxCategory,
    txDate,
    setTxDate,
    txPaymentMethod,
    setTxPaymentMethod,
    txNote,
    setTxNote,

    // Add Category Form State
    catName,
    setCatName,
    catType,
    setCatType,
    catColor,
    setCatColor,

    // Event Handlers
    handleCreateTransaction,
    handleCreateCategory,
    handleDeleteTransaction,
    handleSaveCategoryBudgets,
    handleCreateSavingsGoal,
    handleDepositSavingsGoal,
    handleUpdateSavingsGoal,
    handleDeleteSavingsGoal,
    handleCreateRecurringRule,
    handleUpdateRecurringRule,
    handleToggleRecurringRule,
    handleDeleteRecurringRule,
  }
}
