import { useState } from 'react'
import {
  Tag,
  Download,
  Plus,
  MessageSquare,
  Scan,
  FileSpreadsheet,
  PieChart,
  Target,
  Repeat,
  RefreshCw,
  ArrowUpDown,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { DateFilterPicker } from './DateFilterPicker'
import type { DateFilterRange } from '../../lib/dateUtils'

interface DashboardControlsProps {
  dateRange: DateFilterRange
  onDateRangeChange: (range: DateFilterRange) => void
  onOpenCategoryModal: () => void
  onOpenExportModal: () => void
  onOpenAddTxModal: () => void
  onOpenWhatsAppModal: () => void
  onOpenReceiptModal: () => void
  onOpenBankImportModal: () => void
  onOpenBudgetModal?: () => void
  onOpenSavingsGoalModal?: () => void
  onOpenRecurringModal?: () => void
  onOpenGoogleSheetsModal?: () => void
}

export function DashboardControls({
  dateRange,
  onDateRangeChange,
  onOpenCategoryModal,
  onOpenExportModal,
  onOpenAddTxModal,
  onOpenWhatsAppModal,
  onOpenReceiptModal,
  onOpenBankImportModal,
  onOpenBudgetModal,
  onOpenSavingsGoalModal,
  onOpenRecurringModal,
  onOpenGoogleSheetsModal,
}: DashboardControlsProps) {
  const [dataSyncOpen, setDataSyncOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-2xl border border-white/10">
      {/* Left: Date Period Filter */}
      <div className="flex items-center gap-3">
        <label htmlFor="date-range-filter" className="text-xs font-medium text-gray-400 shrink-0">
          Filter Period:
        </label>
        <DateFilterPicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
      </div>

      {/* Right: Consolidated Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* 1. Data & Sync Dropdown */}
        <Popover open={dataSyncOpen} onOpenChange={setDataSyncOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900/80 hover:bg-gray-800 text-gray-200 border-gray-800 gap-1.5 h-9 text-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Data & Sync</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-50">
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setDataSyncOpen(false)
                  onOpenBankImportModal()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col">
                  <span>Import CSV / Excel</span>
                  <span className="text-[10px] text-gray-500 font-normal">Bank statements & sheets</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDataSyncOpen(false)
                  onOpenExportModal()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span>Export Data</span>
                  <span className="text-[10px] text-gray-500 font-normal">Excel, CSV & PDF report</span>
                </div>
              </button>

              {onOpenGoogleSheetsModal && (
                <button
                  type="button"
                  onClick={() => {
                    setDataSyncOpen(false)
                    onOpenGoogleSheetsModal()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Google Sheets Sync</span>
                    <span className="text-[10px] text-gray-500 font-normal">Cloud spreadsheet backup</span>
                  </div>
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. More Settings & Shortcuts Dropdown */}
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900/80 hover:bg-gray-800 text-gray-200 border-gray-800 gap-1.5 h-9 text-xs"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span>More</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-50">
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  onOpenCategoryModal()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
              >
                <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col">
                  <span>Categories</span>
                  <span className="text-[10px] text-gray-500 font-normal">Manage icons & badges</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  onOpenWhatsAppModal()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span>WhatsApp AI</span>
                  <span className="text-[10px] text-gray-500 font-normal">Configure linked phone</span>
                </div>
              </button>

              <div className="h-px bg-gray-800 my-1" />

              {onOpenRecurringModal && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false)
                    onOpenRecurringModal()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Repeat className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Recurring Rules</span>
                    <span className="text-[10px] text-gray-500 font-normal">Automated subscriptions</span>
                  </div>
                </button>
              )}

              {onOpenBudgetModal && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false)
                    onOpenBudgetModal()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <PieChart className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Category Budgets</span>
                    <span className="text-[10px] text-gray-500 font-normal">Monthly spending caps</span>
                  </div>
                </button>
              )}

              {onOpenSavingsGoalModal && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false)
                    onOpenSavingsGoalModal()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Target className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Savings Goals</span>
                    <span className="text-[10px] text-gray-500 font-normal">Target goals & deposits</span>
                  </div>
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. Direct Quick Input: Scan Receipt */}
        <Button
          onClick={onOpenReceiptModal}
          variant="outline"
          size="sm"
          leftIcon={<Scan className="w-3.5 h-3.5 text-amber-400" />}
          className="bg-gray-900/80 hover:bg-gray-800 text-gray-200 border-gray-800 h-9 text-xs"
        >
          Scan Receipt
        </Button>

        {/* 4. Primary CTA: Add Transaction */}
        <Button
          onClick={onOpenAddTxModal}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          className="h-9 text-xs shadow-lg shadow-indigo-600/20 font-medium"
        >
          Add Transaction
        </Button>
      </div>
    </div>
  )
}

