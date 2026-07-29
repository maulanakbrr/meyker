import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCards } from '../StatCards'

describe('StatCards', () => {
  it('renders all 3 KPI cards with formatted amounts', () => {
    const stats = {
      totalIncome: 15000000,
      totalExpenses: 3500000,
      totalBalance: 11500000,
    }

    render(<StatCards stats={stats} />)

    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getByText('Total Income')).toBeInTheDocument()
    expect(screen.getByText('Total Expenses')).toBeInTheDocument()

    // Currency values formatted by formatCurrency
    expect(screen.getByText(/11\.500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/15\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText(/3\.500\.000/)).toBeInTheDocument()
  })
})
