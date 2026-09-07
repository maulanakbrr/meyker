import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { UploadCloud, Image as ImageIcon, FileText, X, Loader2 } from 'lucide-react'

export interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
  isProcessing?: boolean
  label?: string
  hint?: string
  className?: string
}

export function FileDropzone({
  onFileSelect,
  accept = 'image/*',
  maxSizeMB = 10,
  isProcessing = false,
  label = 'Drag and drop your file here, or click to browse',
  hint = 'Supports PNG, JPG, WEBP up to 10MB',
  className = '',
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (file: File | undefined) => {
    setErrorMessage(null)
    if (!file) return

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File size exceeds maximum limit of ${maxSizeMB}MB`)
      return
    }

    setSelectedFile(file)

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }

    onFileSelect(file)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0])
    }
  }

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setErrorMessage(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        id="file-dropzone-input"
      />

      {!selectedFile ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
              : 'border-gray-700/80 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/80'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-gray-200 mb-1">{label}</p>
          <p className="text-[11px] text-gray-400">{hint}</p>
        </div>
      ) : (
        <div className="relative border border-gray-700/80 bg-gray-900/80 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded receipt preview"
                className="w-12 h-12 rounded-xl object-cover border border-gray-700 flex-shrink-0"
              />
            ) : selectedFile.type.startsWith('image/') ? (
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isProcessing ? (
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium px-2 py-1 bg-indigo-500/10 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={clearFile}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>}
    </div>
  )
}
