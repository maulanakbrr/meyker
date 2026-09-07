import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BankStatementImportModal } from '../BankStatementImportModal'
import { DEFAULT_CATEGORIES } from '../../../db/schema'

describe('BankStatementImportModal', () => {
  it('renders modal title and file dropzone when open', () => {
    render(
      <BankStatementImportModal
        isOpen
        onClose={vi.fn()}
        categories={DEFAULT_CATEGORIES}
        onImportTransactions={vi.fn()}
      />
    )

    expect(screen.getByText(/import transactions \(csv \/ excel\)/i)).toBeInTheDocument()
    expect(screen.getByText(/need a sample file structure\? download a template/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    const { container } = render(
      <BankStatementImportModal
        isOpen={false}
        onClose={vi.fn()}
        categories={DEFAULT_CATEGORIES}
        onImportTransactions={vi.fn()}
      />
    )

    expect(container.textContent).toBe('')
  })
})
