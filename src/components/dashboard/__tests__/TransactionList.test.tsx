import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionList } from '../TransactionList'
import type { Transaction, Category } from '../../../types'

describe('TransactionList', () => {
  const sampleCategories: Category[] = [
    { id: 'cat-1', name: 'Food', type: 'EXPENSE', icon: 'Tag', color: '#ff0000', isDefault: true },
    { id: 'cat-2', name: 'Salary', type: 'INCOME', icon: 'Tag', color: '#00ff00', isDefault: true },
  ]

  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'user-1',
      categoryId: 'cat-2',
      amount: 10000000,
      type: 'INCOME',
      transactionDate: '2026-07-15T10:00:00.000Z',
      paymentMethod: 'BANK_TRANSFER',
      note: 'July Salary Payment',
      source: 'WEB',
      category: sampleCategories[1],
    },
    {
      id: 'tx-2',
      userId: 'user-1',
      categoryId: 'cat-1',
      amount: 150000,
      type: 'EXPENSE',
      transactionDate: '2026-07-16T10:00:00.000Z',
      paymentMethod: 'CASH',
      note: 'Lunch at Cafe',
      source: 'WEB',
      category: sampleCategories[0],
    },
  ]

  it('renders transactions table with notes and formatted amounts', () => {
    render(
      <TransactionList
        transactions={sampleTransactions}
        categories={sampleCategories}
        searchQuery=""
        onSearchChange={vi.fn()}
        typeFilter="ALL"
        onTypeFilterChange={vi.fn()}
        categoryFilter="ALL"
        onCategoryFilterChange={vi.fn()}
        onDeleteTransaction={vi.fn()}
      />
    )

    expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
    expect(screen.getByText('July Salary Payment')).toBeInTheDocument()
    expect(screen.getByText('Lunch at Cafe')).toBeInTheDocument()
  })

  it('shows empty message when transactions list is empty', () => {
    render(
      <TransactionList
        transactions={[]}
        categories={sampleCategories}
        searchQuery=""
        onSearchChange={vi.fn()}
        typeFilter="ALL"
        onTypeFilterChange={vi.fn()}
        categoryFilter="ALL"
        onCategoryFilterChange={vi.fn()}
        onDeleteTransaction={vi.fn()}
      />
    )

    expect(screen.getByText('No matching transactions found for current filter.')).toBeInTheDocument()
  })

  it('triggers search and filter change handlers', () => {
    const handleSearch = vi.fn()
    const handleTypeFilter = vi.fn()
    const handleCategoryFilter = vi.fn()

    render(
      <TransactionList
        transactions={sampleTransactions}
        categories={sampleCategories}
        searchQuery=""
        onSearchChange={handleSearch}
        typeFilter="ALL"
        onTypeFilterChange={handleTypeFilter}
        categoryFilter="ALL"
        onCategoryFilterChange={handleCategoryFilter}
        onDeleteTransaction={vi.fn()}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search note...')
    fireEvent.change(searchInput, { target: { value: 'Salary' } })
    expect(handleSearch).toHaveBeenCalledWith('Salary')

    const incomeBtn = screen.getByRole('button', { name: /^income$/i })
    fireEvent.click(incomeBtn)
    expect(handleTypeFilter).toHaveBeenCalledWith('INCOME')

    const categorySelect = screen.getByRole('combobox')
    fireEvent.change(categorySelect, { target: { value: 'cat-1' } })
    expect(handleCategoryFilter).toHaveBeenCalledWith('cat-1')
  })

  it('triggers delete action when delete button is clicked', () => {
    const handleDelete = vi.fn()

    render(
      <TransactionList
        transactions={sampleTransactions}
        categories={sampleCategories}
        searchQuery=""
        onSearchChange={vi.fn()}
        typeFilter="ALL"
        onTypeFilterChange={vi.fn()}
        categoryFilter="ALL"
        onCategoryFilterChange={vi.fn()}
        onDeleteTransaction={handleDelete}
      />
    )

    const deleteButtons = screen.getAllByTitle('Delete transaction')
    fireEvent.click(deleteButtons[0])
    expect(handleDelete).toHaveBeenCalledWith('tx-1')
  })
})
