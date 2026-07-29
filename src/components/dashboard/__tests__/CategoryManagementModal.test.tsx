import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryManagementModal } from '../CategoryManagementModal'
import type { Category } from '../../../types'

describe('CategoryManagementModal', () => {
  const sampleCategories: Category[] = [
    { id: 'cat-1', name: 'Groceries', type: 'EXPENSE', icon: 'Tag', color: '#ff0000', isDefault: true },
  ]

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <CategoryManagementModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={sampleCategories}
        catName=""
        setCatName={vi.fn()}
        catType="EXPENSE"
        setCatType={vi.fn()}
        catColor="#6366f1"
        setCatColor={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders existing categories and form submission', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())

    render(
      <CategoryManagementModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={sampleCategories}
        catName="Investments"
        setCatName={vi.fn()}
        catType="EXPENSE"
        setCatType={vi.fn()}
        catColor="#6366f1"
        setCatColor={vi.fn()}
      />
    )

    expect(screen.getByText('Category Management')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()

    const createBtn = screen.getByRole('button', { name: /create category/i })
    fireEvent.click(createBtn)
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
