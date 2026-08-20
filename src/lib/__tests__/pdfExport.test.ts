import { describe, it, expect, vi } from 'vitest'
import { exportToPdf, formatIdrCurrency } from '../pdfExport'
import type { Transaction } from '../../types'
import type { DashboardStats, CategoryBreakdownItem } from '../dashboardUtils'

// Mock jsPDF constructor to support `new jsPDF(...)`
vi.mock('jspdf', () => {
  return {
    default: class MockJsPDF {
      internal = {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
        getNumberOfPages: () => 1,
      }
      lastAutoTable = { finalY: 100 }
      setFillColor = vi.fn()
      rect = vi.fn()
      roundedRect = vi.fn()
      setDrawColor = vi.fn()
      setTextColor = vi.fn()
      setFont = vi.fn()
      setFontSize = vi.fn()
      text = vi.fn()
      line = vi.fn()
      setPage = vi.fn()
      save = vi.fn()
    },
  }
})

vi.mock('jspdf-autotable', () => {
  return {
    default: vi.fn().mockImplementation((doc: any) => {
      doc.lastAutoTable = { finalY: 120 }
    }),
  }
})

describe('pdfExport module', () => {
  it('correctly formats IDR currency string', () => {
    const formattedPos = formatIdrCurrency(150000)
    expect(formattedPos).toContain('150.000')

    const formattedZero = formatIdrCurrency(0)
    expect(formattedZero).toContain('0')
  })

  it('generates PDF document without throwing errors', async () => {
    const sampleTxs: Transaction[] = [
      {
        id: '1',
        userId: 'user-1',
        categoryId: 'cat-1',
        amount: 50000,
        type: 'EXPENSE',
        transactionDate: '2026-08-20',
        paymentMethod: 'CASH',
        note: 'Lunch at Warung',
        source: 'WEB',
        category: { id: 'cat-1', name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils', color: '#f59e0b', isDefault: true },
      },
      {
        id: '2',
        userId: 'user-1',
        categoryId: 'cat-2',
        amount: 5000000,
        type: 'INCOME',
        transactionDate: '2026-08-21',
        paymentMethod: 'BANK_TRANSFER',
        note: 'Monthly Salary',
        source: 'IMPORT',
        category: { id: 'cat-2', name: 'Salary & Wages', type: 'INCOME', icon: 'Wallet', color: '#10b981', isDefault: true },
      },
    ]

    const sampleStats: DashboardStats = {
      totalIncome: 5000000,
      totalExpenses: 50000,
      totalBalance: 4950000,
    }

    const sampleBreakdown: CategoryBreakdownItem[] = [
      { name: 'Food & Dining', value: 50000, color: '#f59e0b' },
    ]

    await expect(
      exportToPdf(sampleTxs, sampleStats, sampleBreakdown, 'August 2026', 'test_statement')
    ).resolves.not.toThrow()
  })
})
