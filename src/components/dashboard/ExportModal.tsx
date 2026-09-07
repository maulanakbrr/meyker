import { FileSpreadsheet, FileText, FileDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  recordCount: number
  onExportExcel: () => void
  onExportCSV: () => void
  onExportPDF?: () => void
}

export function ExportModal({
  isOpen,
  onClose,
  recordCount,
  onExportExcel,
  onExportCSV,
  onExportPDF,
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

        <div className="grid grid-cols-1 gap-2.5 pt-2">
          {onExportPDF && (
            <Button
              onClick={onExportPDF}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20"
            >
              <FileDown className="w-4 h-4 mr-2" /> Download PDF Statement (.pdf)
            </Button>
          )}

          <Button
            onClick={onExportExcel}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Excel (.xlsx)
          </Button>

          <Button
            onClick={onExportCSV}
            variant="outline"
            className="w-full border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-200"
          >
            <FileText className="w-4 h-4 mr-2" /> Download CSV (.csv)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

