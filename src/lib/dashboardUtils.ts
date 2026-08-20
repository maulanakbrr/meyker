import type { Transaction, Category } from '../types'
import { isDateInRange, type DateFilterRange } from './dateUtils'

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
 * Calculate total income, total expenses, and total balance for the selected date range or month
 */
export function calculateDashboardStats(
  transactions: Transaction[],
  selectedMonthOrRange: string | DateFilterRange
): DashboardStats {
  const filtered = transactions.filter((tx) => {
    if (typeof selectedMonthOrRange === 'string') {
      return getTxMonthKey(tx.transactionDate) === selectedMonthOrRange
    }
    return isDateInRange(tx.transactionDate, selectedMonthOrRange)
  })

  const totalIncome = filtered
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpenses = filtered
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
  selectedMonthOrRange: string | DateFilterRange,
  categories: Category[]
): CategoryBreakdownItem[] {
  const expenseTxs = transactions.filter((tx) => {
    if (tx.type !== 'EXPENSE') return false
    if (typeof selectedMonthOrRange === 'string') {
      return getTxMonthKey(tx.transactionDate) === selectedMonthOrRange
    }
    return isDateInRange(tx.transactionDate, selectedMonthOrRange)
  })
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
  dateRange?: DateFilterRange
  typeFilter?: 'ALL' | 'INCOME' | 'EXPENSE' | string
  categoryFilter?: string
  searchQuery?: string
}

/**
 * Filter transactions based on date range / month, type, category, and search query
 */
export function filterDashboardTransactions(
  transactions: Transaction[],
  filters: TransactionFilterOptions
): Transaction[] {
  const { selectedMonth, dateRange, typeFilter = 'ALL', categoryFilter = 'ALL', searchQuery = '' } = filters

  return transactions.filter((tx) => {
    if (dateRange) {
      if (!isDateInRange(tx.transactionDate, dateRange)) return false
    } else if (selectedMonth && getTxMonthKey(tx.transactionDate) !== selectedMonth) {
      return false
    }

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

export interface CategoryBudgetProgress {
  categoryId: string
  categoryName: string
  color: string
  icon: string
  spent: number
  limit: number
  percentage: number
  status: 'HEALTHY' | 'CAUTION' | 'EXCEEDED'
  exceededAmount: number
}

/**
 * Calculate spending progress for categories that have a monthlyBudget set
 */
export function calculateCategoryBudgets(
  transactions: Transaction[],
  selectedMonthOrRange: string | DateFilterRange,
  categories: Category[]
): CategoryBudgetProgress[] {
  const expenseTxs = transactions.filter((tx) => {
    if (tx.type !== 'EXPENSE') return false
    if (typeof selectedMonthOrRange === 'string') {
      return getTxMonthKey(tx.transactionDate) === selectedMonthOrRange
    }
    return isDateInRange(tx.transactionDate, selectedMonthOrRange)
  })

  const spentMap: Record<string, number> = {}
  expenseTxs.forEach((tx) => {
    if (tx.categoryId) {
      spentMap[tx.categoryId] = (spentMap[tx.categoryId] || 0) + Number(tx.amount)
    }
  })

  const budgetedCategories = categories.filter(
    (c) => c.type === 'EXPENSE' && c.monthlyBudget !== undefined && c.monthlyBudget !== null && Number(c.monthlyBudget) > 0
  )

  return budgetedCategories.map((cat) => {
    const limit = Number(cat.monthlyBudget)
    const spent = spentMap[cat.id] || 0
    const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 999) : 0
    const exceededAmount = Math.max(0, spent - limit)

    let status: 'HEALTHY' | 'CAUTION' | 'EXCEEDED' = 'HEALTHY'
    if (spent >= limit) {
      status = 'EXCEEDED'
    } else if (percentage >= 75) {
      status = 'CAUTION'
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      spent,
      limit,
      percentage,
      status,
      exceededAmount,
    }
  })
}

export interface SavingsGoalProgress {
  percentage: number
  remainingAmount: number
  isCompleted: boolean
}

/**
 * Calculate progress percentage and remaining amount for a savings goal
 */
export function calculateSavingsGoalProgress(
  targetAmount: number,
  currentAmount: number
): SavingsGoalProgress {
  const target = Number(targetAmount) || 0
  const current = Number(currentAmount) || 0
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
  const remainingAmount = Math.max(0, target - current)
  const isCompleted = current >= target

  return {
    percentage,
    remainingAmount,
    isCompleted,
  }
}
