import { describe, it, expect } from 'vitest'
import { generateFallbackMockReceiptData, parseRawOcrText, cleanIdrAmountString } from '../geminiOcr'

describe('geminiOcr', () => {
  it('cleanIdrAmountString correctly handles IDR rupiah formatted strings with comma cents', () => {
    expect(cleanIdrAmountString('RP 280.000,00')).toBe(280000)
    expect(cleanIdrAmountString('Rp 280.000,50')).toBe(280000)
    expect(cleanIdrAmountString('1.500.000,00')).toBe(1500000)
    expect(cleanIdrAmountString('50.000,-')).toBe(50000)
  })

  it('generates structured fallback receipt mock data when API key is missing', async () => {
    const mockData = generateFallbackMockReceiptData()
    expect(mockData.amount).toBe(85000)
    expect(mockData.type).toBe('EXPENSE')
    expect(mockData.categoryHint).toBe('Food & Dining')
    expect(mockData.paymentMethod).toBe('E_WALLET')
  })

  it('correctly parses raw OCR text lines into structured receipt data', () => {
    const rawOcr = `Kopi Kenangan Sudirman
1x Americano Hot  25.000
1x Roti Cokelat    15.000
-----------------------
TOTAL           40.000
Pembayaran: QRIS BCA`

    const parsed = parseRawOcrText(rawOcr)
    expect(parsed.amount).toBe(40000)
    expect(parsed.type).toBe('EXPENSE')
    expect(parsed.paymentMethod).toBe('E_WALLET')
    expect(parsed.categoryHint).toBe('Food & Dining')
    expect(parsed.merchantName).toBe('Kopi Kenangan Sudirman')
  })

  it('correctly parses bank transfer income OCR text with IDR comma cents format', () => {
    const rawOcr = `TRANSFER MASUK SUCCESSFUL
Nominal: Rp 280.000,00
Dari: Budi Santoso
Bank: BCA`

    const parsed = parseRawOcrText(rawOcr)
    expect(parsed.amount).toBe(280000)
    expect(parsed.type).toBe('INCOME')
    expect(parsed.paymentMethod).toBe('BANK_TRANSFER')
  })
})
