import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Transaction } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format raw numerical amount or string to IDR currency format (e.g. "Rp 150.000")
 */
export function formatCurrency(amount: number | string, currency: string = 'IDR'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount

  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(numericAmount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numericAmount)
}

/**
 * Calculate total income, total expense, net balance, and savings rate from transactions
 */
export function calculateFinancialSummary(transactions: Transaction[]) {
  const totalIncome = transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

  const totalExpense = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

  const netBalance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  return {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate: Math.max(0, parseFloat(savingsRate.toFixed(1))),
  }
}

/**
 * Filter transactions list by category, type (INCOME/EXPENSE), and search keyword
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: {
    type?: 'ALL' | 'INCOME' | 'EXPENSE'
    categoryId?: string
    searchQuery?: string
  }
): Transaction[] {
  return transactions.filter((tx) => {
    // Filter by type
    if (filters.type && filters.type !== 'ALL' && tx.type !== filters.type) {
      return false
    }

    // Filter by category
    if (filters.categoryId && filters.categoryId !== 'ALL' && tx.categoryId !== filters.categoryId) {
      return false
    }

    // Filter by search query (note or category name)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase()
      const noteMatch = (tx.note || '').toLowerCase().includes(query)
      const categoryMatch = (tx.category?.name || '').toLowerCase().includes(query)
      if (!noteMatch && !categoryMatch) {
        return false
      }
    }

    return true
  })
}
