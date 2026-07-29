import { X, FileSpreadsheet, FileText } from 'lucide-react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  recordCount: number
  onExportExcel: () => void
  onExportCSV: () => void
}

export function ExportModal({
  isOpen,
  onClose,
  recordCount,
  onExportExcel,
  onExportCSV,
}: ExportModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-modal w-full max-w-sm rounded-2xl p-6 border border-white/10 space-y-5 animate-fade-in text-center">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h3 className="font-bold text-white text-base">Export Financial History</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Export {recordCount} records for selected filter period.
        </p>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={onExportExcel}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)
          </button>

          <button
            onClick={onExportCSV}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-medium py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Download CSV (.csv)
          </button>
        </div>
      </div>
    </div>
  )
}
