import { create } from 'zustand'
import { getDateRangeForPreset, type DateFilterRange } from '../lib/dateUtils'

export interface FilterState {
  dateRange: DateFilterRange
  selectedMonth: string
  searchQuery: string
  typeFilter: 'ALL' | 'INCOME' | 'EXPENSE'
  categoryFilter: string

  setDateRange: (range: DateFilterRange) => void
  setSelectedMonth: (month: string) => void
  setSearchQuery: (query: string) => void
  setTypeFilter: (type: 'ALL' | 'INCOME' | 'EXPENSE') => void
  setCategoryFilter: (category: string) => void
  resetFilters: () => void
}

const getDefaultMonth = () => new Date().toISOString().slice(0, 7)
const getDefaultDateRange = () => getDateRangeForPreset('THIS_MONTH')

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: getDefaultDateRange(),
  selectedMonth: getDefaultMonth(),
  searchQuery: '',
  typeFilter: 'ALL',
  categoryFilter: 'ALL',

  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  resetFilters: () =>
    set({
      dateRange: getDefaultDateRange(),
      selectedMonth: getDefaultMonth(),
      searchQuery: '',
      typeFilter: 'ALL',
      categoryFilter: 'ALL',
    }),
}))
