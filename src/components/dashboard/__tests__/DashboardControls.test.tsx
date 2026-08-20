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
      />
    )

    expect(screen.getByText('This Month')).toBeInTheDocument()
  })

  it('triggers modal opening callbacks when action buttons are clicked', () => {
    const handleOpenCat = vi.fn()
    const handleOpenExport = vi.fn()
    const handleOpenAddTx = vi.fn()
    const handleOpenWhatsApp = vi.fn()
    const handleOpenReceipt = vi.fn()

    render(
      <DashboardControls
        dateRange={getDateRangeForPreset('THIS_MONTH')}
        onDateRangeChange={vi.fn()}
        onOpenCategoryModal={handleOpenCat}
        onOpenExportModal={handleOpenExport}
        onOpenAddTxModal={handleOpenAddTx}
        onOpenWhatsAppModal={handleOpenWhatsApp}
        onOpenReceiptModal={handleOpenReceipt}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /scan receipt/i }))
    expect(handleOpenReceipt).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /whatsapp ai/i }))
    expect(handleOpenWhatsApp).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /categories/i }))
    expect(handleOpenCat).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /export data/i }))
    expect(handleOpenExport).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }))
    expect(handleOpenAddTx).toHaveBeenCalledTimes(1)
  })
})

