import type { Transaction, Category } from '../types'

/**
 * Safely format YYYY-MM month key from any transaction date string
 */
export function getTxMonthKey(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }
  return dateStr.slice(0, 7)
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  totalBalance: number
}

/**
 * Calculate total income, total expenses, and total balance for the selected month
 */
export function calculateDashboardStats(
  transactions: Transaction[],
  selectedMonth: string
): DashboardStats {
  const monthTxs = transactions.filter((tx) => getTxMonthKey(tx.transactionDate) === selectedMonth)
  const totalIncome = monthTxs
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpenses = monthTxs
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  return {
    totalIncome,
    totalExpenses,
    totalBalance: totalIncome - totalExpenses,
  }
}

export interface CategoryBreakdownItem {
  name: string
  value: number
  color: string
}

/**
 * Calculate expense breakdown by category for pie chart
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  selectedMonth: string,
  categories: Category[]
): CategoryBreakdownItem[] {
  const expenseTxs = transactions.filter(
    (tx) => getTxMonthKey(tx.transactionDate) === selectedMonth && tx.type === 'EXPENSE'
  )
  const map: Record<string, CategoryBreakdownItem> = {}

  expenseTxs.forEach((tx) => {
    const cat = tx.category || categories.find((c) => c.id === tx.categoryId)
    const catName = cat?.name || 'Uncategorized'
    const color = cat?.color || '#94a3b8'
    if (!map[catName]) {
      map[catName] = { name: catName, value: 0, color }
    }
    map[catName].value += Number(tx.amount)
  })

  return Object.values(map)
}

export interface MonthlyTrendItem {
  month: string
  Income: number
  Expenses: number
}

/**
 * Calculate spending and income trend across the last 6 months
 */
export function calculateMonthlyTrend(transactions: Transaction[]): MonthlyTrendItem[] {
  const monthsMap: Record<string, MonthlyTrendItem> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const year = d.getFullYear()
    const monthStr = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${monthStr}` // 'YYYY-MM'
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    monthsMap[key] = { month: label, Income: 0, Expenses: 0 }
  }

  transactions.forEach((tx) => {
    const k = getTxMonthKey(tx.transactionDate)
    if (monthsMap[k]) {
      if (tx.type === 'INCOME') {
        monthsMap[k].Income += Number(tx.amount)
      } else {
        monthsMap[k].Expenses += Number(tx.amount)
      }
    }
  })

  return Object.values(monthsMap)
}

export interface TransactionFilterOptions {
  selectedMonth?: string
  typeFilter?: 'ALL' | 'INCOME' | 'EXPENSE' | string
  categoryFilter?: string
  searchQuery?: string
}

/**
 * Filter transactions based on month, type, category, and search query
 */
export function filterDashboardTransactions(
  transactions: Transaction[],
  filters: TransactionFilterOptions
): Transaction[] {
  const { selectedMonth, typeFilter = 'ALL', categoryFilter = 'ALL', searchQuery = '' } = filters

  return transactions.filter((tx) => {
    if (selectedMonth && getTxMonthKey(tx.transactionDate) !== selectedMonth) return false
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
}
