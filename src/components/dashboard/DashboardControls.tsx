import { Tag, Download, Plus, MessageSquare, Scan, FileSpreadsheet } from 'lucide-react'
import { Button } from '../ui/button'
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
}: DashboardControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3">
        <label htmlFor="date-range-filter" className="text-xs font-medium text-gray-400">
          Filter Period:
        </label>
        <DateFilterPicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onOpenBankImportModal}
          variant="outline"
          size="sm"
          leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />}
          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        >
          Import CSV / Excel
        </Button>

        <Button
          onClick={onOpenReceiptModal}
          variant="outline"
          size="sm"
          leftIcon={<Scan className="w-3.5 h-3.5 text-amber-400" />}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
        >
          Scan Receipt
        </Button>

        <Button
          onClick={onOpenWhatsAppModal}
          variant="outline"
          size="sm"
          leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        >
          WhatsApp AI
        </Button>

        <Button
          onClick={onOpenCategoryModal}
          variant="outline"
          size="sm"
          leftIcon={<Tag className="w-3.5 h-3.5 text-indigo-400" />}
          className="bg-gray-800/90 hover:bg-gray-800 text-gray-200 border-gray-700/60"
        >
          Categories
        </Button>

        <Button
          onClick={onOpenExportModal}
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
          className="bg-gray-800/90 hover:bg-gray-800 text-gray-200 border-gray-700/60"
        >
          Export Data
        </Button>

        <Button
          onClick={onOpenAddTxModal}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Transaction
        </Button>
      </div>
    </div>
  )
}

