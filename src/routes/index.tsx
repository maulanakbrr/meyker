import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { supabase, signOut } from '../lib/supabase'
import { LoginPage } from './login'
import type { Transaction, Category, TransactionType, PaymentMethod } from '../types'
import { DEFAULT_CATEGORIES } from '../db/schema'
import { exportToExcel, exportToCSV } from '../lib/export'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  Download,
  LogOut,
  Tag,
  Search,
  Calendar,
  Layers,
  Trash2,
  X,
  CreditCard,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

// Demo mock fallback data for immediate interactive preview when DB is initializing
const MOCK_CATEGORIES: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
  id: `cat-default-${idx}`,
  name: cat.name,
  type: cat.type as TransactionType,
  icon: cat.icon,
  color: cat.color,
  isDefault: cat.isDefault,
}))

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-demo',
    categoryId: 'cat-default-7', // Salary
    amount: 15000000,
    type: 'INCOME',
    transactionDate: new Date().toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    note: 'Monthly Salary Payment',
    source: 'WEB',
    category: MOCK_CATEGORIES[7],
  },
  {
    id: 'tx-2',
    userId: 'user-demo',
    categoryId: 'cat-default-0', // Food
    amount: 120000,
    type: 'EXPENSE',
    transactionDate: new Date().toISOString(),
    paymentMethod: 'E_WALLET',
    note: 'Dinner with client',
    source: 'WEB',
    category: MOCK_CATEGORIES[0],
  },
  {
    id: 'tx-3',
    userId: 'user-demo',
    categoryId: 'cat-default-1', // Housing
    amount: 3500000,
    type: 'EXPENSE',
    transactionDate: new Date().toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    note: 'Apartment Maintenance & Rent',
    source: 'WEB',
    category: MOCK_CATEGORIES[1],
  },
  {
    id: 'tx-4',
    userId: 'user-demo',
    categoryId: 'cat-default-8', // Freelance
    amount: 4500000,
    type: 'INCOME',
    transactionDate: new Date().toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    note: 'UI Design Freelance Project',
    source: 'WEB',
    category: MOCK_CATEGORIES[8],
  },
  {
    id: 'tx-5',
    userId: 'user-demo',
    categoryId: 'cat-default-2', // Transport
    amount: 250000,
    type: 'EXPENSE',
    transactionDate: new Date().toISOString(),
    paymentMethod: 'CREDIT_CARD',
    note: 'Weekly fuel fill-up',
    source: 'WEB',
    category: MOCK_CATEGORIES[2],
  },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Domain State
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Modals state
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

      if (txData && txData.length > 0) {
        setTransactions(
          txData.map((t: any) => ({
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
              : null,
          }))
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
        await supabase.from('transactions').insert([
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
      } catch (err) {
        console.error('Error inserting to DB:', err)
      }
    }

    setTransactions((prev) => [newTx, ...prev])
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

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txMonth = tx.transactionDate.slice(0, 7)
      if (selectedMonth && txMonth !== selectedMonth) return false
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false
      if (categoryFilter !== 'ALL' && tx.categoryId !== categoryFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNote = tx.note?.toLowerCase().includes(q)
        const matchCat = tx.category?.name.toLowerCase().includes(q)
        if (!matchNote && !matchCat) return false
      }
      return true
    })
  }, [transactions, selectedMonth, typeFilter, categoryFilter, searchQuery])

  // Summary Metrics
  const stats = useMemo(() => {
    const monthTxs = transactions.filter((tx) => tx.transactionDate.slice(0, 7) === selectedMonth)
    const income = monthTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, curr) => acc + Number(curr.amount), 0)
    const expense = monthTxs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + Number(curr.amount), 0)
    return {
      totalIncome: income,
      totalExpenses: expense,
      totalBalance: income - expense,
    }
  }, [transactions, selectedMonth])

  // Chart Data: Category Breakdown (Expenses)
  const categoryBreakdownData = useMemo(() => {
    const expenseTxs = transactions.filter(
      (tx) => tx.transactionDate.slice(0, 7) === selectedMonth && tx.type === 'EXPENSE'
    )
    const map: Record<string, { name: string; value: number; color: string }> = {}

    expenseTxs.forEach((tx) => {
      const catName = tx.category?.name || 'Uncategorized'
      const color = tx.category?.color || '#94a3b8'
      if (!map[catName]) {
        map[catName] = { name: catName, value: 0, color }
      }
      map[catName].value += Number(tx.amount)
    })

    return Object.values(map)
  }, [transactions, selectedMonth])

  // Chart Data: Monthly Spending Trend (Last 6 Months)
  const monthlyTrendData = useMemo(() => {
    const monthsMap: Record<string, { month: string; Income: number; Expenses: number }> = {}

    // Generate last 6 months list
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7) // 'YYYY-MM'
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      monthsMap[key] = { month: label, Income: 0, Expenses: 0 }
    }

    transactions.forEach((tx) => {
      const k = tx.transactionDate.slice(0, 7)
      if (monthsMap[k]) {
        if (tx.type === 'INCOME') {
          monthsMap[k].Income += Number(tx.amount)
        } else {
          monthsMap[k].Expenses += Number(tx.amount)
        }
      }
    })

    return Object.values(monthsMap)
  }, [transactions])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val)
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs text-gray-400">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col pb-16">
      {/* Top Navbar */}
      <header className="glass-panel sticky top-0 z-30 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center glow-balance">
              <Wallet className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight leading-none">Meyker</h1>
              <p className="text-xs text-gray-400 mt-0.5">Financial Dashboard & Expense Logger</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white">{user.email}</p>
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Pro Member
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-all border border-gray-700/50"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate({ to: '/auth' })}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 rotate-180" /> Log In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-8 space-y-8 flex-1">
        {/* Controls Header (Month Selector + Action Buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
            <label className="text-xs font-medium text-gray-400">Filter Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCatModal(true)}
              className="bg-gray-800/90 hover:bg-gray-800 text-gray-200 border border-gray-700/60 text-xs font-medium px-3.5 py-2 rounded-xl transition-all flex items-center gap-2"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Categories
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="bg-gray-800/90 hover:bg-gray-800 text-gray-200 border border-gray-700/60 text-xs font-medium px-3.5 py-2 rounded-xl transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Data
            </button>

            <button
              onClick={() => setShowAddTxModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          </div>
        </div>

        {/* 1. CORE MVP FEATURE: 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Balance */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden glow-balance border border-indigo-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Balance
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">
              {formatCurrency(stats.totalBalance)}
            </p>
            <p className="text-xs text-indigo-300/70 mt-2">Net financial standing for selected month</p>
          </div>

          {/* Card 2: Total Income */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden glow-income border border-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Income
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400 tracking-tight">
              {formatCurrency(stats.totalIncome)}
            </p>
            <p className="text-xs text-emerald-300/70 mt-2">Sum of logged earnings</p>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden glow-expense border border-rose-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Expenses
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-400 tracking-tight">
              {formatCurrency(stats.totalExpenses)}
            </p>
            <p className="text-xs text-rose-300/70 mt-2">Sum of logged outgoings</p>
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Donut Chart - Category Spending Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Category Spending Breakdown
            </h2>
            <div className="h-64 w-full flex-1">
              {categoryBreakdownData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                  No expense records logged for this month.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Bar Chart - Monthly Spending Trend */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> 6-Month Spending Trend
            </h2>
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val)]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transaction List with Filters */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Transactions</h2>
              <p className="text-xs text-gray-400">View and manage logged entries</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border border-gray-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-44"
                />
              </div>

              {/* Type Filter */}
              <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    typeFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('INCOME')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    typeFilter === 'INCOME' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setTypeFilter('EXPENSE')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    typeFilter === 'EXPENSE' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Expense
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction Table / List */}
          <div className="overflow-x-auto">
            {filteredTransactions.length > 0 ? (
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Transaction</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: tx.category?.color || '#6366f1' }}
                          >
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{tx.note || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 border border-gray-700/50 font-medium">
                          {tx.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">
                        {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-gray-400 capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {tx.source}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold text-sm ${
                          tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500 text-xs">
                No matching transactions found for current filter.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal 1: Add Transaction */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-modal w-full max-w-md rounded-2xl p-6 border border-white/10 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-base">Add New Transaction</h3>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    txType === 'EXPENSE' ? 'bg-rose-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    txType === 'INCOME' ? 'bg-emerald-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories
                    .filter((c) => c.type === txType)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Payment Method</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="E_WALLET">E-Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Note / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Grocery shopping at Supermarket"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-all text-sm mt-2"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manage Categories */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-modal w-full max-w-lg rounded-2xl p-6 border border-white/10 space-y-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-base">Category Management</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create Custom Category Form */}
            <form onSubmit={handleCreateCategory} className="space-y-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Add Custom Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Category Name"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 col-span-2"
                />
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value as TransactionType)}
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-400">Badge Color:</label>
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                />
                <button
                  type="submit"
                  className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
                >
                  Create Category
                </button>
              </div>
            </form>

            {/* Category List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900/40 border border-gray-800 text-xs"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-white truncate">{cat.name}</span>
                    <span className="ml-auto text-[10px] text-gray-500 uppercase">{cat.type[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Export Data */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-modal w-full max-w-sm rounded-2xl p-6 border border-white/10 space-y-5 animate-fade-in text-center">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-base">Export Financial History</h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Export {filteredTransactions.length} records for selected filter period.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  exportToExcel(filteredTransactions)
                  setShowExportModal(false)
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)
              </button>

              <button
                onClick={() => {
                  exportToCSV(filteredTransactions)
                  setShowExportModal(false)
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-medium py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> Download CSV (.csv)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}