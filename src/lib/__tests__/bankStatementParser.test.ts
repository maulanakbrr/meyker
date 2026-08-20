import { describe, it, expect } from 'vitest'
import {
  detectBankFormat,
  mapRowsToTransactions,
  parseFlexibleDate,
} from '../bankStatementParser'

describe('bankStatementParser', () => {
  it('correctly auto-detects BCA statement headers', () => {
    const headers = ['Tanggal', 'Keterangan', 'CB', 'Mutasi', 'Saldo']
    const detected = detectBankFormat(headers)
    expect(detected.preset).toBe('BCA')
    expect(detected.mapping.dateColumn).toBe('Tanggal')
    expect(detected.mapping.descriptionColumn).toBe('Keterangan')
    expect(detected.mapping.amountColumn).toBe('Mutasi')
  })

  it('correctly auto-detects Mandiri statement headers', () => {
    const headers = ['Tanggal Transaksi', 'Uraian', 'Debet', 'Kredit', 'Saldo']
    const detected = detectBankFormat(headers)
    expect(detected.preset).toBe('MANDIRI')
    expect(detected.mapping.dateColumn).toBe('Tanggal Transaksi')
    expect(detected.mapping.descriptionColumn).toBe('Uraian')
    expect(detected.mapping.debitColumn).toBe('Debet')
    expect(detected.mapping.creditColumn).toBe('Kredit')
  })

  it('correctly maps BCA mutasi rows with CR (Income) and DB (Expense)', () => {
    const headers = ['Tanggal', 'Keterangan', 'Mutasi']
    const { mapping } = detectBankFormat(headers)
    const rawRows = [
      { Tanggal: '20/08/2026', Keterangan: 'Gaji Bulanan PT Abadi', Mutasi: '15.000.000,00 CR' },
      { Tanggal: '21/08/2026', Keterangan: 'Supermarket Belanja', Mutasi: '280.000,00 DB' },
    ]

    const txs = mapRowsToTransactions(rawRows, mapping)
    expect(txs.length).toBe(2)

    expect(txs[0].date).toBe('2026-08-20')
    expect(txs[0].note).toBe('Gaji Bulanan PT Abadi')
    expect(txs[0].amount).toBe(15000000)
    expect(txs[0].type).toBe('INCOME')

    expect(txs[1].date).toBe('2026-08-21')
    expect(txs[1].note).toBe('Supermarket Belanja')
    expect(txs[1].amount).toBe(280000)
    expect(txs[1].type).toBe('EXPENSE')
  })

  it('correctly maps Mandiri debet/kredit columns', () => {
    const headers = ['Tanggal Transaksi', 'Uraian', 'Debet', 'Kredit']
    const { mapping } = detectBankFormat(headers)
    const rawRows = [
      { 'Tanggal Transaksi': '2026-08-15', Uraian: 'Transfer Masuk Budi', Debet: '0', Kredit: '500.000,00' },
      { 'Tanggal Transaksi': '2026-08-16', Uraian: 'Bensin Pertamina', Debet: '150.000,00', Kredit: '0' },
    ]

    const txs = mapRowsToTransactions(rawRows, mapping)
    expect(txs[0].amount).toBe(500000)
    expect(txs[0].type).toBe('INCOME')

    expect(txs[1].amount).toBe(150000)
    expect(txs[1].type).toBe('EXPENSE')
  })

  it('parses flexible date strings accurately', () => {
    expect(parseFlexibleDate('20/08/2026')).toBe('2026-08-20')
    expect(parseFlexibleDate('2026-08-20')).toBe('2026-08-20')
    expect(parseFlexibleDate('01/12/2025')).toBe('2025-12-01')
  })
})
