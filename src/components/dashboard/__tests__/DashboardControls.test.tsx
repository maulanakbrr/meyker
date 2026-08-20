import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardControls } from '../DashboardControls'

describe('DashboardControls', () => {
  it('renders selected month and triggers month change handler', () => {
    const handleMonthChange = vi.fn()
    render(
      <DashboardControls
        selectedMonth="2026-07"
        onMonthChange={handleMonthChange}
        onOpenCategoryModal={vi.fn()}
        onOpenExportModal={vi.fn()}
        onOpenAddTxModal={vi.fn()}
        onOpenWhatsAppModal={vi.fn()}
        onOpenReceiptModal={vi.fn()}
      />
    )

    const monthInput = screen.getByLabelText(/filter month:/i) as HTMLInputElement
    expect(monthInput.value).toBe('2026-07')

    fireEvent.change(monthInput, { target: { value: '2026-08' } })
    expect(handleMonthChange).toHaveBeenCalledWith('2026-08')
  })

  it('triggers modal opening callbacks when action buttons are clicked', () => {
    const handleOpenCat = vi.fn()
    const handleOpenExport = vi.fn()
    const handleOpenAddTx = vi.fn()
    const handleOpenWhatsApp = vi.fn()
    const handleOpenReceipt = vi.fn()

    render(
      <DashboardControls
        selectedMonth="2026-07"
        onMonthChange={vi.fn()}
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
