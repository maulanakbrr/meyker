import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateFilterPicker } from '../DateFilterPicker'
import { getDateRangeForPreset } from '../../../lib/dateUtils'

describe('DateFilterPicker', () => {
  it('renders trigger button with preset label', () => {
    render(
      <DateFilterPicker
        dateRange={getDateRangeForPreset('THIS_MONTH')}
        onDateRangeChange={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /this month/i })).toBeInTheDocument()
  })

  it('opens popover and switches category tabs (Daily, Monthly, Yearly, Custom)', () => {
    const handleRangeChange = vi.fn()
    render(
      <DateFilterPicker
        dateRange={getDateRangeForPreset('THIS_MONTH')}
        onDateRangeChange={handleRangeChange}
      />
    )

    const triggerBtn = screen.getByRole('button', { name: /this month/i })
    fireEvent.click(triggerBtn)

    // Verify Category Tabs exist
    expect(screen.getByRole('button', { name: /daily/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yearly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /custom/i })).toBeInTheDocument()

    // Switch to Daily Category
    fireEvent.click(screen.getByRole('button', { name: /daily/i }))
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()

    // Select Today
    fireEvent.click(screen.getByText('Today'))
    expect(handleRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ preset: 'TODAY', category: 'DAILY' })
    )
  })
})

