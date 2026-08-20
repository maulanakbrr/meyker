import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Transaction } from '../types'
import type { DashboardStats, CategoryBreakdownItem } from './dashboardUtils'

/**
 * Safely format IDR currency values e.g. "Rp 150.000"
 */
export function formatIdrCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Export transactions, KPI summary stats, and category breakdown to a branded PDF statement
 */
export async function exportToPdf(
  transactions: Transaction[],
  stats: DashboardStats,
  categoryBreakdown: CategoryBreakdownItem[] = [],
  periodLabel: string = 'All Time',
  filename: string = 'meyker_financial_statement'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Header Banner
  doc.setFillColor(79, 70, 229) // Indigo 600
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('Meyker Financial Tracker', 14, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(224, 231, 255)
  doc.text('Monthly Financial Statement & Tax Summary Report', 14, 21)

  // Right-aligned header metadata
  doc.setFontSize(9)
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  doc.text(`Generated: ${reportDate}`, pageWidth - 14, 14, { align: 'right' })
  doc.text(`Period: ${periodLabel}`, pageWidth - 14, 21, { align: 'right' })

  // 2. Summary KPI Cards
  let startY = 36
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59) // Slate 800
  doc.text('Financial Summary', 14, startY)

  startY += 5

  const boxWidth = (pageWidth - 28 - 12) / 3
  const boxHeight = 22

  // Net Balance Box
  doc.setFillColor(248, 250, 252) // Slate 50
  doc.setDrawColor(226, 232, 240) // Slate 200
  doc.roundedRect(14, startY, boxWidth, boxHeight, 3, 3, 'FD')

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.text('NET BALANCE', 18, startY + 7)

  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  const isPositive = stats.totalBalance >= 0
  if (isPositive) {
    doc.setTextColor(22, 163, 74)
  } else {
    doc.setTextColor(220, 38, 38)
  }
  doc.text(formatIdrCurrency(stats.totalBalance), 18, startY + 16)

  // Total Income Box
  const incomeX = 14 + boxWidth + 6
  doc.setFillColor(240, 253, 244) // Green 50
  doc.setDrawColor(187, 247, 208) // Green 200
  doc.roundedRect(incomeX, startY, boxWidth, boxHeight, 3, 3, 'FD')

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(22, 101, 52)
  doc.text('TOTAL INCOME', incomeX + 4, startY + 7)

  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(22, 163, 74)
  doc.text(formatIdrCurrency(stats.totalIncome), incomeX + 4, startY + 16)

  // Total Expense Box
  const expenseX = incomeX + boxWidth + 6
  doc.setFillColor(254, 242, 242) // Red 50
  doc.setDrawColor(254, 202, 202) // Red 200
  doc.roundedRect(expenseX, startY, boxWidth, boxHeight, 3, 3, 'FD')

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(153, 27, 27)
  doc.text('TOTAL EXPENSE', expenseX + 4, startY + 7)

  doc.setFontSize(10.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(220, 38, 38)
  doc.text(formatIdrCurrency(stats.totalExpenses), expenseX + 4, startY + 16)

  startY += boxHeight + 10

  // 3. Category Expense Breakdown Table
  if (categoryBreakdown && categoryBreakdown.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 41, 59)
    doc.text('Category Expense Breakdown', 14, startY)
    startY += 3

    const totalExpenseValue = categoryBreakdown.reduce((acc, curr) => acc + curr.value, 0)

    const catTableRows = categoryBreakdown.map((item) => {
      const percentage = totalExpenseValue > 0 ? ((item.value / totalExpenseValue) * 100).toFixed(1) : '0.0'
      return [item.name, formatIdrCurrency(item.value), `${percentage}%`]
    })

    autoTable(doc, {
      startY: startY,
      head: [['Category', 'Total Spent', 'Share (%)']],
      body: catTableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'right', cellWidth: 45 },
        2: { halign: 'right', cellWidth: 35 },
      },
      margin: { left: 14, right: 14 },
    })

    startY = (doc as any).lastAutoTable.finalY + 10
  }

  // 4. Detailed Itemized Transactions Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text(`Itemized Transactions (${transactions.length} Records)`, 14, startY)
  startY += 3

  const txRows = transactions.map((tx) => {
    const formattedDate = new Date(tx.transactionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    const catName = tx.category?.name || 'Uncategorized'
    const pm = tx.paymentMethod.replace('_', ' ')
    const note = tx.note || '-'
    const amtStr = `${tx.type === 'INCOME' ? '+' : '-'}${formatIdrCurrency(Number(tx.amount))}`

    return [formattedDate, tx.type, catName, pm, note, amtStr]
  })

  autoTable(doc, {
    startY: startY,
    head: [['Date', 'Type', 'Category', 'Payment Method', 'Note', 'Amount']],
    body: txRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 28 },
      4: { cellWidth: 'auto' },
      5: { halign: 'right', cellWidth: 34, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const typeVal = data.row.raw[1]
        if (typeVal === 'INCOME') {
          if (data.column.index === 1 || data.column.index === 5) {
            data.cell.styles.textColor = [22, 163, 74]
          }
        } else if (typeVal === 'EXPENSE') {
          if (data.column.index === 1 || data.column.index === 5) {
            data.cell.styles.textColor = [220, 38, 38]
          }
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 20 },
  })

  // 5. Add Footer with Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)

    doc.setDrawColor(226, 232, 240)
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12)

    doc.text(`Meyker Financial Tracker • ${periodLabel} Statement`, 14, pageHeight - 7)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: 'right' })
  }

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
