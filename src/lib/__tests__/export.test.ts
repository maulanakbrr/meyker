import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToCSV, exportToExcel } from '../export'
import type { Transaction } from '../../types'

vi.mock('exceljs', () => {
  class MockWorkbook {
    creator = ''
    created = new Date()
    addWorksheet = vi.fn().mockReturnValue({
      columns: [],
      getRow: vi.fn().mockReturnValue({
        font: {},
        fill: {},
        alignment: {},
        height: 0,
      }),
      addRow: vi.fn().mockReturnValue({
        getCell: vi.fn().mockReturnValue({
          font: {},
          numFmt: '',
          alignment: {},
        }),
        font: {},
      }),
    })
    xlsx = {
      writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    }
  }

  return {
    default: {
      Workbook: MockWorkbook,
    },
    Workbook: MockWorkbook,
  }
})

const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    userId: 'user-123',
    amount: 150000,
    type: 'EXPENSE',
    transactionDate: '2026-07-25T10:00:00.000Z',
    categoryId: 'cat-01',
    paymentMethod: 'CREDIT_CARD',
    source: 'WEB',
    note: 'Weekly Grocery Shopping',
    createdAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-07-25T10:00:00.000Z',
    category: {
      id: 'cat-01',
      userId: 'user-123',
      name: 'Food & Dining',
      type: 'EXPENSE',
      icon: 'utensils',
      color: '#EF4444',
      isDefault: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },
  {
    id: 'tx-002',
    userId: 'user-123',
    amount: 5000000,
    type: 'INCOME',
    transactionDate: '2026-07-28T09:00:00.000Z',
    categoryId: 'cat-02',
    paymentMethod: 'BANK_TRANSFER',
    source: 'WEB',
    note: 'Monthly Salary "July"',
    createdAt: '2026-07-28T09:00:00.000Z',
    updatedAt: '2026-07-28T09:00:00.000Z',
    category: {
      id: 'cat-02',
      userId: 'user-123',
      name: 'Salary',
      type: 'INCOME',
      icon: 'wallet',
      color: '#10B981',
      isDefault: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },
]

describe('Export Utility Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportToCSV', () => {
    it('generates a CSV file blob and triggers download', () => {
      exportToCSV(mockTransactions, 'test_export')

      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1)
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('handles empty transaction list gracefully', () => {
      exportToCSV([], 'empty_export')

      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1)
    })
  })

  describe('exportToExcel', () => {
    it('generates an Excel (.xlsx) file and triggers download', async () => {
      await exportToExcel(mockTransactions, 'excel_test')

      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1)
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })
})
