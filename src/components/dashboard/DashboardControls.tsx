import { Calendar, Tag, Download, Plus, MessageSquare } from 'lucide-react'

interface DashboardControlsProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
  onOpenCategoryModal: () => void
  onOpenExportModal: () => void
  onOpenAddTxModal: () => void
  onOpenWhatsAppModal: () => void
}

export function DashboardControls({
  selectedMonth,
  onMonthChange,
  onOpenCategoryModal,
  onOpenExportModal,
  onOpenAddTxModal,
  onOpenWhatsAppModal,
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
          type="month"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onOpenWhatsAppModal}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium px-3.5 py-2 rounded-xl transition-all flex items-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp AI
        </button>

        <button
          onClick={onOpenCategoryModal}
          className="bg-gray-800/90 hover:bg-gray-800 text-gray-200 border border-gray-700/60 text-xs font-medium px-3.5 py-2 rounded-xl transition-all flex items-center gap-2"
        >
          <Tag className="w-3.5 h-3.5 text-indigo-400" /> Categories
        </button>

        <button
          onClick={onOpenExportModal}
          className="bg-gray-800/90 hover:bg-gray-800 text-gray-200 border border-gray-700/60 text-xs font-medium px-3.5 py-2 rounded-xl transition-all flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Data
        </button>

        <button
          onClick={onOpenAddTxModal}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>
    </div>
  )
}
