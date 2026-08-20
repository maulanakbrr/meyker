import { describe, it, expect } from 'vitest'
import {
  getDateRangeForPreset,
  isDateInRange,
  formatShortDate,
} from '../dateUtils'

describe('dateUtils', () => {
  it('correctly calculates date range for TODAY preset', () => {
    const range = getDateRangeForPreset('TODAY')
    const today = new Date().toISOString().slice(0, 10)
    expect(range.startDate).toBe(today)
    expect(range.endDate).toBe(today)
    expect(range.label).toBe('Today')
  })

  it('correctly calculates date range for THIS_MONTH preset', () => {
    const range = getDateRangeForPreset('THIS_MONTH')
    expect(range.startDate).toContain('-01')
    expect(range.label).toBe('This Month')
  })

  it('correctly calculates ALL_TIME preset', () => {
    const range = getDateRangeForPreset('ALL_TIME')
    expect(range.startDate).toBeNull()
    expect(range.endDate).toBeNull()
    expect(range.label).toBe('All Time')
  })

  it('correctly checks if transaction date falls in range', () => {
    const range = getDateRangeForPreset('CUSTOM', '2026-07-01', '2026-07-31')
    expect(isDateInRange('2026-07-15T10:00:00.000Z', range)).toBe(true)
    expect(isDateInRange('2026-08-01T10:00:00.000Z', range)).toBe(false)
    expect(isDateInRange('2026-06-30T10:00:00.000Z', range)).toBe(false)
  })

  it('formats short dates nicely', () => {
    expect(formatShortDate('2026-07-15')).toBe('Jul 15, 2026')
  })
})
