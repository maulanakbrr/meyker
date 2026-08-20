import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportModal } from '../ExportModal'

describe('ExportModal', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <ExportModal
        isOpen={false}
        onClose={vi.fn()}
        recordCount={10}
        onExportExcel={vi.fn()}
        onExportCSV={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders record count and export buttons including PDF statement export', () => {
    const handleExportExcel = vi.fn()
    const handleExportCSV = vi.fn()
    const handleExportPDF = vi.fn()

    render(
      <ExportModal
        isOpen={true}
        onClose={vi.fn()}
        recordCount={5}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />
    )

    expect(screen.getByText('Export Financial History')).toBeInTheDocument()
    expect(screen.getByText(/Export 5 records for selected filter period\./i)).toBeInTheDocument()

    const pdfBtn = screen.getByRole('button', { name: /download pdf statement \(\.pdf\)/i })
    fireEvent.click(pdfBtn)
    expect(handleExportPDF).toHaveBeenCalledTimes(1)

    const excelBtn = screen.getByRole('button', { name: /download excel \(\.xlsx\)/i })
    fireEvent.click(excelBtn)
    expect(handleExportExcel).toHaveBeenCalledTimes(1)

    const csvBtn = screen.getByRole('button', { name: /download csv \(\.csv\)/i })
    fireEvent.click(csvBtn)
    expect(handleExportCSV).toHaveBeenCalledTimes(1)
  })
})
