import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import type {
  TransactionType,
  PaymentMethod,
  SavingsGoal,
  RecurringTransaction,
  RecurringFrequency,
} from '../types'
import {
  useAuthStore,
  useFilterStore,
  useFinanceStore,
  useModalStore,
  useTransactionFormStore,
  useCategoryFormStore,
} from '../stores'
import { useDashboardMetrics } from './useDashboardMetrics'

export function useDashboard() {
  const navigate = useNavigate()

  // Domain & State Stores
  const auth = useAuthStore()
  const filter = useFilterStore()
  const finance = useFinanceStore()
  const modal = useModalStore()
  const txForm = useTransactionFormStore()
  const catForm = useCategoryFormStore()

  // Computed Metrics
  const metrics = useDashboardMetrics()

  // Session & Data Initialization
  useEffect(() => {
    const isDemoRoute = typeof window !== 'undefined' && window.location.pathname === '/demo'
    const isDemo = isDemoRoute || localStorage.getItem('meyker_demo_mode') === 'true'

    if (isDemo) {
      auth.setIsDemoMode(true)
      auth.setUser({ id: 'demo-user', email: 'demo@meyker.local' })
      auth.setLoadingAuth(false)
      finance.loadDemoData()
      return
    }

    // Handle OAuth popup window callback
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
          // ignore cross-origin error
        }
        setTimeout(() => {
          try {
            window.close()
          } catch (e) {}
        }, 300)
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) notifyAndClose()
      })

      const { data: popupListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session || event === 'SIGNED_IN') notifyAndClose()
      })

      const timer = setTimeout(() => notifyAndClose(), 3500)
      return () => {
        popupListener.subscription.unsubscribe()
        clearTimeout(timer)
      }
    }

    // Load Local Fallbacks
    finance.loadLocalFallback()

    // Supabase Session Fetch & Subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      auth.setUser(session?.user ?? null)
      auth.setLoadingAuth(false)
      if (session?.user) {
        fetchUserData(session.user.id)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      auth.setUser(session?.user ?? null)
      auth.setLoadingAuth(false)
      if (session?.user) {
        fetchUserData(session.user.id)
      }
    })

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MEYKER_OAUTH_SUCCESS') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            auth.setUser(session.user)
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

  // Auto-process due recurring rules on mount or rule count change
  useEffect(() => {
    if (finance.recurringRules.length === 0) return
    finance.processDueRecurringRules(auth.user?.id, auth.isDemoMode)
  }, [finance.recurringRules.length])

  // Fetch User Profile and Data
  const fetchUserData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone_number, google_sheets_id')
        .eq('id', userId)
        .maybeSingle()

      if (profileData) {
        auth.setUserPhoneNumber(profileData.phone_number)
        auth.setGoogleSheetsId(profileData.google_sheets_id || null)
      }

      await finance.fetchUserData(userId)
    } catch (err) {
      console.error('[Dashboard] fetchUserData error:', err)
    }
  }

  // Handlers
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = useTransactionFormStore.getState()
    const rawAmount = form.amount
    if (!rawAmount || isNaN(Number(rawAmount))) return

    try {
      await finance.createTransaction({
        amount: Math.abs(Number(rawAmount)),
        type: form.type,
        categoryId: form.categoryId || null,
        transactionDate: form.date,
        paymentMethod: form.paymentMethod,
        note: form.note,
        userId: auth.user?.id,
        isDemoMode: auth.isDemoMode,
      })
      modal.closeModal()
      txForm.resetForm()
    } catch (err: any) {
      alert(`Error saving transaction: ${err.message || err}`)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = useCategoryFormStore.getState()
    if (!form.name.trim()) return

    try {
      await finance.createCategory({
        name: form.name.trim(),
        type: form.type,
        color: form.color,
        userId: auth.user?.id,
        isDemoMode: auth.isDemoMode,
      })
      modal.closeModal()
      catForm.resetForm()
    } catch (err: any) {
      alert(`Error creating category: ${err.message || err}`)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return
    await finance.deleteTransaction(id, auth.user?.id, auth.isDemoMode)
  }

  const handleReceiptExtracted = (data: any) => {
    let matchedCatId = ''
    if (data.categoryHint) {
      const hintLower = data.categoryHint.toLowerCase()
      const matchedCat = finance.categories.find(
        (c) => c.type === (data.type || 'EXPENSE') && c.name.toLowerCase().includes(hintLower)
      )
      matchedCatId = matchedCat?.id || ''
    }
    if (!matchedCatId) {
      const fallbackCat = finance.categories.find((c) => c.type === (data.type || 'EXPENSE'))
      matchedCatId = fallbackCat?.id || ''
    }

    txForm.setFormData({
      amount: data.amount ? String(data.amount) : '',
      type: data.type || 'EXPENSE',
      categoryId: matchedCatId,
      date: data.transactionDate || new Date().toISOString().slice(0, 10),
      paymentMethod: data.paymentMethod || 'CASH',
      note: data.note || (data.merchantName ? `Purchase at ${data.merchantName}` : 'Receipt Scan'),
    })

    modal.openModal('ADD_TRANSACTION')
  }

  const handleImportBankTransactions = async (txs: any[]) => {
    await finance.importBankTransactions(txs, auth.user?.id)
  }

  const handleSaveCategoryBudgets = async (updatedMap: Record<string, number | null>) => {
    await finance.saveCategoryBudgets(updatedMap, auth.user?.id, auth.isDemoMode)
  }

  const handleCreateSavingsGoal = async (goal: {
    name: string
    targetAmount: number
    initialDeposit: number
    color: string
    targetDate?: string | null
  }) => {
    await finance.createSavingsGoal({
      ...goal,
      userId: auth.user?.id,
      isDemoMode: auth.isDemoMode,
    })
    modal.closeModal()
  }

  const handleDepositSavingsGoal = async (goalId: string, depositAmount: number) => {
    await finance.depositSavingsGoal(goalId, depositAmount, auth.user?.id, auth.isDemoMode)
  }

  const handleUpdateSavingsGoal = async (
    goalId: string,
    fields: { name: string; targetAmount: number; currentAmount: number; color: string }
  ) => {
    await finance.updateSavingsGoal(goalId, fields, auth.user?.id, auth.isDemoMode)
    modal.closeModal()
  }

  const handleDeleteSavingsGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return
    await finance.deleteSavingsGoal(goalId, auth.user?.id, auth.isDemoMode)
    modal.closeModal()
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
    await finance.createRecurringRule({
      ...rule,
      userId: auth.user?.id,
      isDemoMode: auth.isDemoMode,
    })
    modal.closeModal()
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
    await finance.updateRecurringRule(ruleId, fields, auth.user?.id, auth.isDemoMode)
    modal.closeModal()
  }

  const handleToggleRecurringRule = async (ruleId: string, currentActive: boolean) => {
    await finance.toggleRecurringRule(ruleId, currentActive, auth.user?.id, auth.isDemoMode)
  }

  const handleDeleteRecurringRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this recurring rule?')) return
    await finance.deleteRecurringRule(ruleId, auth.user?.id, auth.isDemoMode)
  }

  // Contract Return (100% Backward Compatible)
  return {
    navigate,
    user: auth.user,
    loadingAuth: auth.loadingAuth,
    signOut: auth.signOut,
    isDemoMode: auth.isDemoMode,
    userPhoneNumber: auth.userPhoneNumber,
    setUserPhoneNumber: auth.setUserPhoneNumber,
    googleSheetsId: auth.googleSheetsId,
    setGoogleSheetsId: auth.setGoogleSheetsId,

    // Data State
    categories: finance.categories,
    setCategories: finance.setCategories,
    transactions: finance.transactions,
    setTransactions: finance.setTransactions,
    savingsGoals: finance.savingsGoals,
    setSavingsGoals: finance.setSavingsGoals,
    recurringRules: finance.recurringRules,
    setRecurringRules: finance.setRecurringRules,

    // Derived Metrics
    filteredTransactions: metrics.filteredTransactions,
    stats: metrics.stats,
    categoryBreakdownData: metrics.categoryBreakdownData,
    monthlyTrendData: metrics.monthlyTrendData,
    categoryBudgetsData: metrics.categoryBudgetsData,

    // Filter State
    dateRange: filter.dateRange,
    setDateRange: filter.setDateRange,
    selectedMonth: filter.selectedMonth,
    setSelectedMonth: filter.setSelectedMonth,
    searchQuery: filter.searchQuery,
    setSearchQuery: filter.setSearchQuery,
    typeFilter: filter.typeFilter,
    setTypeFilter: filter.setTypeFilter,
    categoryFilter: filter.categoryFilter,
    setCategoryFilter: filter.setCategoryFilter,

    // Modal Visibility State
    showAddTxModal: modal.activeModal === 'ADD_TRANSACTION',
    setShowAddTxModal: (show: boolean) => (show ? modal.openModal('ADD_TRANSACTION') : modal.closeModal()),
    showCatModal: modal.activeModal === 'CATEGORY_MANAGEMENT',
    setShowCatModal: (show: boolean) => (show ? modal.openModal('CATEGORY_MANAGEMENT') : modal.closeModal()),
    showExportModal: modal.activeModal === 'EXPORT',
    setShowExportModal: (show: boolean) => (show ? modal.openModal('EXPORT') : modal.closeModal()),
    showWhatsAppModal: modal.activeModal === 'WHATSAPP_SETTINGS',
    setShowWhatsAppModal: (show: boolean) => (show ? modal.openModal('WHATSAPP_SETTINGS') : modal.closeModal()),
    showReceiptModal: modal.activeModal === 'RECEIPT_UPLOAD',
    setShowReceiptModal: (show: boolean) => (show ? modal.openModal('RECEIPT_UPLOAD') : modal.closeModal()),
    showBankImportModal: modal.activeModal === 'BANK_IMPORT',
    setShowBankImportModal: (show: boolean) => (show ? modal.openModal('BANK_IMPORT') : modal.closeModal()),
    showBudgetModal: modal.activeModal === 'CATEGORY_BUDGET',
    setShowBudgetModal: (show: boolean) => (show ? modal.openModal('CATEGORY_BUDGET') : modal.closeModal()),
    showSavingsGoalModal: modal.activeModal === 'SAVINGS_GOAL',
    setShowSavingsGoalModal: (show: boolean) => (show ? modal.openSavingsGoal('CREATE') : modal.closeModal()),
    showRecurringModal: modal.activeModal === 'RECURRING_TRANSACTION',
    setShowRecurringModal: (show: boolean) => (show ? modal.openRecurring() : modal.closeModal()),
    savingsGoalModalMode: modal.savingsGoalMode,
    setSavingsGoalModalMode: (m: 'CREATE' | 'EDIT' | 'DEPOSIT') => modal.openSavingsGoal(m, modal.targetGoal),
    targetDepositGoal: modal.targetGoal,
    setTargetDepositGoal: (g: SavingsGoal | null) => modal.openSavingsGoal(modal.savingsGoalMode, g),
    targetEditRule: modal.targetRule,
    setTargetEditRule: (r: RecurringTransaction | null) => modal.openRecurring(r),
    showGoogleSheetsModal: modal.activeModal === 'GOOGLE_SHEETS',
    setShowGoogleSheetsModal: (show: boolean) => (show ? modal.openModal('GOOGLE_SHEETS') : modal.closeModal()),

    // Form States
    txAmount: txForm.amount,
    setTxAmount: txForm.setAmount,
    txType: txForm.type,
    setTxType: txForm.setType,
    txCategory: txForm.categoryId,
    setTxCategory: txForm.setCategory,
    txDate: txForm.date,
    setTxDate: txForm.setDate,
    txPaymentMethod: txForm.paymentMethod,
    setTxPaymentMethod: txForm.setPaymentMethod,
    txNote: txForm.note,
    setTxNote: txForm.setNote,

    catName: catForm.name,
    setCatName: catForm.setName,
    catType: catForm.type,
    setCatType: catForm.setType,
    catColor: catForm.color,
    setCatColor: catForm.setColor,

    // Handlers
    handleCreateTransaction,
    handleCreateCategory,
    handleDeleteTransaction,
    handleReceiptExtracted,
    handleImportBankTransactions,
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
