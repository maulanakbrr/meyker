import { FileSpreadsheet, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-gray-950 text-white border-gray-800 text-center space-y-4">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Export Financial History</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-gray-400">
          Export {recordCount} records for selected filter period.
        </p>

        <div className="grid grid-cols-1 gap-3 pt-2">
          <Button
            onClick={onExportExcel}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Excel (.xlsx)
          </Button>

          <Button
            onClick={onExportCSV}
            variant="outline"
            className="w-full border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-200"
          >
            <FileText className="w-4 h-4 mr-2" /> Download CSV (.csv)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

