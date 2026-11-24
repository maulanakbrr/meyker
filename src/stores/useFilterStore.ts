import { create } from 'zustand'
import { getDateRangeForPreset, type DateFilterRange } from '../lib/dateUtils'

export interface FilterState {
  dateRange: DateFilterRange
  selectedMonth: string
  searchQuery: string
  typeFilter: 'ALL' | 'INCOME' | 'EXPENSE'
  categoryFilter: string
  selectedTags: string[]

  setDateRange: (range: DateFilterRange) => void
  setSelectedMonth: (month: string) => void
  setSearchQuery: (query: string) => void
  setTypeFilter: (type: 'ALL' | 'INCOME' | 'EXPENSE') => void
  setCategoryFilter: (category: string) => void
  setSelectedTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
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
  selectedTags: [],

  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setSelectedTags: (selectedTags) => set({ selectedTags }),
  toggleTag: (tag) =>
    set((state) => {
      const clean = tag.trim().replace(/^#/, '').toLowerCase()
      const exists = state.selectedTags.includes(clean)
      return {
        selectedTags: exists
          ? state.selectedTags.filter((t) => t !== clean)
          : [...state.selectedTags, clean],
      }
    }),
  resetFilters: () =>
    set({
      dateRange: getDefaultDateRange(),
      selectedMonth: getDefaultMonth(),
      searchQuery: '',
      typeFilter: 'ALL',
      categoryFilter: 'ALL',
      selectedTags: [],
    }),
}))
