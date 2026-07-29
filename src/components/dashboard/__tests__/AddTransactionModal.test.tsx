import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddTransactionModal } from '../AddTransactionModal'
import type { Category } from '../../../types'

describe('AddTransactionModal', () => {
  const sampleCategories: Category[] = [
    { id: 'cat-1', name: 'Groceries', type: 'EXPENSE', icon: 'Tag', color: '#ff0000', isDefault: true },
    { id: 'cat-2', name: 'Salary', type: 'INCOME', icon: 'Tag', color: '#00ff00', isDefault: true },
  ]

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <AddTransactionModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={sampleCategories}
        txType="EXPENSE"
        setTxType={vi.fn()}
        txAmount=""
        setTxAmount={vi.fn()}
        txCategory=""
        setTxCategory={vi.fn()}
        txDate="2026-07-29"
        setTxDate={vi.fn()}
        txPaymentMethod="CASH"
        setTxPaymentMethod={vi.fn()}
        txNote=""
        setTxNote={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders form inputs and handles form submission', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    const handleClose = vi.fn()

    render(
      <AddTransactionModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        categories={sampleCategories}
        txType="EXPENSE"
        setTxType={vi.fn()}
        txAmount="100000"
        setTxAmount={vi.fn()}
        txCategory="cat-1"
        setTxCategory={vi.fn()}
        txDate="2026-07-29"
        setTxDate={vi.fn()}
        txPaymentMethod="CASH"
        setTxPaymentMethod={vi.fn()}
        txNote="Dinner"
        setTxNote={vi.fn()}
      />
    )

    expect(screen.getByText('Add New Transaction')).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /save transaction/i })
    fireEvent.click(submitBtn)
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
