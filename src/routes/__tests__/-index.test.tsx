import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Route } from '../index'
import * as useDashboardModule from '../../hooks/useDashboard'

// Mock dependencies if needed
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
  signOut: vi.fn(),
}))

describe('Dashboard Route', () => {
  const Component = Route.options.component as React.ComponentType

  it('renders loading state when auth is loading', () => {
    vi.spyOn(useDashboardModule, 'useDashboard').mockReturnValue({
      loadingAuth: true,
      user: null,
    } as any)

    render(<Component />)
    expect(screen.getByText('Loading session...')).toBeInTheDocument()
  })

  it('renders login page when user is not authenticated', () => {
    vi.spyOn(useDashboardModule, 'useDashboard').mockReturnValue({
      loadingAuth: false,
      user: null,
    } as any)

    render(<Component />)
    expect(screen.getByText('Meyker Financial')).toBeInTheDocument()
  })

  it('renders complete dashboard when user is authenticated', () => {
    vi.spyOn(useDashboardModule, 'useDashboard').mockReturnValue({
      loadingAuth: false,
      user: { id: 'user-1', email: 'test@example.com' },
      navigate: vi.fn(),
      signOut: vi.fn(),
      categories: [],
      transactions: [],
      filteredTransactions: [],
      stats: { totalIncome: 5000000, totalExpenses: 1000000, totalBalance: 4000000 },
      categoryBreakdownData: [],
      monthlyTrendData: [],
      selectedMonth: '2026-07',
      setSelectedMonth: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      typeFilter: 'ALL',
      setTypeFilter: vi.fn(),
      categoryFilter: 'ALL',
      setCategoryFilter: vi.fn(),
      showAddTxModal: false,
      setShowAddTxModal: vi.fn(),
      showCatModal: false,
      setShowCatModal: vi.fn(),
      showExportModal: false,
      setShowExportModal: vi.fn(),
      txAmount: '',
      setTxAmount: vi.fn(),
      txType: 'EXPENSE',
      setTxType: vi.fn(),
      txCategory: '',
      setTxCategory: vi.fn(),
      txDate: '2026-07-29',
      setTxDate: vi.fn(),
      txPaymentMethod: 'CASH',
      setTxPaymentMethod: vi.fn(),
      txNote: '',
      setTxNote: vi.fn(),
      catName: '',
      setCatName: vi.fn(),
      catType: 'EXPENSE',
      setCatType: vi.fn(),
      catColor: '#6366f1',
      setCatColor: vi.fn(),
      handleCreateTransaction: vi.fn(),
      handleCreateCategory: vi.fn(),
      handleDeleteTransaction: vi.fn(),
    } as any)

    render(<Component />)

    expect(screen.getByText('Meyker')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
  })
})
