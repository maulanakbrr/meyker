import ExcelJS from 'exceljs'
import type { Transaction } from '../types'
export { exportToPdf, formatIdrCurrency } from './pdfExport'

/**
 * Export transactions list to a styled Excel (.xlsx) file using ExcelJS
 */
export async function exportToExcel(transactions: Transaction[], filename: string = 'meyker_transactions') {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Meyker Financial Tracker'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet('Transactions', {
    views: [{ showGridLines: true }],
  })

  // Define columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 28 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 18 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
    { header: 'Source', key: 'source', width: 14 },
    { header: 'Note', key: 'note', width: 30 },
  ]

  // Style Header Row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F46E5' }, // Indigo-600
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 24

  // Add Data Rows
  transactions.forEach((tx) => {
    const formattedDate = new Date(tx.transactionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    const row = worksheet.addRow({
      id: tx.id,
      date: formattedDate,
      type: tx.type,
      category: tx.category?.name || 'Uncategorized',
      amount: tx.amount,
      paymentMethod: tx.paymentMethod.replace('_', ' '),
      source: tx.source,
      note: tx.note || '-',
    })

    // Format Type cell color
    const typeCell = row.getCell('type')
    if (tx.type === 'INCOME') {
      typeCell.font = { color: { argb: '16A34A' }, bold: true } // Green
    } else {
      typeCell.font = { color: { argb: 'DC2626' }, bold: true } // Red
    }

    // Format Amount cell
    const amountCell = row.getCell('amount')
    amountCell.numFmt = '#,##0.00'
    amountCell.alignment = { horizontal: 'right' }
  })

  // Summary Row
  const totalRow = worksheet.addRow({
    id: 'TOTAL',
    date: '',
    type: '',
    category: '',
    amount: transactions.reduce((acc, curr) => {
      return curr.type === 'INCOME' ? acc + Number(curr.amount) : acc - Number(curr.amount)
    }, 0),
    paymentMethod: '',
    source: '',
    note: 'Net Balance',
  })

  totalRow.font = { bold: true }
  const totalAmountCell = totalRow.getCell('amount')
  totalAmountCell.numFmt = '#,##0.00'

  // Generate Buffer & Save File
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  downloadBlob(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

/**
 * Export transactions list to a clean CSV file
 */
export function exportToCSV(transactions: Transaction[], filename: string = 'meyker_transactions') {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Source', 'Note']
  const rows = transactions.map((tx) => [
    tx.id,
    new Date(tx.transactionDate).toISOString().slice(0, 10),
    tx.type,
    `"${(tx.category?.name || 'Uncategorized').replace(/"/g, '""')}"`,
    tx.amount,
    tx.paymentMethod,
    tx.source,
    `"${(tx.note || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  downloadBlob(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
