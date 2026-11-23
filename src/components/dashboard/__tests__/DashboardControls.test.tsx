import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardControls } from '../DashboardControls'
import { getDateRangeForPreset } from '../../../lib/dateUtils'

describe('DashboardControls', () => {
  it('renders filter period trigger button with current preset label', () => {
    const handleRangeChange = vi.fn()
    const sampleRange = getDateRangeForPreset('THIS_MONTH')

    render(
      <DashboardControls
        dateRange={sampleRange}
        onDateRangeChange={handleRangeChange}
        onOpenCategoryModal={vi.fn()}
        onOpenExportModal={vi.fn()}
        onOpenAddTxModal={vi.fn()}
        onOpenWhatsAppModal={vi.fn()}
        onOpenReceiptModal={vi.fn()}
        onOpenBankImportModal={vi.fn()}
      />
    )

    expect(screen.getByText('This Month')).toBeInTheDocument()
  })

  it('triggers modal opening callbacks when action buttons and dropdown options are clicked', () => {
    const handleOpenCat = vi.fn()
    const handleOpenExport = vi.fn()
    const handleOpenAddTx = vi.fn()
    const handleOpenWhatsApp = vi.fn()
    const handleOpenReceipt = vi.fn()
    const handleOpenBankImport = vi.fn()
    const handleOpenGoogleSheets = vi.fn()
    const handleOpenRecurring = vi.fn()
    const handleOpenBudget = vi.fn()
    const handleOpenSavingsGoal = vi.fn()

    render(
      <DashboardControls
        dateRange={getDateRangeForPreset('THIS_MONTH')}
        onDateRangeChange={vi.fn()}
        onOpenCategoryModal={handleOpenCat}
        onOpenExportModal={handleOpenExport}
        onOpenAddTxModal={handleOpenAddTx}
        onOpenWhatsAppModal={handleOpenWhatsApp}
        onOpenReceiptModal={handleOpenReceipt}
        onOpenBankImportModal={handleOpenBankImport}
        onOpenGoogleSheetsModal={handleOpenGoogleSheets}
        onOpenRecurringModal={handleOpenRecurring}
        onOpenBudgetModal={handleOpenBudget}
        onOpenSavingsGoalModal={handleOpenSavingsGoal}
      />
    )

    // Direct Buttons
    fireEvent.click(screen.getByRole('button', { name: /scan receipt/i }))
    expect(handleOpenReceipt).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }))
    expect(handleOpenAddTx).toHaveBeenCalledTimes(1)

    // Data & Sync Popover
    fireEvent.click(screen.getByRole('button', { name: /data & sync/i }))
    fireEvent.click(screen.getByText(/import csv \/ excel/i))
    expect(handleOpenBankImport).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /data & sync/i }))
    fireEvent.click(screen.getByText(/export data/i))
    expect(handleOpenExport).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /data & sync/i }))
    fireEvent.click(screen.getByText(/google sheets sync/i))
    expect(handleOpenGoogleSheets).toHaveBeenCalledTimes(1)

    // More Popover
    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByText(/^categories$/i))
    expect(handleOpenCat).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByText(/^whatsapp ai$/i))
    expect(handleOpenWhatsApp).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByText(/^recurring rules$/i))
    expect(handleOpenRecurring).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByText(/^category budgets$/i))
    expect(handleOpenBudget).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByText(/^savings goals$/i))
    expect(handleOpenSavingsGoal).toHaveBeenCalledTimes(1)
  })
})

