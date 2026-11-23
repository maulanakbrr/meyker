import { describe, it, expect, beforeEach } from 'vitest'
import { useFilterStore } from '../useFilterStore'

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters()
  })

  it('initializes with default filters', () => {
    const state = useFilterStore.getState()
    expect(state.typeFilter).toBe('ALL')
    expect(state.categoryFilter).toBe('ALL')
    expect(state.searchQuery).toBe('')
    expect(state.dateRange.preset).toBe('THIS_MONTH')
  })

  it('updates filters individually', () => {
    useFilterStore.getState().setTypeFilter('EXPENSE')
    useFilterStore.getState().setCategoryFilter('cat-food')
    useFilterStore.getState().setSearchQuery('Dinner')
    useFilterStore.getState().setSelectedMonth('2026-08')

    const state = useFilterStore.getState()
    expect(state.typeFilter).toBe('EXPENSE')
    expect(state.categoryFilter).toBe('cat-food')
    expect(state.searchQuery).toBe('Dinner')
    expect(state.selectedMonth).toBe('2026-08')
  })

  it('resets all filters back to defaults', () => {
    useFilterStore.getState().setSearchQuery('Search term')
    useFilterStore.getState().setTypeFilter('INCOME')
    useFilterStore.getState().resetFilters()

    const state = useFilterStore.getState()
    expect(state.searchQuery).toBe('')
    expect(state.typeFilter).toBe('ALL')
    expect(state.categoryFilter).toBe('ALL')
  })
})
