import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReceiptUploadModal } from '../ReceiptUploadModal'

describe('ReceiptUploadModal', () => {
  it('renders receipt scan modal when open', () => {
    render(
      <ReceiptUploadModal
        isOpen={true}
        onClose={vi.fn()}
        onReceiptExtracted={vi.fn()}
      />
    )

    expect(screen.getByText('Scan Receipt with Gemini AI')).toBeInTheDocument()
    expect(
      screen.getByText('Upload receipt, invoice, or transfer screenshot for instant OCR extraction')
    ).toBeInTheDocument()
    expect(screen.getByText('Extract with Gemini AI')).toBeInTheDocument()
  })

  it('does not render modal when closed', () => {
    render(
      <ReceiptUploadModal
        isOpen={false}
        onClose={vi.fn()}
        onReceiptExtracted={vi.fn()}
      />
    )

    expect(screen.queryByText('Scan Receipt with Gemini AI')).not.toBeInTheDocument()
  })
})
