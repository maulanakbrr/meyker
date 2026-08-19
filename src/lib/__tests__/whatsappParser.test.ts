import { describe, it, expect } from 'vitest'
import { parseWhatsAppText } from '../whatsappParser'

describe('parseWhatsAppText', () => {
  it('parses basic expense with k multiplier and hashtag category', () => {
    const result = parseWhatsAppText('50k lunch #food')
    expect(result.amount).toBe(50000)
    expect(result.type).toBe('EXPENSE')
    expect(result.categoryHint).toBe('food')
    expect(result.note).toBe('lunch')
  })

  it('parses expense with Indonesian rb unit and payment method keyword', () => {
    const result = parseWhatsAppText('25rb kopi janji jiwa via gopay')
    expect(result.amount).toBe(25000)
    expect(result.type).toBe('EXPENSE')
    expect(result.paymentMethod).toBe('E_WALLET')
    expect(result.note).toBe('kopi janji jiwa via gopay')
  })

  it('parses income message with jt unit and salary keyword', () => {
    const result = parseWhatsAppText('1.5jt gaji bulanan #income via transfer')
    expect(result.amount).toBe(1500000)
    expect(result.type).toBe('INCOME')
    expect(result.categoryHint).toBe('income')
    expect(result.paymentMethod).toBe('BANK_TRANSFER')
    expect(result.note).toBe('gaji bulanan via transfer')
  })

  it('parses Rp formatted amounts', () => {
    const result = parseWhatsAppText('Rp 75.000 makan malam bersama keluarga')
    expect(result.amount).toBe(75000)
    expect(result.type).toBe('EXPENSE')
    expect(result.note).toBe('makan malam bersama keluarga')
  })

  it('parses standalone numbers for expense', () => {
    const result = parseWhatsAppText('15000 bensin motor')
    expect(result.amount).toBe(15000)
    expect(result.type).toBe('EXPENSE')
    expect(result.note).toBe('bensin motor')
  })

  it('throws error when no amount can be extracted', () => {
    expect(() => parseWhatsAppText('hello world text without numbers')).toThrow(
      'Unable to extract valid transaction amount'
    )
  })
})
