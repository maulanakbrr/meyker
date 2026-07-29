import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase, signOut } from '../lib/supabase'
import type { Transaction, Category, TransactionType, PaymentMethod } from '../types'
import {
  calculateDashboardStats,
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  filterDashboardTransactions,
} from '../lib/dashboardUtils'

export function useDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Domain State
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Modals State
  const [showAddTxModal, setShowAddTxModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

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
    // If this window is an OAuth popup callback, auto-close it after redirecting back
    if (window.opener && window.opener !== window) {
      window.close()
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoadingAuth(false)

      if (session?.user) {
        fetchUserData(session.user.id)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${userId}`)

      if (catData && catData.length > 0) {
        setCategories(
          catData.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            name: c.name,
            type: c.type,
            icon: c.icon,
            color: c.color,
            isDefault: c.is_default,
          }))
        )
      }

      // Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*, categories(*)')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })

      if (txData) {
        setTransactions(
          txData.map((t: any) => {
            const rawCat = Array.isArray(t.categories) ? t.categories[0] : t.categories
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
              category: rawCat
                ? {
                    id: rawCat.id,
                    name: rawCat.name,
                    type: rawCat.type,
                    icon: rawCat.icon,
                    color: rawCat.color,
                    isDefault: rawCat.is_default,
                  }
                : null,
            }
          })
        )
      }
    } catch (err) {
      console.warn('Using local state context for dashboard preview:', err)
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

  // Derived Calculations
  const filteredTransactions = useMemo(
    () =>
      filterDashboardTransactions(transactions, {
        selectedMonth,
        typeFilter,
        categoryFilter,
        searchQuery,
      }),
    [transactions, selectedMonth, typeFilter, categoryFilter, searchQuery]
  )

  const stats = useMemo(
    () => calculateDashboardStats(transactions, selectedMonth),
    [transactions, selectedMonth]
  )

  const categoryBreakdownData = useMemo(
    () => calculateCategoryBreakdown(transactions, selectedMonth, categories),
    [transactions, selectedMonth, categories]
  )

  const monthlyTrendData = useMemo(
    () => calculateMonthlyTrend(transactions),
    [transactions]
  )

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

    // Filter State
    selectedMonth,
    setSelectedMonth,
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
  }
}
