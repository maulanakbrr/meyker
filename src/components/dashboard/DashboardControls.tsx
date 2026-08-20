import { Calendar, Tag, Download, Plus, MessageSquare, Scan } from 'lucide-react'
import { Button } from '../ui/button'

interface DashboardControlsProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
  onOpenCategoryModal: () => void
  onOpenExportModal: () => void
  onOpenAddTxModal: () => void
  onOpenWhatsAppModal: () => void
  onOpenReceiptModal: () => void
}

export function DashboardControls({
  selectedMonth,
  onMonthChange,
  onOpenCategoryModal,
  onOpenExportModal,
  onOpenAddTxModal,
  onOpenWhatsAppModal,
  onOpenReceiptModal,
}: DashboardControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
        <label htmlFor="month-filter" className="text-xs font-medium text-gray-400">
          Filter Month:
        </label>
        <input
          id="month-filter"
          name="selectedMonth"
          type="month"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
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

