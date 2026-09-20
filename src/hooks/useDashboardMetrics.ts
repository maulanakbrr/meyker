import { useMemo } from 'react'
import { useFinanceStore, useFilterStore } from '../stores'
import {
  calculateDashboardStats,
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  calculateCategoryBudgets,
  filterDashboardTransactions,
} from '../lib/dashboardUtils'

export function useDashboardMetrics() {
  const transactions = useFinanceStore((state) => state.transactions)
  const categories = useFinanceStore((state) => state.categories)

  const dateRange = useFilterStore((state) => state.dateRange)
  const selectedMonth = useFilterStore((state) => state.selectedMonth)
  const searchQuery = useFilterStore((state) => state.searchQuery)
  const typeFilter = useFilterStore((state) => state.typeFilter)
  const categoryFilter = useFilterStore((state) => state.categoryFilter)

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

  return {
    filteredTransactions,
    stats,
    categoryBreakdownData,
    monthlyTrendData,
    categoryBudgetsData,
  }
}
