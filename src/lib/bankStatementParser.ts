import Papa from 'papaparse'
import * as ExcelJS from 'exceljs'
import { cleanIdrAmountString } from './geminiOcr'

export type BankFormatPreset = 'AUTO' | 'BCA' | 'MANDIRI' | 'BRI' | 'CIMB' | 'GENERIC' | 'CUSTOM'

export interface ColumnMapping {
  dateColumn: string
  descriptionColumn: string
  amountColumn?: string
  typeColumn?: string
  debitColumn?: string
  creditColumn?: string
}

export interface ParsedBankTransaction {
  id: string
  date: string // YYYY-MM-DD
  note: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryHint?: string
  rawRow: Record<string, any>
  isValid: boolean
  validationError?: string
}

export async function downloadImportTemplateCSV() {
  const headers = ['Date', 'Type', 'Amount', 'Category', 'Payment Method', 'Note']
  const sampleRows = [
    ['2026-08-20', 'EXPENSE', '150000', 'Food & Dining', 'CASH', 'Lunch at Resto Bu Agus'],
    ['2026-08-21', 'INCOME', '5000000', 'Salary & Wages', 'BANK_TRANSFER', 'Monthly Salary Payment'],
    ['2026-08-22', 'EXPENSE', '45000', 'Transport & Fuel', 'E_WALLET', 'Gojek ride to office'],
  ]

  const csvContent = [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'meyker_import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadImportTemplateXLSX() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Transactions')

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
    { header: 'Note', key: 'note', width: 30 },
  ]

  worksheet.addRows([
    { date: '2026-08-20', type: 'EXPENSE', amount: 150000, category: 'Food & Dining', paymentMethod: 'CASH', note: 'Lunch at Resto Bu Agus' },
    { date: '2026-08-21', type: 'INCOME', amount: 5000000, category: 'Salary & Wages', paymentMethod: 'BANK_TRANSFER', note: 'Monthly Salary Payment' },
    { date: '2026-08-22', type: 'EXPENSE', amount: 45000, category: 'Transport & Fuel', paymentMethod: 'E_WALLET', note: 'Gojek ride to office' },
  ])

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'meyker_import_template.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Auto-detect Bank Format Preset based on CSV/Excel header names
 */
export function detectBankFormat(headers: string[]): { preset: BankFormatPreset; mapping: ColumnMapping } {
  const normalized = headers.map((h) => h.trim().toLowerCase())

  // 1. Detect BCA (KlikBCA / myBCA)
  const isBca = normalized.some((h) => h.includes('tanggal')) && normalized.some((h) => h.includes('keterangan')) && normalized.some((h) => h.includes('mutasi'))
  if (isBca) {
    return {
      preset: 'BCA',
      mapping: {
        dateColumn: findHeader(headers, ['tanggal', 'date']),
        descriptionColumn: findHeader(headers, ['keterangan', 'description', 'uraian']),
        amountColumn: findHeader(headers, ['mutasi', 'amount', 'nominal']),
      },
    }
  }

  // 2. Detect Mandiri (Livin' by Mandiri)
  const isMandiri = normalized.some((h) => h.includes('uraian') || h.includes('keterangan')) && normalized.some((h) => h.includes('debet') || h.includes('debit')) && normalized.some((h) => h.includes('kredit') || h.includes('credit'))
  if (isMandiri) {
    return {
      preset: 'MANDIRI',
      mapping: {
        dateColumn: findHeader(headers, ['tanggal transaksi', 'tanggal', 'date']),
        descriptionColumn: findHeader(headers, ['uraian', 'keterangan', 'description']),
        debitColumn: findHeader(headers, ['debet', 'debit']),
        creditColumn: findHeader(headers, ['kredit', 'credit']),
      },
    }
  }

  // 3. Detect BRI (BRImo)
  const isBri = normalized.some((h) => h.includes('uraian transaksi') || h.includes('transaksi')) && (normalized.some((h) => h.includes('debet')) || normalized.some((h) => h.includes('kredit')))
  if (isBri) {
    return {
      preset: 'BRI',
      mapping: {
        dateColumn: findHeader(headers, ['tanggal', 'date']),
        descriptionColumn: findHeader(headers, ['uraian transaksi', 'uraian', 'keterangan']),
        debitColumn: findHeader(headers, ['debet', 'debit']),
        creditColumn: findHeader(headers, ['kredit', 'credit']),
        amountColumn: findHeader(headers, ['nominal', 'amount']),
      },
    }
  }

  // 4. Detect CIMB OCTO
  const isCimb = normalized.some((h) => h.includes('transaction date')) && normalized.some((h) => h.includes('debit amount') || h.includes('credit amount'))
  if (isCimb) {
    return {
      preset: 'CIMB',
      mapping: {
        dateColumn: findHeader(headers, ['transaction date', 'date']),
        descriptionColumn: findHeader(headers, ['description', 'keterangan']),
        debitColumn: findHeader(headers, ['debit amount', 'debit']),
        creditColumn: findHeader(headers, ['credit amount', 'credit']),
      },
    }
  }

  // 5. Detect Generic CSV
  const dateCol = findHeader(headers, ['date', 'tanggal', 'tgl', 'time'])
  const descCol = findHeader(headers, ['description', 'desc', 'keterangan', 'note', 'uraian', 'payee', 'merchant'])
  const amtCol = findHeader(headers, ['amount', 'nominal', 'jumlah', 'mutasi', 'value'])
  const typeCol = findHeader(headers, ['type', 'tipe', 'category', 'jenis'])

  if (dateCol && descCol && amtCol) {
    return {
      preset: 'GENERIC',
      mapping: {
        dateColumn: dateCol,
        descriptionColumn: descCol,
        amountColumn: amtCol,
        typeColumn: typeCol || undefined,
      },
    }
  }

  // Fallback Custom
  return {
    preset: 'CUSTOM',
    mapping: {
      dateColumn: headers[0] || '',
      descriptionColumn: headers[1] || headers[0] || '',
      amountColumn: headers[2] || headers[0] || '',
    },
  }
}

function findHeader(headers: string[], candidates: string[]): string {
  for (const cand of candidates) {
    const match = headers.find((h) => h.trim().toLowerCase() === cand.toLowerCase() || h.trim().toLowerCase().includes(cand.toLowerCase()))
    if (match) return match
  }
  return headers[0] || ''
}

/**
 * Parse CSV raw text or Excel array buffer into array of objects with headers
 */
export async function parseFileRows(file: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

  if (isExcel) {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    const worksheet = workbook.worksheets[0]

    if (!worksheet) return { headers: [], rows: [] }

    const headers: string[] = []
    const rows: Record<string, any>[] = []

    let headerRowIndex = 1
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const rowValues = row.values as any[]
      if (rowNumber === 1 || (headers.length === 0 && rowValues.some((v) => v && typeof v === 'string'))) {
        headerRowIndex = rowNumber
        rowValues.forEach((cellVal, idx) => {
          if (idx > 0) headers.push(String(cellVal || `Column ${idx}`).trim())
        })
      } else if (rowNumber > headerRowIndex) {
        const rowObj: Record<string, any> = {}
        headers.forEach((h, idx) => {
          const val = rowValues[idx + 1]
          rowObj[h] = val !== undefined && val !== null ? String(val).trim() : ''
        })
        if (Object.values(rowObj).some((v) => v !== '')) {
          rows.push(rowObj)
        }
      }
    })

    return { headers, rows }
  } else {
    // Parse CSV via PapaParse
    const text = await file.text()
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || []
          const rows = (results.data as Record<string, any>[]).filter((r) => Object.values(r).some((v) => v !== ''))
          resolve({ headers, rows })
        },
        error: (err) => reject(err),
      })
    })
  }
}

/**
 * Map raw spreadsheet rows to clean ParsedBankTransaction objects based on ColumnMapping
 */
export function mapRowsToTransactions(
  rows: Record<string, any>[],
  mapping: ColumnMapping
): ParsedBankTransaction[] {
  return rows.map((row, idx) => {
    const id = `bank-tx-${idx}-${Date.now()}`
    const rawDate = row[mapping.dateColumn] || ''
    const rawDesc = row[mapping.descriptionColumn] || 'Bank Transaction'

    const cleanDateStr = parseFlexibleDate(String(rawDate))
    const note = String(rawDesc).trim() || 'Bank Entry'

    let amount = 0
    let type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
    let isValid = true
    let validationError: string | undefined = undefined

    // 1. Separate Debit / Credit Columns (Mandiri, BRI, CIMB)
    if (mapping.debitColumn && mapping.creditColumn) {
      const rawDebit = row[mapping.debitColumn]
      const rawCredit = row[mapping.creditColumn]

      const debitAmt = cleanIdrAmountString(rawDebit)
      const creditAmt = cleanIdrAmountString(rawCredit)

      if (creditAmt > 0 && debitAmt === 0) {
        amount = creditAmt
        type = 'INCOME'
      } else if (debitAmt > 0) {
        amount = debitAmt
        type = 'EXPENSE'
      } else if (creditAmt > 0) {
        amount = creditAmt
        type = 'INCOME'
      }
    }
    // 2. Single Amount Column + Mutasi / Type Tags (BCA or Generic)
    else if (mapping.amountColumn) {
      const rawAmtStr = String(row[mapping.amountColumn] || '')
      amount = cleanIdrAmountString(rawAmtStr)

      const upperStr = rawAmtStr.toUpperCase()
      if (upperStr.includes('CR') || upperStr.includes('KREDIT') || upperStr.includes('+')) {
        type = 'INCOME'
      } else if (upperStr.includes('DB') || upperStr.includes('DEBET') || upperStr.includes('-')) {
        type = 'EXPENSE'
      } else if (mapping.typeColumn && row[mapping.typeColumn]) {
        const typeVal = String(row[mapping.typeColumn]).toUpperCase()
        if (typeVal.includes('INC') || typeVal.includes('INCOME') || typeVal.includes('MASUK') || typeVal === 'CR' || typeVal === 'K') {
          type = 'INCOME'
        } else {
          type = 'EXPENSE'
        }
      }
    }

    if (!cleanDateStr) {
      isValid = false
      validationError = 'Invalid or missing date'
    } else if (amount <= 0) {
      isValid = false
      validationError = 'Amount is zero or missing'
    }

    return {
      id,
      date: cleanDateStr || new Date().toISOString().slice(0, 10),
      note,
      amount,
      type,
      rawRow: row,
      isValid,
      validationError,
    }
  })
}

/**
 * Parse flexible date strings e.g. "20/08/2026", "2026-08-20", "20-Aug-2026"
 */
export function parseFlexibleDate(rawDateStr: string): string | null {
  if (!rawDateStr) return null
  const str = rawDateStr.trim()

  // 1. ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10)
  }

  // 2. DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (ddmmyyyyMatch) {
    const day = String(ddmmyyyyMatch[1]).padStart(2, '0')
    const month = String(ddmmyyyyMatch[2]).padStart(2, '0')
    const year = ddmmyyyyMatch[3]
    return `${year}-${month}-${day}`
  }

  // 3. YYYY/MM/DD
  const yyyymmddMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (yyyymmddMatch) {
    const year = yyyymmddMatch[1]
    const month = String(yyyymmddMatch[2]).padStart(2, '0')
    const day = String(yyyymmddMatch[3]).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const dateObj = new Date(str)
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return null
}

/**
 * Intelligently match category for a parsed bank transaction based on Category column or note keywords
 */
export function matchCategoryForTransaction(
  tx: ParsedBankTransaction,
  categories: { id: string; name: string; type: 'INCOME' | 'EXPENSE' }[]
): string {
  if (!categories || categories.length === 0) return ''

  // 1. Check if raw row has a Category / Kategori column value
  const rawCatName =
    tx.rawRow?.Category ||
    tx.rawRow?.category ||
    tx.rawRow?.Kategori ||
    tx.rawRow?.kategori ||
    tx.rawRow?.['Category Name']

  if (rawCatName) {
    const target = String(rawCatName).trim().toLowerCase()
    const matchedByName = categories.find((c) => c.name.toLowerCase() === target || c.name.toLowerCase().includes(target))
    if (matchedByName) return matchedByName.id
  }

  // 2. Intelligent Keyword Matching from Note / Description
  const descLower = tx.note.toLowerCase()

  if (
    descLower.includes('gaji') ||
    descLower.includes('salary') ||
    descLower.includes('payroll') ||
    descLower.includes('paycheck')
  ) {
    const c = categories.find(
      (cat) => cat.name.toLowerCase().includes('salary') || cat.name.toLowerCase().includes('gaji')
    )
    if (c) return c.id
  }

  if (
    descLower.includes('freelance') ||
    descLower.includes('project') ||
    descLower.includes('client') ||
    descLower.includes('invoice') ||
    descLower.includes('business')
  ) {
    const c = categories.find(
      (cat) => cat.name.toLowerCase().includes('freelance') || cat.name.toLowerCase().includes('business')
    )
    if (c) return c.id
  }

  if (
    descLower.includes('gojek') ||
    descLower.includes('grab') ||
    descLower.includes('bensin') ||
    descLower.includes('pertamina') ||
    descLower.includes('shell') ||
    descLower.includes('parkir') ||
    descLower.includes('toll') ||
    descLower.includes('transport')
  ) {
    const c = categories.find(
      (cat) => cat.name.toLowerCase().includes('transport') || cat.name.toLowerCase().includes('fuel')
    )
    if (c) return c.id
  }

  if (
    descLower.includes('kopi') ||
    descLower.includes('resto') ||
    descLower.includes('makan') ||
    descLower.includes('food') ||
    descLower.includes('cafe') ||
    descLower.includes('starbucks') ||
    descLower.includes('warung') ||
    descLower.includes('bakso') ||
    descLower.includes('lunch') ||
    descLower.includes('dinner')
  ) {
    const c = categories.find(
      (cat) => cat.name.toLowerCase().includes('food') || cat.name.toLowerCase().includes('dining')
    )
    if (c) return c.id
  }

  if (
    descLower.includes('listrik') ||
    descLower.includes('pln') ||
    descLower.includes('air') ||
    descLower.includes('pdam') ||
    descLower.includes('internet') ||
    descLower.includes('indihome') ||
    descLower.includes('pulsa') ||
    descLower.includes('tokopedia') ||
    descLower.includes('bills')
  ) {
    const c = categories.find(
      (cat) => cat.name.toLowerCase().includes('utilities') || cat.name.toLowerCase().includes('bills')
    )
    if (c) return c.id
  }

  if (
    descLower.includes('sewa') ||
    descLower.includes('rent') ||
    descLower.includes('kos') ||
    descLower.includes('rumah')
  ) {
    const c = categories.find(
      (cat) => cat.name.toLowerCase().includes('housing') || cat.name.toLowerCase().includes('rent')
    )
    if (c) return c.id
  }

  // 3. Fallback matching transaction type (INCOME vs EXPENSE)
  const matchingTypeCat = categories.find((c) => c.type === tx.type)
  if (matchingTypeCat) return matchingTypeCat.id

  return categories[0]?.id || ''
}
