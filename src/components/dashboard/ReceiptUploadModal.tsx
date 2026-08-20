import { useState } from 'react'
import { Sparkles, Scan, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { FileDropzone } from '../ui/file-dropzone'
import { Button } from '../ui/button'
import { processReceiptImageWithGemini, type ExtractedReceiptData } from '../../lib/geminiOcr'

interface ReceiptUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onReceiptExtracted: (data: ExtractedReceiptData) => void
}

export function ReceiptUploadModal({
  isOpen,
  onClose,
  onReceiptExtracted,
}: ReceiptUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [scanNotice, setScanNotice] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setErrorMsg(null)
    setScanNotice(null)
  }

  const handleScanReceipt = async () => {
    if (!selectedFile) return
    setIsScanning(true)
    setErrorMsg(null)
    setScanNotice(null)

    try {
      // Read file as base64 string
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (err) => reject(err)
      })
      reader.readAsDataURL(selectedFile)

      const base64Data = await base64Promise
      const mimeType = selectedFile.type || 'image/jpeg'

      const extractedData = await processReceiptImageWithGemini(base64Data, mimeType)

      if (extractedData.engineNotice) {
        setScanNotice(extractedData.engineNotice)
      }

      onReceiptExtracted(extractedData)
      handleClose()
    } catch (err: any) {
      console.error('[Receipt Upload Error]', err)
      setErrorMsg(
        err?.message ||
          'Failed to scan receipt image. Please verify your GEMINI_API_KEY or try a clearer receipt image.'
      )
    } finally {
      setIsScanning(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setIsScanning(false)
    setErrorMsg(null)
    setScanNotice(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl w-full bg-gray-950 border border-gray-800 text-white rounded-2xl p-6 shadow-2xl space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-bold">
                Scan Receipt with Gemini AI
              </DialogTitle>
              <p className="text-xs text-gray-400">
                Upload receipt, invoice, or transfer screenshot for instant OCR extraction
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1 flex flex-col">
          {/* File Dropzone */}
          <FileDropzone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={10}
            isProcessing={isScanning}
            label="Drag & drop receipt image or click to browse"
            hint="Supports PNG, JPG, WEBP up to 10MB"
          />

          {isScanning && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-center gap-2.5 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              <span className="font-medium">Extracting receipt data with Gemini AI...</span>
            </div>
          )}

          {scanNotice && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{scanNotice}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 mt-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isScanning}
              className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleScanReceipt}
              disabled={!selectedFile || isScanning}
              isLoading={isScanning}
              leftIcon={!isScanning ? <Sparkles className="w-4 h-4 text-amber-300" /> : undefined}
            >
              {isScanning ? 'Extracting Details...' : 'Extract with Gemini AI'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
