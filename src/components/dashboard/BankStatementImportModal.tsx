import { useState } from 'react'
import { FileSpreadsheet, Check, AlertCircle, Building2, Upload, ArrowRight, CheckCircle2, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { FileDropzone } from '../ui/file-dropzone'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import {
  detectBankFormat,
  parseFileRows,
  mapRowsToTransactions,
  downloadImportTemplateCSV,
  downloadImportTemplateXLSX,
  matchCategoryForTransaction,
  type BankFormatPreset,
  type ColumnMapping,
  type ParsedBankTransaction,
} from '../../lib/bankStatementParser'
import type { Category } from '../../types'

interface BankStatementImportModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onImportTransactions: (transactions: {
    date: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    categoryId: string
    note: string
    paymentMethod: 'BANK_TRANSFER'
  }[]) => Promise<void>
}

const BANK_PRESETS: { key: BankFormatPreset; label: string }[] = [
  { key: 'AUTO', label: '⚡ Auto Detect Format' },
  { key: 'GENERIC', label: 'Standard CSV / Excel Template' },
  { key: 'BCA', label: 'BCA (myBCA / KlikBCA)' },
  { key: 'MANDIRI', label: 'Mandiri (Livin\' by Mandiri)' },
  { key: 'BRI', label: 'BRI (BRImo)' },
  { key: 'CIMB', label: 'CIMB Niaga' },
  { key: 'CUSTOM', label: 'Custom Column Mapping' },
]

export function BankStatementImportModal({
  isOpen,
  onClose,
  categories,
  onImportTransactions,
}: BankStatementImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Step 2 Data
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([])
  const [preset, setPreset] = useState<BankFormatPreset>('AUTO')
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateColumn: '',
    descriptionColumn: '',
    amountColumn: '',
  })

  // Parsed Transactions
  const [parsedTransactions, setParsedTransactions] = useState<ParsedBankTransaction[]>([])
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set())
  const [categoryAssignments, setCategoryAssignments] = useState<Record<string, string>>({})

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setIsProcessingFile(true)
    setErrorMsg(null)

    try {
      const { headers: parsedHeaders, rows: parsedRows } = await parseFileRows(file)

      if (parsedHeaders.length === 0 || parsedRows.length === 0) {
        throw new Error('File is empty or could not be parsed as CSV/Excel.')
      }

      setHeaders(parsedHeaders)
      setRawRows(parsedRows)

      // Auto detect bank format
      const { preset: detectedPreset, mapping: detectedMapping } = detectBankFormat(parsedHeaders)
      setPreset(detectedPreset)
      setMapping(detectedMapping)

      // Map rows to transactions
      const txs = mapRowsToTransactions(parsedRows, detectedMapping)
      setParsedTransactions(txs)
      setSelectedTxIds(new Set(txs.filter((t) => t.isValid).map((t) => t.id)))

      // Intelligently assign category matching note / category column
      const initialCatMap: Record<string, string> = {}
      txs.forEach((t) => {
        initialCatMap[t.id] = matchCategoryForTransaction(t, categories)
      })
      setCategoryAssignments(initialCatMap)
    } catch (err: any) {
      console.error('[Bank Import Error]', err)
      setErrorMsg(err?.message || 'Failed to parse bank statement file.')
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handlePresetChange = (newPreset: BankFormatPreset) => {
    setPreset(newPreset)
    let newMapping = { ...mapping }
    if (newPreset !== 'CUSTOM' && newPreset !== 'AUTO') {
      const { mapping: presetMapping } = detectBankFormat(headers)
      newMapping = presetMapping
    }
    setMapping(newMapping)

    // Re-map transactions
    const txs = mapRowsToTransactions(rawRows, newMapping)
    setParsedTransactions(txs)
    setSelectedTxIds(new Set(txs.filter((t) => t.isValid).map((t) => t.id)))

    const initialCatMap: Record<string, string> = {}
    txs.forEach((t) => {
      initialCatMap[t.id] = matchCategoryForTransaction(t, categories)
    })
    setCategoryAssignments(initialCatMap)
  }

  const handleMappingFieldChange = (field: keyof ColumnMapping, colName: string) => {
    const updatedMapping = { ...mapping, [field]: colName }
    setMapping(updatedMapping)

    // Re-map transactions
    const txs = mapRowsToTransactions(rawRows, updatedMapping)
    setParsedTransactions(txs)
    setSelectedTxIds(new Set(txs.filter((t) => t.isValid).map((t) => t.id)))

    const initialCatMap: Record<string, string> = {}
    txs.forEach((t) => {
      initialCatMap[t.id] = matchCategoryForTransaction(t, categories)
    })
    setCategoryAssignments(initialCatMap)
  }

  const toggleSelectTx = (id: string) => {
    const next = new Set(selectedTxIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedTxIds(next)
  }

  const toggleSelectAll = () => {
    const validTxs = parsedTransactions.filter((t) => t.isValid)
    if (selectedTxIds.size === validTxs.length) {
      setSelectedTxIds(new Set())
    } else {
      setSelectedTxIds(new Set(validTxs.map((t) => t.id)))
    }
  }

  const handleImportSubmit = async () => {
    const txsToImport = parsedTransactions
      .filter((t) => selectedTxIds.has(t.id) && t.isValid)
      .map((t) => ({
        date: t.date,
        amount: t.amount,
        type: t.type,
        categoryId: categoryAssignments[t.id] || categories[0]?.id || '',
        note: t.note,
        paymentMethod: 'BANK_TRANSFER' as const,
      }))

    if (txsToImport.length === 0) return

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await onImportTransactions(txsToImport)
      handleClose()
    } catch (err: any) {
      console.error('[Import Save Error]', err)
      setErrorMsg(err?.message || 'Failed to save imported transactions.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setHeaders([])
    setRawRows([])
    setParsedTransactions([])
    setSelectedTxIds(new Set())
    setErrorMsg(null)
    onClose()
  }

  const selectedCount = selectedTxIds.size
  const totalAmountIncome = parsedTransactions
    .filter((t) => selectedTxIds.has(t.id) && t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalAmountExpense = parsedTransactions
    .filter((t) => selectedTxIds.has(t.id) && t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-3xl w-full bg-gray-950 border border-gray-800 text-white rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-bold">
                Import Transactions (CSV / Excel)
              </DialogTitle>
              <p className="text-xs text-gray-400">
                Upload CSV/Excel spreadsheet to batch import transactions into your account
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: File Dropzone & Download Template */}
        {!selectedFile && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-900 border border-gray-800 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Download className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Need a sample file structure? Download a template:</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadImportTemplateCSV}
                  leftIcon={<Download className="w-3.5 h-3.5 text-indigo-400" />}
                  className="bg-gray-950 border-gray-800 text-gray-200 text-[11px] h-7"
                >
                  CSV Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadImportTemplateXLSX}
                  leftIcon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
                  className="bg-gray-950 border-gray-800 text-gray-200 text-[11px] h-7"
                >
                  XLSX Template
                </Button>
              </div>
            </div>

            <FileDropzone
              onFileSelect={handleFileSelect}
              accept=".csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              maxSizeMB={10}
              isProcessing={isProcessingFile}
              label="Drag & drop your CSV or Excel file here"
              hint="Supports CSV and XLSX formats up to 10MB"
            />
          </div>
        )}

        {/* Step 2: Auto-detected Bank Format & Custom Column Mapping */}
        {selectedFile && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-900 border border-gray-800">
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-gray-400 font-medium">Bank Statement Format:</span>
                <span className="font-bold text-white bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                  {preset} Format
                </span>
              </div>

              <div className="w-full sm:w-56">
                <Select value={preset} onValueChange={(val) => handlePresetChange(val as BankFormatPreset)}>
                  <SelectTrigger className="h-8 text-xs bg-gray-950 border-gray-800 text-gray-200">
                    <SelectValue placeholder="Select Format Preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                    {BANK_PRESETS.map((p) => (
                      <SelectItem key={p.key} value={p.key} className="text-xs">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Column Mapper Dropdowns */}
            {preset === 'CUSTOM' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 mb-1 block">
                    Date Column:
                  </label>
                  <Select
                    value={mapping.dateColumn}
                    onValueChange={(val) => handleMappingFieldChange('dateColumn', val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-gray-950 border-gray-800 text-gray-200">
                      <SelectValue placeholder="Select Date Column" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                      {headers.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 mb-1 block">
                    Description Column:
                  </label>
                  <Select
                    value={mapping.descriptionColumn}
                    onValueChange={(val) => handleMappingFieldChange('descriptionColumn', val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-gray-950 border-gray-800 text-gray-200">
                      <SelectValue placeholder="Select Description Column" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                      {headers.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 mb-1 block">
                    Amount Column:
                  </label>
                  <Select
                    value={mapping.amountColumn || ''}
                    onValueChange={(val) => handleMappingFieldChange('amountColumn', val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-gray-950 border-gray-800 text-gray-200">
                      <SelectValue placeholder="Select Amount Column" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                      {headers.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Parsed Transactions Preview Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-semibold text-gray-300">
                  Transactions Preview ({parsedTransactions.length} rows found)
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  {selectedCount === parsedTransactions.filter((t) => t.isValid).length
                    ? 'Deselect All'
                    : 'Select All Valid'}
                </button>
              </div>

              <div className="border border-gray-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-900/90 text-gray-400 sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 w-8">
                        <input
                          type="checkbox"
                          checked={
                            selectedCount > 0 &&
                            selectedCount === parsedTransactions.filter((t) => t.isValid).length
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-gray-700 bg-gray-900 text-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-right">Amount (Rp)</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 bg-gray-950">
                    {parsedTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className={`hover:bg-gray-900/50 ${!tx.isValid ? 'opacity-50 bg-rose-500/5' : ''}`}
                      >
                        <td className="p-2.5">
                          <input
                            type="checkbox"
                            checked={selectedTxIds.has(tx.id)}
                            disabled={!tx.isValid}
                            onChange={() => toggleSelectTx(tx.id)}
                            className="rounded border-gray-700 bg-gray-900 text-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="p-2.5 font-medium whitespace-nowrap text-gray-300">
                          {tx.date}
                        </td>
                        <td className="p-2.5 text-gray-200 max-w-xs truncate">{tx.note}</td>
                        <td className="p-2.5 text-right font-bold whitespace-nowrap text-white">
                          Rp {tx.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              tx.type === 'INCOME'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-2.5 w-36">
                          <Select
                            value={categoryAssignments[tx.id] || categories[0]?.id || ''}
                            onValueChange={(catId) =>
                              setCategoryAssignments((prev) => ({ ...prev, [tx.id]: catId }))
                            }
                          >
                            <SelectTrigger className="h-7 text-[11px] bg-gray-900 border-gray-800 text-gray-200">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800 text-white">
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id} className="text-xs">
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs">
              <span className="font-semibold text-indigo-300">
                Ready to import {selectedCount} transactions:
              </span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-bold">
                  + Rp {totalAmountIncome.toLocaleString('id-ID')} Income
                </span>
                <span className="text-rose-400 font-bold">
                  - Rp {totalAmountExpense.toLocaleString('id-ID')} Expense
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          {selectedFile ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedFile(null)}
              className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
            >
              Choose Different File
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>

            {selectedFile && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleImportSubmit}
                disabled={selectedCount === 0 || isSubmitting}
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Import {selectedCount} Transactions
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
